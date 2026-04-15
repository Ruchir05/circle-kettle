"use client";

import { useI18n } from "@/lib/i18n";

export function HomePhilosophy() {
  const { t } = useI18n();

  return (
    <>
      <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
        {t("home.calmTitle")}
      </h2>
      <p className="mt-6 text-base leading-relaxed text-[color:var(--foreground-muted)]">
        {t("home.calmBody")}
      </p>
    </>
  );
}
