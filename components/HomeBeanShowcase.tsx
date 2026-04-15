"use client";

import type { Coffee } from "@/lib/coffees";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = { coffees: Coffee[] };

export function HomeBeanShowcase({ coffees }: Props) {
  const [detail, setDetail] = useState<Coffee | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const titleId = useId();
  const descId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const drawerOpenRef = useRef(drawerOpen);
  /** Browser timer id (`window.setTimeout` returns a number). */
  const closeTimerRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    drawerOpenRef.current = drawerOpen;
  }, [drawerOpen]);

  const openPanel = useCallback((coffee: Coffee) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setDetail(coffee);
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
      setDetail(null);
      return;
    }

    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setDetail(null);
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
    setDetail(null);
  }, []);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [detail, closePanel]);

  useEffect(() => {
    if (!detail || !drawerOpen) return;
    closeBtnRef.current?.focus();
  }, [detail, drawerOpen]);

  const portalTarget = typeof document !== "undefined" ? document.body : null;

  const overlay =
    detail && portalTarget ? (
      <div
        className={`fixed inset-0 z-[100] min-h-[100dvh] ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        role="presentation"
      >
        <button
          type="button"
          aria-label="Close coffee details"
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
                {detail.name}
              </h2>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={closePanel}
                className="shrink-0 text-sm font-medium text-[color:var(--foreground-muted)] underline decoration-[color:var(--border)] underline-offset-[5px] transition-colors hover:text-[color:var(--foreground)] hover:decoration-[color:var(--foreground)]"
              >
                Close
              </button>
            </div>
            {detail.subtitle ? (
              <p className="mt-1 shrink-0 text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--foreground-muted)]">
                {detail.subtitle}
              </p>
            ) : null}
            <p id={descId} className="mt-2 shrink-0 text-sm text-[color:var(--foreground-muted)]">
              {detail.shortNotes}
            </p>

            <div className="mt-6 shrink-0 overflow-hidden border border-[color:var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={detail.image}
                alt=""
                width={800}
                height={600}
                className="h-auto w-full object-cover"
              />
            </div>

            <p className="mt-6 text-base leading-relaxed">{detail.longNotes}</p>

            {(detail.origin ||
              detail.variety ||
              detail.producer ||
              detail.elevation ||
              detail.process) && (
              <dl className="mt-8 grid shrink-0 gap-6 border-t border-[color:var(--border)] pt-6">
                {detail.origin && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
                      Origin
                    </dt>
                    <dd className="mt-2 text-sm">{detail.origin}</dd>
                  </div>
                )}
                {detail.variety && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
                      Variety
                    </dt>
                    <dd className="mt-2 text-sm">{detail.variety}</dd>
                  </div>
                )}
                {detail.producer && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
                      Producer
                    </dt>
                    <dd className="mt-2 text-sm">{detail.producer}</dd>
                  </div>
                )}
                {detail.elevation && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
                      Elevation
                    </dt>
                    <dd className="mt-2 text-sm">{detail.elevation}</dd>
                  </div>
                )}
                {detail.process && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
                      Process
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed">{detail.process}</dd>
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
      <div
        className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4 md:gap-6"
        role="list"
        aria-label="Featured coffees"
      >
        {coffees.map((coffee) => (
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
                  className="h-full w-full object-cover"
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
                </span>
              </span>
            </button>
          </div>
        ))}
      </div>

      {portalTarget && overlay ? createPortal(overlay, portalTarget) : null}
    </>
  );
}
