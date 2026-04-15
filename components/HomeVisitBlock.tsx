import { getContactPhoneDisplay, POPUP_VENUE_ADDRESS_LINES } from "@/lib/config";
import { getPopupScheduleLines } from "@/lib/popupDisplay";

/**
 * Bottom-of-page visit summary (duplicates hero rail info for scrollers).
 */
export function HomeVisitBlock() {
  const schedule = getPopupScheduleLines();
  const phone = getContactPhoneDisplay();

  return (
    <aside className="w-full border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-8">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
        Hours
      </h3>
      <p className="mt-4 text-sm leading-relaxed text-[color:var(--foreground)]">
        {schedule.dateLine}
        <br />
        {schedule.timeLine}
        <br />
        {schedule.reservationNote}
      </p>

      {phone ? (
        <>
          <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
            Contact
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--foreground)]">
            <a
              href={`tel:${phone.replace(/\D/g, "")}`}
              className="underline decoration-[color:var(--border)] underline-offset-[4px] transition-colors hover:decoration-[color:var(--foreground)]"
            >
              {phone}
            </a>
          </p>
        </>
      ) : null}

      <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
        Address
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[color:var(--foreground)]">
        {POPUP_VENUE_ADDRESS_LINES.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
    </aside>
  );
}
