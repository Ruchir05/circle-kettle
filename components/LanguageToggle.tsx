"use client";

import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/messages";

const locales: Locale[] = ["en", "zh"];

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className="inline-flex h-9 shrink-0 items-center overflow-hidden rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-sm"
      suppressHydrationWarning
    >
      {locales.map((id) => {
        const active = locale === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setLocale(id)}
            aria-pressed={active}
            className={`px-2.5 text-xs font-semibold tracking-tight transition-colors sm:px-3 ${
              active
                ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
                : "text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
            }`}
          >
            {t(`language.${id}`)}
          </button>
        );
      })}
    </div>
  );
}
