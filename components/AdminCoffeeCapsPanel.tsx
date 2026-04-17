"use client";

import { updateCoffeeCupMax } from "@/app/actions/adminCoffeeCaps";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export type AdminCoffeeCapRow = {
  slug: string;
  label: string;
  maxCups: number;
  /** Omitted when live availability RPC fails; caps can still be edited. */
  booked?: number;
  remaining?: number;
};

export function AdminCoffeeCapsPanel({
  rows,
  countsWarning,
}: {
  rows: AdminCoffeeCapRow[];
  countsWarning?: string | null;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.slug, String(r.maxCups)])),
  );
  const [errorBySlug, setErrorBySlug] = useState<Record<string, string | null>>({});

  useEffect(() => {
    setDrafts(Object.fromEntries(rows.map((r) => [r.slug, String(r.maxCups)])));
    setErrorBySlug({});
  }, [rows]);

  return (
    <section className="rounded border border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="border-b border-[color:var(--border)] px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight">{t("admin.coffeeCapsTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--foreground-muted)]">
          {t("admin.coffeeCapsHelp")}
        </p>
        {countsWarning ? (
          <p className="mt-3 text-sm text-amber-800" role="status">
            {countsWarning}
          </p>
        ) : null}
      </div>
      <ul className="divide-y divide-[color:var(--border)]">
        {rows.map((row) => {
          const draft = drafts[row.slug] ?? String(row.maxCups);
          return (
            <li key={row.slug} className="flex flex-col gap-2 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[color:var(--foreground)]">{row.label}</p>
                <p className="mt-1 font-mono text-xs text-[color:var(--foreground-muted)]">{row.slug}</p>
                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[color:var(--foreground-muted)]">
                  <div>
                    <dt className="inline font-semibold uppercase tracking-[0.12em]">
                      {t("admin.bookedLabel")}:{" "}
                    </dt>
                    <dd className="inline tabular-nums text-[color:var(--foreground)]">
                      {row.booked !== undefined ? row.booked : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold uppercase tracking-[0.12em]">
                      {t("admin.remainingLabel")}:{" "}
                    </dt>
                    <dd className="inline tabular-nums text-[color:var(--foreground)]">
                      {row.remaining !== undefined ? row.remaining : "—"}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-wrap items-end gap-3 sm:shrink-0">
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground-muted)]">
                  {t("admin.maxCupsLabel")}
                  <input
                    type="number"
                    min={0}
                    max={99999}
                    inputMode="numeric"
                    value={draft}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [row.slug]: e.target.value,
                      }))
                    }
                    className="form-field mt-2 block w-[8.5rem] rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--foreground)] shadow-none outline-none focus:border-[color:var(--foreground)]/30"
                  />
                </label>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setErrorBySlug((prev) => ({ ...prev, [row.slug]: null }));
                    startTransition(async () => {
                      const result = await updateCoffeeCupMax(row.slug, draft);
                      if (!result.ok) {
                        setErrorBySlug((prev) => ({ ...prev, [row.slug]: result.error }));
                        return;
                      }
                      router.refresh();
                    });
                  }}
                  className="text-sm font-medium text-[color:var(--foreground-muted)] underline decoration-[color:var(--border)] underline-offset-[5px] transition-colors hover:text-[color:var(--foreground)] hover:decoration-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {pending ? t("admin.saving") : t("admin.save")}
                </button>
              </div>
              </div>
              {errorBySlug[row.slug] ? (
                <p className="text-sm text-red-800" role="alert">
                  {errorBySlug[row.slug]}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
