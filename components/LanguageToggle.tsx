"use client";

import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/messages";

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();
  const next: Locale = locale === "en" ? "zh" : "en";
  const visibleLabel = locale === "en" ? "中文" : "ENG";

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={locale === "en" ? t("language.ariaToZh") : t("language.ariaToEn")}
      className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-[color:var(--foreground-muted)] decoration-[color:var(--border)] underline-offset-[6px] transition-colors hover:text-[color:var(--foreground)] hover:underline"
      suppressHydrationWarning
    >
      {visibleLabel}
    </button>
  );
}
