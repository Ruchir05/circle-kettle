"use server";

import { isCoffeeSlugOrUnsure } from "@/lib/coffees";
import { getMaxPeoplePerSlot } from "@/lib/config";
import { isValidSlotStart } from "@/lib/schedule";
import { createServiceClient } from "@/lib/supabase/service";
import { z } from "zod";

export type BookingState = {
  ok: boolean;
  message: string;
  bookingId?: string;
};

const schema = z.object({
  slot_start: z.string().min(1),
  party_size: z.coerce.number().int().min(1).max(4),
  coffee_choice: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(500).optional(),
});

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
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues.map((i) => i.message).join(" "),
    };
  }

  const data = parsed.data;
  if (!isValidSlotStart(data.slot_start)) {
    return { ok: false, message: "Please choose a valid timeslot." };
  }
  if (!isCoffeeSlugOrUnsure(data.coffee_choice)) {
    return { ok: false, message: "Please choose a coffee from the list (or Unsure)." };
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
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("slot_full")) {
      return {
        ok: false,
        message: "That slot just filled up. Please pick another time.",
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
