"use server";

import {
  ADMIN_COOKIE_NAME,
  getAdminTokenSecret,
  verifyAdminSessionToken,
} from "@/lib/admin/token";
import { getMaxPeoplePerSlot } from "@/lib/config";
import {
  getBookingCoffeeLineItems,
  isValidCoffeeChoiceForAdmin,
  parseCoffeeChoiceJson,
  sumBookingCoffeeQty,
} from "@/lib/coffees";
import { createServiceClient } from "@/lib/supabase/service";
import { isValidSlotStart } from "@/lib/schedule";
import { DateTime } from "luxon";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function assertAdminSession(): Promise<{ ok: false; error: string } | { ok: true }> {
  const secret = getAdminTokenSecret();
  if (!secret) return { ok: false, error: "Admin session is not configured." };
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !(await verifyAdminSessionToken(token, secret))) {
    return { ok: false, error: "Unauthorized." };
  }
  return { ok: true };
}

export type DeleteBookingResult = { ok: true } | { ok: false; error: string };

/** Deletes a row from `bookings` (service role). Caller must be an authenticated admin. */
export async function deleteBookingById(bookingId: string): Promise<DeleteBookingResult> {
  const auth = await assertAdminSession();
  if (!auth.ok) return { ok: false, error: auth.error };

  const id = bookingId.trim();
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid booking id." };

  const client = createServiceClient();
  if (!client) return { ok: false, error: "Supabase is not configured on the server." };

  const { data, error } = await client.from("bookings").delete().eq("id", id).select("id");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "No booking matched that id (it may already be deleted)." };

  revalidatePath("/admin");
  revalidatePath("/book");

  return { ok: true };
}

function normalizeSlotInstant(iso: string): string {
  return DateTime.fromISO(iso, { zone: "utc" }).toISO()!;
}

function trimGuest(s: string | undefined): string {
  return String(s ?? "").trim();
}

export type AdminBookingUpdatePayload = {
  slot_start: string;
  party_size: number;
  coffee_choice: string;
  notes: string;
  guest_name_2: string;
  guest_name_3: string;
  guest_name_4: string;
};

export type UpdateBookingResult = { ok: true } | { ok: false; error: string };

/**
 * Updates a confirmed booking (slot, party size, coffee choice, notes, guest names).
 * Re-validates slot capacity and coffee cup caps excluding this booking’s current consumption.
 */
