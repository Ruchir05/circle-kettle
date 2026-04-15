"use client";

import { useI18n } from "@/lib/i18n";

export function BookPageHeader() {
  const { t } = useI18n();
  const intro = t("bookPage.intro", { address: t("bookPage.introAddress") });

  return (
    <header className="max-w-2xl">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--foreground-muted)]">
        {t("bookPage.kicker")}
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-5xl">
        {t("bookPage.title")}
      </h1>
      <p className="mt-6 text-base leading-relaxed text-[color:var(--foreground-muted)]">{intro}</p>
    </header>
  );
}
