/** IANA timezone for slot boundaries (Urbana / UIUC). */
export const POPUP_TIMEZONE = "America/Chicago";

/** Single popup date (calendar day in POPUP_TIMEZONE). Saturday, April 18, 2026. */
export const POPUP_EVENT_DATE = "2026-04-18";

/** Max total people per 30-minute slot (shared bookings). */
export function getMaxPeoplePerSlot(): number {
  const raw = process.env.BOOKING_SLOT_CAPACITY;
  if (raw == null || raw === "") return 4;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 4;
}

/** Event hours in local wall time (POPUP_TIMEZONE), on POPUP_EVENT_DATE only. */
export const POPUP_HOURS = {
  startHour: 13,
  startMinute: 0,
  endHour: 17,
  endMinute: 0,
} as const;

/** Venue lines for display (hero banner, footer, etc.). */
export const POPUP_VENUE_ADDRESS_LINES = [
  "1004 W Main Street",
  "Urbana, IL 61801",
  "Unit 204",
] as const;

/**
 * Optional public phone for the popup (set in `.env.local`).
 * Example: NEXT_PUBLIC_CONTACT_PHONE=(217) 555-0123
 */
export function getContactPhoneDisplay(): string | null {
  const raw = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();
  return raw && raw.length > 0 ? raw : null;
}
