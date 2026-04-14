import { DateTime } from "luxon";
import { POPUP_EVENT_DATE, POPUP_HOURS, POPUP_TIMEZONE } from "@/lib/config";

const SLOT_MINUTES = 30;

/**
 * Returns ISO strings (UTC) for each 30-min slot start on the given calendar day
 * in POPUP_TIMEZONE, only for POPUP_EVENT_DATE and within POPUP_HOURS.
 */
export function getSlotStartsForCalendarDay(
  calendarDayISO: string,
  timeZone: string = POPUP_TIMEZONE,
): string[] {
  if (calendarDayISO !== POPUP_EVENT_DATE) return [];

  const day = DateTime.fromISO(calendarDayISO, { zone: timeZone });
  if (!day.isValid) return [];

  let t = day.set({
    hour: POPUP_HOURS.startHour,
    minute: POPUP_HOURS.startMinute,
    second: 0,
    millisecond: 0,
  });
  const end = day.set({
    hour: POPUP_HOURS.endHour,
    minute: POPUP_HOURS.endMinute,
    second: 0,
    millisecond: 0,
  });

  const slots: string[] = [];
  while (t < end) {
    slots.push(t.toUTC().toISO()!);
    t = t.plus({ minutes: SLOT_MINUTES });
  }
  return slots;
}

/** Calendar day string (YYYY-MM-DD) in POPUP_TIMEZONE for `date` (typically "today"). */
export function getCalendarDayISOInZone(
  date: Date,
  timeZone: string = POPUP_TIMEZONE,
): string {
  return DateTime.fromJSDate(date, { zone: "utc" })
    .setZone(timeZone)
    .toISODate()!;
}

/** True if `slotStartISO` is one of the valid slot starts for the event day. */
export function isValidSlotStart(slotStartISO: string): boolean {
  const utc = DateTime.fromISO(slotStartISO, { zone: "utc" });
  if (!utc.isValid) return false;
  const local = utc.setZone(POPUP_TIMEZONE);
  const day = local.toISODate()!;
  const allowed = getSlotStartsForCalendarDay(day, POPUP_TIMEZONE);
  return allowed.includes(utc.toISO()!);
}
