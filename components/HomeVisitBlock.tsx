"use client";

import { getContactPhoneDisplay } from "@/lib/config";
import { useI18n } from "@/lib/i18n";
import { getPopupScheduleLinesForLocale } from "@/lib/popupDisplay";

const footerAddressKeys = ["footer.addressLine1", "footer.addressLine2", "footer.addressLine3"] as const;

/**
 * Bottom-of-page visit summary (duplicates hero rail info for scrollers).
 */
export function HomeVisitBlock() {
  const { locale, t } = useI18n();
  const schedule = getPopupScheduleLinesForLocale(locale);
  const phone = getContactPhoneDisplay();

  return (
    <aside className="w-full border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-8">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
        {t("visitBlock.hours")}
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
            {t("visitBlock.contact")}
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
        {t("visitBlock.address")}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[color:var(--foreground)]">
        {footerAddressKeys.map((key) => (
          <span key={key} className="block">
            {t(key)}
          </span>
        ))}
      </p>
    </aside>
  );
}
