"use server";

import { isValidCoffeeChoiceField, parseCoffeeChoiceJson } from "@/lib/coffees";
import { getMaxPeoplePerSlot } from "@/lib/config";
import { isValidSlotStart } from "@/lib/schedule";
import { createServiceClient } from "@/lib/supabase/service";
import { z, type ZodIssue } from "zod";

export type BookingState = {
  ok: boolean;
  message: string;
  bookingId?: string;
};

const guestName = z.string().trim().min(1).max(120);

const schema = z.object({
  slot_start: z.string().min(1),
  party_size: z.coerce.number().int().min(1).max(4),
  coffee_choice: z.string().min(1).max(2000),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  /** Allow empty strings from optional form fields (Zod optional() still rejects `""` for strings with implicit rules in some cases). */
  phone: z.string().trim().max(40),
  notes: z.string().trim().max(500),
  guest_name_2: z.string().trim().max(120),
  guest_name_3: z.string().trim().max(120),
  guest_name_4: z.string().trim().max(120),
});

function messageForSchemaIssues(issues: readonly ZodIssue[]): string | null {
  /** Report the first field error only (avoids blaming the slot when another field failed first). */
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    switch (key) {
      case "slot_start":
        return "Please choose a timeslot.";
      case "name":
        return "Please enter your name.";
      case "email":
        return "Please enter a valid email address.";
      case "coffee_choice":
        return "Please choose at least one coffee from the list (quantity 1–4 per selection).";
      case "party_size":
        return "Please choose a party size between 1 and 4.";
      default:
        break;
    }
  }
  return null;
}

export async function submitBooking(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const honeypot = String(formData.get("website") ?? "");
  if (honeypot.trim().length > 0) {
    return { ok: true, message: "Thanks — you are booked." };
  }

  const parsed = schema.safeParse({
    slot_start: String(formData.get("slot_start") ?? ""),
    party_size: formData.get("party_size"),
    coffee_choice: String(formData.get("coffee_choice") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    guest_name_2: String(formData.get("guest_name_2") ?? ""),
    guest_name_3: String(formData.get("guest_name_3") ?? ""),
    guest_name_4: String(formData.get("guest_name_4") ?? ""),
  });

  if (!parsed.success) {
    const friendly = messageForSchemaIssues(parsed.error.issues);
    return {
      ok: false,
      message: friendly ?? parsed.error.issues.map((i) => i.message).join(" "),
    };
  }

  const data = parsed.data;
  if (!isValidSlotStart(data.slot_start)) {
    return { ok: false, message: "Please choose a valid timeslot." };
  }
  if (!isValidCoffeeChoiceField(data.coffee_choice)) {
    return {
      ok: false,
      message: "Please choose at least one coffee from the list (quantity 1–4 per selection).",
    };
  }

  const choiceJson = parseCoffeeChoiceJson(data.coffee_choice);
  if (choiceJson && !choiceJson.unsure) {
    const sumQty = choiceJson.items.reduce((s, i) => s + i.qty, 0);
    if (sumQty > data.party_size) {
      return { ok: false, message: "Total tasting quantities cannot exceed party size." };
    }
  }

  if (data.party_size >= 2) {
    const g2 = guestName.safeParse(data.guest_name_2 ?? "");
    if (!g2.success) {
      return { ok: false, message: "Please enter every guest’s full name (guest 2)." };
    }
  }
  if (data.party_size >= 3) {
    const g3 = guestName.safeParse(data.guest_name_3 ?? "");
    if (!g3.success) {
      return { ok: false, message: "Please enter every guest’s full name (guest 3)." };
    }
  }
  if (data.party_size >= 4) {
    const g4 = guestName.safeParse(data.guest_name_4 ?? "");
    if (!g4.success) {
      return { ok: false, message: "Please enter every guest’s full name (guest 4)." };
    }
  }

  const client = createServiceClient();
  if (!client) {
    return {
      ok: false,
      message: "Bookings are not configured yet. Add Supabase keys to enable reservations.",
    };
  }

  const { data: bookingId, error } = await client.rpc("create_booking", {
    p_slot_start: data.slot_start,
    p_party_size: data.party_size,
    p_coffee_choice: data.coffee_choice,
    p_name: data.name,
    p_email: data.email,
    p_phone: data.phone?.trim() ? data.phone.trim() : null,
    p_notes: data.notes?.trim() ? data.notes.trim() : null,
    p_max_capacity: getMaxPeoplePerSlot(),
    p_guest_name_2: data.party_size >= 2 ? (data.guest_name_2?.trim() ?? null) : null,
    p_guest_name_3: data.party_size >= 3 ? (data.guest_name_3?.trim() ?? null) : null,
    p_guest_name_4: data.party_size >= 4 ? (data.guest_name_4?.trim() ?? null) : null,
  });

  if (error) {
    const msg = error.message ?? "";
    if (
      msg.includes("create_booking") &&
      (msg.includes("schema cache") || msg.includes("Could not find the function"))
    ) {
      return {
        ok: false,
        message:
          "Supabase rejected the booking RPC (often the CLI pushed migrations to a different project than `NEXT_PUBLIC_SUPABASE_URL`). Run `npm run supabase:link` then `npm run supabase:db:push`, or push to every remote with `npm run supabase:db:push:all`. If the URL project is already migrated, run the migration SQL `supabase/migrations/20260414140000_coffee_inventory_guests.sql` in that project’s SQL editor.",
      };
    }
    if (msg.includes("slot_full")) {
      return {
        ok: false,
        message: "That slot just filled up. Please pick another time.",
      };
    }
    if (msg.includes("already_booked")) {
      return {
        ok: false,
        message: "This email already has a reservation. One booking per guest.",
      };
    }
    if (msg.includes("coffee_sold_out")) {
      return {
        ok: false,
        message: "One of the coffees you picked just sold out. Adjust quantities or pick another lot.",
      };
    }
    if (msg.includes("guest_names_required")) {
      return {
        ok: false,
        message: "Please enter every guest’s full name for your party size.",
      };
    }
    const hint = [error.message, (error as { details?: string }).details]
      .filter(Boolean)
      .join(" — ")
      .slice(0, 280);
    return {
      ok: false,
      message: hint
        ? `Could not complete booking: ${hint}`
        : "We could not complete the booking. Please try again.",
    };
  }

  const id =
    typeof bookingId === "string"
      ? bookingId
      : bookingId != null
        ? String(bookingId)
        : undefined;
  if (!id) {
    return {
      ok: false,
      message:
        "Booking did not return a confirmation id. Check that the SQL migration ran in this Supabase project.",
    };
  }

  return {
    ok: true,
    message: "You are booked. See you at Circle Kettle.",
    bookingId: id,
  };
}
