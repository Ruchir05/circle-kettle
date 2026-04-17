"use client";

import type { Coffee } from "@/lib/coffees";
import { getCoffeeForDisplay, getCoffees } from "@/lib/coffees";
import { useI18n } from "@/lib/i18n";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type BeanSlideCardProps = {
  coffee: Coffee;
  cupMap: Record<string, number> | null;
  cupsDemo: boolean;
  t: (path: string, vars?: Record<string, string | number>) => string;
  openPanel: (coffee: Coffee) => void;
};

function BeanSlideCard({ coffee, cupMap, cupsDemo, t, openPanel }: BeanSlideCardProps) {
  const catalogOff = coffee.available === false;
  const remaining =
    cupMap && !cupsDemo && Object.hasOwn(cupMap, coffee.slug) ? cupMap[coffee.slug] : undefined;
  const remainingKnown = remaining !== undefined;
  const soldOut = catalogOff || (remainingKnown && remaining <= 0);
  const showCupLine = catalogOff || remainingKnown;
  const overlayCupLabel = catalogOff
    ? t("bookForm.coffeeUnavailableBadge")
    : remaining !== undefined && remaining <= 0
      ? t("bookForm.coffeeSoldOutBadge")
      : remaining !== undefined
        ? t("bookForm.coffeeCupsLeft", { count: remaining })
        : "";
  return (
    <div role="listitem" className="min-w-0">
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
          <span className="bean-slide-overlay pointer-events-none absolute inset-x-0 bottom-0 flex min-h-[42%] max-h-[min(55%,20rem)] flex-col border-t border-white/15 bg-[#1f1f1f]/92 px-4 pb-3 pt-3 text-[color:var(--accent-foreground)] sm:min-h-[38%]">
            <div className="min-h-0 flex-1 overflow-hidden pb-1">
              <span className="block text-lg font-semibold tracking-tight text-white">{coffee.name}</span>
              {coffee.subtitle ? (
                <span className="mt-1 block text-[0.65rem] font-medium uppercase tracking-[0.14em] text-white/65">
                  {coffee.subtitle}
                </span>
              ) : null}
              <span className="mt-2 block text-sm leading-snug text-white/85">{coffee.shortNotes}</span>
            </div>
            <div
              className={`pointer-events-auto mt-auto flex shrink-0 items-end gap-2 border-t border-white/10 pt-2.5 ${
                showCupLine ? "justify-between" : "justify-end"
              }`}
            >
              {showCupLine ? (
                <span
                  className={`min-w-0 max-w-[58%] text-left text-[0.62rem] font-semibold uppercase leading-snug tracking-[0.12em] ${
                    soldOut ? "text-amber-200/95" : "text-white/72"
                  }`}
                >
                  {overlayCupLabel}
                </span>
              ) : null}
              <span
                aria-hidden
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-white/80 transition-colors duration-200 group-hover:text-white"
              >
                <span className="text-[0.66rem] font-medium uppercase tracking-[0.1em] decoration-current no-underline underline-offset-3 hover:underline">
                  {t("beans.moreDetails")}
                </span>
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3.25 8h8.5M8.5 3.75L12.75 8 8.5 12.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </span>
        </span>
      </button>
    </div>
  );
}

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
  const carouselRegionId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const drawerOpenRef = useRef(drawerOpen);
  /** Browser timer id (`window.setTimeout` returns a number). */
  const closeTimerRef = useRef<number | null>(null);
  const pauseAutoRef = useRef(false);

  const n = coffees.length;
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    if (n === 0) return;
    setStartIndex((i) => Math.min(Math.max(0, i), n - 1));
  }, [n]);

  const goPrev = useCallback(() => {
    if (n === 0) return;
    setStartIndex((i) => (i - 1 + n) % n);
  }, [n]);

  const goNext = useCallback(() => {
    if (n === 0) return;
    setStartIndex((i) => (i + 1) % n);
  }, [n]);

  const desktopColsClass =
    n >= 3 ? "sm:grid-cols-3" : n === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1";
  const desktopSlots = Math.min(3, Math.max(1, n));

  useEffect(() => {
    if (n <= 1 || selectedSlug != null) return;
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const id = window.setInterval(() => {
      if (selectedSlug != null) return;
      if (pauseAutoRef.current) return;
      if (document.visibilityState !== "visible") return;
      setStartIndex((i) => (i + 1) % n);
    }, 3_800);

    return () => window.clearInterval(id);
  }, [n, selectedSlug]);

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
              <div className="min-w-0">
                <h2 id={titleId} className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {panelCoffee.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-[color:var(--foreground)]">
                  {panelCoffee.priceUsd} {locale === "zh" ? "美元" : "USD"}
                </p>
              </div>
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
            {panelCoffee.available === false ? (
              <p className="mt-3 shrink-0 text-xs font-medium text-[color:var(--foreground-muted)]">
                {t("bookForm.coffeeUnavailableBadge")}
              </p>
            ) : cupMap && !cupsDemo && Object.hasOwn(cupMap, panelCoffee.slug) ? (
              <p
                className={`mt-3 shrink-0 text-xs font-medium ${
                  cupMap[panelCoffee.slug] <= 0
                    ? "text-amber-800"
                    : "text-[color:var(--foreground-muted)]"
                }`}
              >
                {cupMap[panelCoffee.slug] <= 0
                  ? t("bookForm.coffeeSoldOutBadge")
                  : t("bookForm.coffeeCupsLeft", { count: cupMap[panelCoffee.slug] })}
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

            <p className="mt-6 whitespace-pre-line text-base leading-relaxed">{panelCoffee.longNotes}</p>

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
        role="region"
        aria-roledescription={t("beans.carouselRoleDescription")}
        aria-label={t("beans.listLabel")}
        className="flex w-full min-w-0 items-stretch gap-2 sm:gap-3 md:gap-4"
        onMouseEnter={() => {
          pauseAutoRef.current = true;
        }}
        onMouseLeave={() => {
          pauseAutoRef.current = false;
        }}
        onFocus={() => {
          pauseAutoRef.current = true;
        }}
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
          pauseAutoRef.current = false;
        }}
      >
        <button
          type="button"
          aria-controls={carouselRegionId}
          aria-label={t("beans.carouselPrev")}
          onClick={goPrev}
          disabled={n <= 1}
          className="flex h-auto min-h-[2.75rem] w-10 shrink-0 items-center justify-center self-center border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground-muted)] transition-colors hover:border-[color:var(--foreground)]/25 hover:text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-[3.25rem] sm:w-11"
        >
          <svg viewBox="0 0 16 16" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path
              d="M10 3.25L5.75 7.5 10 11.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div id={carouselRegionId} className="min-w-0 flex-1 overflow-hidden">
          {n > 0 ? (
            <div
              className="bean-carousel-track flex will-change-transform"
              style={{
                width: `${n * 100}%`,
                transform: `translateX(-${(startIndex * 100) / n}%)`,
              }}
            >
              {Array.from({ length: n }, (_, slide) => (
                <div
                  key={slide}
                  className="shrink-0"
                  style={{ width: `${100 / n}%` }}
                  aria-hidden={slide !== startIndex}
                >
                  <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:hidden" role="list">
                    <BeanSlideCard
                      key={`${slide}-m`}
                      coffee={coffees[slide % n]}
                      cupMap={cupMap}
                      cupsDemo={cupsDemo}
                      t={t}
                      openPanel={openPanel}
                    />
                  </div>
                  <div
                    className={`hidden w-full min-w-0 gap-4 sm:grid md:gap-6 ${desktopColsClass}`}
                    role="list"
                  >
                    {Array.from({ length: desktopSlots }, (_, k) => (
                      <BeanSlideCard
                        key={`${slide}-${k}`}
                        coffee={coffees[(slide + k) % n]}
                        cupMap={cupMap}
                        cupsDemo={cupsDemo}
                        t={t}
                        openPanel={openPanel}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          aria-controls={carouselRegionId}
          aria-label={t("beans.carouselNext")}
          onClick={goNext}
          disabled={n <= 1}
          className="flex h-auto min-h-[2.75rem] w-10 shrink-0 items-center justify-center self-center border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground-muted)] transition-colors hover:border-[color:var(--foreground)]/25 hover:text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-[3.25rem] sm:w-11"
        >
          <svg viewBox="0 0 16 16" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path
              d="M6 3.25L10.25 7.5 6 11.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {portalTarget && overlay ? createPortal(overlay, portalTarget) : null}
    </>
  );
}
