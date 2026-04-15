"use client";

import type { Coffee } from "@/lib/coffees";
import { getCoffeeForDisplay, getCoffees } from "@/lib/coffees";
import { useI18n } from "@/lib/i18n";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function HomeBeanShowcase() {
  const { locale, t } = useI18n();
  const coffees = useMemo(() => getCoffees(locale), [locale]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const panelCoffee = useMemo(
    () => (selectedSlug ? getCoffeeForDisplay(selectedSlug, locale) : null),
    [selectedSlug, locale],
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cupMap, setCupMap] = useState<Record<string, number> | null>(null);
  const [cupsDemo, setCupsDemo] = useState(false);
  const [cupsError, setCupsError] = useState<string | null>(null);
  const titleId = useId();
  const descId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const drawerOpenRef = useRef(drawerOpen);
  /** Browser timer id (`window.setTimeout` returns a number). */
  const closeTimerRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    drawerOpenRef.current = drawerOpen;
  }, [drawerOpen]);

  const loadCupInventory = useCallback(() => {
    void (async () => {
      try {
        const res = await fetch("/api/coffee-cups", { cache: "no-store" });
        const json = (await res.json()) as {
          cups?: { coffee_slug: string; remaining: number }[];
          demo?: boolean;
          supabase_error?: string;
          message?: string;
        };
        if (!res.ok) {
          setCupsError(json.message ?? "error");
          setCupMap(null);
          return;
        }
        setCupsDemo(Boolean(json.demo));
        setCupsError(json.supabase_error ?? null);
        if (json.demo || !Array.isArray(json.cups)) {
          setCupMap(null);
          return;
        }
        const next: Record<string, number> = {};
        for (const row of json.cups) {
          next[row.coffee_slug] = Math.max(0, Number(row.remaining));
        }
        setCupMap(next);
      } catch {
        setCupsError("fetch_failed");
      }
    })();
  }, []);

  useEffect(() => {
    loadCupInventory();
  }, [loadCupInventory]);

  useEffect(() => {
    const intervalMs = 25_000;
    const interval = window.setInterval(() => loadCupInventory(), intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") loadCupInventory();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadCupInventory]);

  const openPanel = useCallback((coffee: Coffee) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setSelectedSlug(coffee.slug);
    const instant =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (instant) {
      setDrawerOpen(true);
      return;
    }
    setDrawerOpen(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setDrawerOpen(true));
    });
  }, []);

  const closePanel = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setDrawerOpen(false);

    const instant =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (instant) {
      setSelectedSlug(null);
      return;
    }

    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setSelectedSlug(null);
    }, 780);
  }, []);

  const onDrawerTransitionEnd = useCallback((e: React.TransitionEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== "transform") return;
    if (drawerOpenRef.current) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setSelectedSlug(null);
  }, []);

  useEffect(() => {
    if (!panelCoffee) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [panelCoffee, closePanel]);

  useEffect(() => {
    if (!panelCoffee || !drawerOpen) return;
    closeBtnRef.current?.focus();
  }, [panelCoffee, drawerOpen]);

  const portalTarget = typeof document !== "undefined" ? document.body : null;

  const overlay =
    panelCoffee && portalTarget ? (
      <div
        className={`fixed inset-0 z-[100] min-h-[100dvh] ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        role="presentation"
      >
        <button
          type="button"
          aria-label={t("beans.closeDetails")}
          className={`absolute inset-0 min-h-[100dvh] bg-[#1f1f1f] transition-opacity duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            drawerOpen ? "opacity-40" : "opacity-0"
          }`}
          onClick={closePanel}
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          onTransitionEnd={onDrawerTransitionEnd}
          className={`coffee-detail-drawer pointer-events-auto fixed right-0 top-0 z-[101] flex h-[100dvh] min-h-0 w-1/3 min-w-[min(100%,18rem)] flex-col border-l border-[color:var(--border)] bg-[color:var(--surface)] shadow-[-12px_0_40px_-12px_rgba(31,31,31,0.2)] transition-transform duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-6 sm:p-8">
            <div className="flex shrink-0 items-start justify-between gap-4">
              <h2 id={titleId} className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {panelCoffee.name}
              </h2>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={closePanel}
                className="shrink-0 text-sm font-medium text-[color:var(--foreground-muted)] underline decoration-[color:var(--border)] underline-offset-[5px] transition-colors hover:text-[color:var(--foreground)] hover:decoration-[color:var(--foreground)]"
              >
                {t("beans.close")}
              </button>
            </div>
            {panelCoffee.subtitle ? (
              <p className="mt-1 shrink-0 text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--foreground-muted)]">
                {panelCoffee.subtitle}
              </p>
            ) : null}
            <p id={descId} className="mt-2 shrink-0 text-sm text-[color:var(--foreground-muted)]">
              {panelCoffee.shortNotes}
            </p>
            {cupMap && !cupsDemo && Object.hasOwn(cupMap, panelCoffee.slug) ? (
              <p className="mt-3 shrink-0 text-sm font-medium text-[color:var(--foreground)]">
                {cupMap[panelCoffee.slug] <= 0
                  ? t("beans.soldOut")
                  : t("beans.cupsLeft", { count: cupMap[panelCoffee.slug] })}
              </p>
            ) : null}

            <div className="mt-6 shrink-0 overflow-hidden border border-[color:var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={panelCoffee.image}
                alt=""
                width={800}
                height={600}
                className="h-auto w-full object-cover"
              />
            </div>

            <p className="mt-6 text-base leading-relaxed">{panelCoffee.longNotes}</p>

            {(panelCoffee.origin ||
              panelCoffee.variety ||
              panelCoffee.producer ||
              panelCoffee.elevation ||
              panelCoffee.process) && (
              <dl className="mt-8 grid shrink-0 gap-6 border-t border-[color:var(--border)] pt-6">
                {panelCoffee.origin && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
                      {t("beans.origin")}
                    </dt>
                    <dd className="mt-2 text-sm">{panelCoffee.origin}</dd>
                  </div>
                )}
                {panelCoffee.variety && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
                      {t("beans.variety")}
                    </dt>
                    <dd className="mt-2 text-sm">{panelCoffee.variety}</dd>
                  </div>
                )}
                {panelCoffee.producer && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
                      {t("beans.producer")}
                    </dt>
                    <dd className="mt-2 text-sm">{panelCoffee.producer}</dd>
                  </div>
                )}
                {panelCoffee.elevation && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
                      {t("beans.elevation")}
                    </dt>
                    <dd className="mt-2 text-sm">{panelCoffee.elevation}</dd>
                  </div>
                )}
                {panelCoffee.process && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
                      {t("beans.process")}
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed">{panelCoffee.process}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </aside>
      </div>
    ) : null;

  return (
    <>
      {cupsError && !cupsDemo ? (
        <p className="mb-3 text-xs text-[color:var(--foreground-muted)]" role="status">
          {t("beans.cupCountsUnavailable")}
        </p>
      ) : null}
      <div
        className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4 md:gap-6"
        role="list"
        aria-label={t("beans.listLabel")}
      >
        {coffees.map((coffee) => {
          const remaining =
            cupMap && !cupsDemo && Object.hasOwn(cupMap, coffee.slug)
              ? cupMap[coffee.slug]
              : undefined;
          const remainingKnown = remaining !== undefined;
          const soldOut = remainingKnown && remaining <= 0;
          return (
            <div key={coffee.slug} role="listitem" className="min-w-0">
              <button
                type="button"
                onClick={() => openPanel(coffee)}
                className="group relative w-full min-w-0 overflow-hidden border border-[color:var(--border)] bg-[color:var(--surface)] text-left"
              >
                <span className="relative block aspect-square w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local catalog art */}
                  <img
                    src={coffee.image}
                    alt=""
                    width={400}
                    height={400}
                    className={`h-full w-full object-cover ${soldOut ? "opacity-50 grayscale-[0.35]" : ""}`}
                  />
                  <span className="bean-slide-overlay pointer-events-none absolute inset-x-0 bottom-0 border-t border-white/15 bg-[#1f1f1f]/92 px-4 py-4 text-[color:var(--accent-foreground)]">
                    <span className="block text-lg font-semibold tracking-tight text-white">
                      {coffee.name}
                    </span>
                    {coffee.subtitle ? (
                      <span className="mt-1 block text-[0.65rem] font-medium uppercase tracking-[0.14em] text-white/65">
                        {coffee.subtitle}
                      </span>
                    ) : null}
                    <span className="mt-2 block text-sm leading-snug text-white/85">
                      {coffee.shortNotes}
                    </span>
                    {remainingKnown ? (
                      <span
                        className={`mt-2 block text-[0.7rem] font-semibold uppercase tracking-[0.12em] ${
                          soldOut ? "text-amber-200/95" : "text-white/75"
                        }`}
                      >
                        {soldOut ? t("beans.soldOut") : t("beans.cupsLeft", { count: remaining })}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {portalTarget && overlay ? createPortal(overlay, portalTarget) : null}
    </>
  );
}
