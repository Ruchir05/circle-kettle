import { POPUP_TIMEZONE, getMaxPeoplePerSlot } from "@/lib/config";
import { getSlotStartsForCalendarDay } from "@/lib/schedule";
import { createAnonClient } from "@/lib/supabase/public";
import { DateTime } from "luxon";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizeInstant(iso: string): string {
  return DateTime.fromISO(iso, { zone: "utc" }).toISO()!;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const slots = getSlotStartsForCalendarDay(date);
  const cap = getMaxPeoplePerSlot();
  const dayStart = DateTime.fromISO(date, { zone: POPUP_TIMEZONE }).startOf("day");
  const rangeStart = dayStart.toUTC().toISO();
  const rangeEnd = dayStart.plus({ days: 1 }).toUTC().toISO();

  const bookedBySlot = new Map<string, number>();
  const client = createAnonClient();
  if (client && rangeStart && rangeEnd) {
    const { data, error } = await client.rpc("get_slot_booked_totals", {
      p_range_start: rangeStart,
      p_range_end: rangeEnd,
    });
    if (!error && Array.isArray(data)) {
      for (const row of data as { slot_start: string; booked: number }[]) {
        bookedBySlot.set(normalizeInstant(row.slot_start), row.booked);
      }
    }
  }

  const payload = slots.map((iso) => {
    const key = normalizeInstant(iso);
    const booked = bookedBySlot.get(key) ?? 0;
    return {
      slot_start: iso,
      booked,
      capacity: cap,
      remaining: Math.max(0, cap - booked),
    };
  });

  return NextResponse.json({
    date,
    slots: payload,
    demo: !client,
  });
}
