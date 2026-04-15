import { DateTime } from "luxon";
import { POPUP_EVENT_DATE, POPUP_HOURS, POPUP_TIMEZONE } from "./config";

export type PopupScheduleLines = {
  dateLine: string;
  timeLine: string;
  reservationNote: string;
};

export function getPopupScheduleLines(): PopupScheduleLines {
  const zone: string = POPUP_TIMEZONE;
  const day = DateTime.fromISO(POPUP_EVENT_DATE, { zone });
  if (!day.isValid) {
    return {
      dateLine: "Saturday, April 18, 2026",
      timeLine: "1:00 PM–5:00 PM Central",
      reservationNote: "30-minute reservations · up to 4 guests",
    };
  }

  const dateLine = day.toFormat("cccc, LLLL d, yyyy");
  const start = day.set({
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
  const tzLabel =
    zone === "America/Chicago" ? "Central" : zone.split("/").pop()?.replace(/_/g, " ") ?? "";
  const timeLine = `${start.toFormat("h:mm a")}–${end.toFormat("h:mm a")} ${tzLabel}`.trim();

  return {
    dateLine,
    timeLine,
    reservationNote: "30-minute reservations · up to 4 guests",
  };
}