export async function updateBookingAdmin(
  bookingId: string,
  payload: AdminBookingUpdatePayload,
): Promise<UpdateBookingResult> {
  const auth = await assertAdminSession();
  if (!auth.ok) return { ok: false, error: auth.error };

  const id = bookingId.trim();
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid booking id." };

  const client = createServiceClient();
  if (!client) return { ok: false, error: "Supabase is not configured on the server." };

  const { data: existingRows, error: loadError } = await client
    .from("bookings")
    .select(
      "id, slot_start, party_size, coffee_choice, name, email, phone, notes, status, guest_name_2, guest_name_3, guest_name_4",
    )
    .eq("id", id)
    .limit(1);

  if (loadError) return { ok: false, error: loadError.message };
  const existing = existingRows?.[0] as
    | {
        id: string;
        slot_start: string;
        party_size: number;
        coffee_choice: string;
        status: string;
        guest_name_2: string | null;
        guest_name_3: string | null;
        guest_name_4: string | null;
      }
    | undefined;
  if (!existing) return { ok: false, error: "Booking not found." };
  if (existing.status !== "confirmed") {
    return { ok: false, error: "Only confirmed bookings can be edited this way." };
  }

  const slot_start = payload.slot_start.trim();
  const party_size = Number(payload.party_size);
  const coffee_choice = payload.coffee_choice.trim();
  const notes = trimGuest(payload.notes);
  const g2 = trimGuest(payload.guest_name_2);
  const g3 = trimGuest(payload.guest_name_3);
  const g4 = trimGuest(payload.guest_name_4);

  if (!isValidSlotStart(slot_start)) {
    return { ok: false, error: "Please choose a valid timeslot." };
  }
  if (!Number.isInteger(party_size) || party_size < 1 || party_size > 4) {
    return { ok: false, error: "Party size must be between 1 and 4." };
  }
  if (!isValidCoffeeChoiceForAdmin(coffee_choice)) {
    return { ok: false, error: "Coffee choice is not valid." };
  }

  const items = getBookingCoffeeLineItems(party_size, coffee_choice);
  const parsed = parseCoffeeChoiceJson(coffee_choice);
  const unsure =
    coffee_choice.trim().toLowerCase() === "unsure" || parsed?.unsure === true;

  if (!unsure) {
    if (items.length === 0) {
      return { ok: false, error: "Choose at least one coffee, or use Unsure / surprise me." };
    }
    const sumQty = sumBookingCoffeeQty(items);
    if (sumQty > party_size) {
      return { ok: false, error: "Total tasting quantities cannot exceed party size." };
    }
  }

  if (party_size >= 2 && !g2) {
    return { ok: false, error: "Guest 2 name is required for this party size." };
  }
  if (party_size >= 3 && !g3) {
    return { ok: false, error: "Guest 3 name is required for this party size." };
  }
  if (party_size >= 4 && !g4) {
    return { ok: false, error: "Guest 4 name is required for this party size." };
  }
  for (const [label, v] of [
    ["Guest 2", g2],
    ["Guest 3", g3],
    ["Guest 4", g4],
  ] as const) {
    if (v.length > 120) return { ok: false, error: `${label} name is too long.` };
  }

  const { data: others, error: othersError } = await client
    .from("bookings")
    .select("id, party_size, slot_start")
    .eq("status", "confirmed")
    .neq("id", id);

  if (othersError) return { ok: false, error: othersError.message };

  const targetKey = normalizeSlotInstant(slot_start);
  const cap = getMaxPeoplePerSlot();
  let slotHeadcount = 0;
  for (const row of others ?? []) {
    if (normalizeSlotInstant(row.slot_start as string) === targetKey) {
      slotHeadcount += Number(row.party_size);
    }
  }
  if (slotHeadcount + party_size > cap) {
    return {
      ok: false,
      error: "That timeslot does not have enough remaining capacity for this party size.",
    };
  }

  if (!unsure && items.length > 0) {
    const { data: capsRows, error: capsError } = await client.from("coffee_cup_caps").select("coffee_slug, max_cups");
    if (capsError) return { ok: false, error: capsError.message };
    const capBySlug = new Map<string, number>();
    for (const r of capsRows ?? []) {
      capBySlug.set(String((r as { coffee_slug: string }).coffee_slug), Number((r as { max_cups: number }).max_cups));
    }

    const { data: allForCoffee, error: allErr } = await client
      .from("bookings")
      .select("id, party_size, coffee_choice")
      .eq("status", "confirmed")
      .neq("id", id);

    if (allErr) return { ok: false, error: allErr.message };

    const usage = new Map<string, number>();
    for (const b of allForCoffee ?? []) {
      for (const li of getBookingCoffeeLineItems(
        Number((b as { party_size: number }).party_size),
        String((b as { coffee_choice: string }).coffee_choice),
      )) {
        usage.set(li.slug, (usage.get(li.slug) ?? 0) + li.qty);
      }
    }

    for (const li of items) {
      const maxCups = capBySlug.get(li.slug);
      if (maxCups === undefined) {
        return { ok: false, error: `No cup cap configured for coffee “${li.slug}”.` };
      }
      const used = usage.get(li.slug) ?? 0;
      if (used + li.qty > maxCups) {
        return {
          ok: false,
          error: `Not enough cups left for ${li.slug} with this choice (would exceed cap).`,
        };
      }
    }
  }

  const updatePayload: Record<string, unknown> = {
    slot_start,
    party_size,
    coffee_choice,
    notes: notes.length ? notes : null,
    guest_name_2: party_size >= 2 ? g2 : null,
    guest_name_3: party_size >= 3 ? g3 : null,
    guest_name_4: party_size >= 4 ? g4 : null,
  };

  const { data: updated, error: upError } = await client
    .from("bookings")
    .update(updatePayload)
    .eq("id", id)
    .select("id");

  if (upError) return { ok: false, error: upError.message };
  if (!updated?.length) return { ok: false, error: "Update did not apply (booking may have been deleted)." };

  revalidatePath("/admin");
  revalidatePath("/book");
  revalidatePath("/");

  return { ok: true };
}
