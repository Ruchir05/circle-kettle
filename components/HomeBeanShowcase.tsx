"use client";

import type { Coffee } from "@/lib/coffees";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type Props = { coffees: Coffee[] };

export function HomeBeanShowcase({ coffees }: Props) {
  const [detail, setDetail] = useState<Coffee | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const titleId = useId();
  const descId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const openPanel = useCallback((coffee: Coffee) => {
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
    setDrawerOpen(false);
  }, []);

  const onDrawerTransitionEnd = useCallback((e: React.TransitionEvent<HTMLElement>) => {
    if (e.propertyName !== "transform") return;
    if (!drawerOpen) setDetail(null);
  }, [drawerOpen]);

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
                {/* eslint-disable-next-line @next/next/no-img-element -- local SVG art */}
                <img
                  src={coffee.image}
                  alt=""
                  width={400}
                  height={400}
                  className="h-full w-full object-cover"
                />
                <span className="bean-slide-overlay pointer-events-none absolute inset-x-0 bottom-0 border-t border-white/15 bg-[#1f1f1f]/92 px-4 py-4 text-[color:var(--accent-foreground)]">
                  <span className="block font-serif text-lg tracking-tight text-white">
                    {coffee.name}
                  </span>
                  <span className="mt-2 block text-sm leading-snug text-white/85">
                    {coffee.shortNotes}
                  </span>
                </span>
              </span>
            </button>
          </div>
        ))}
      </div>

      {detail && (
        <div
          className={`fixed inset-0 z-50 ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close coffee details"
            className={`absolute inset-0 bg-[#1f1f1f] transition-opacity duration-500 ease-out motion-reduce:transition-none ${
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
            className={`coffee-detail-drawer pointer-events-auto absolute right-0 top-0 flex h-full w-1/3 min-w-[min(100%,18rem)] flex-col border-l border-[color:var(--border)] bg-[color:var(--surface)] shadow-[-12px_0_40px_-12px_rgba(31,31,31,0.2)] transition-transform duration-500 ease-out motion-reduce:transition-none ${
              drawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 sm:p-8">
              <div className="flex shrink-0 items-start justify-between gap-4">
                <h2 id={titleId} className="font-serif text-2xl tracking-tight sm:text-3xl">
                  {detail.name}
                </h2>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={closePanel}
                  className="shrink-0 border border-[color:var(--border)] px-3 py-1.5 text-sm font-medium text-[color:var(--foreground-muted)] transition-colors hover:border-[color:var(--foreground)]/25 hover:text-[color:var(--foreground)]"
                >
                  Close
                </button>
              </div>
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

              {(detail.origin || detail.process) && (
                <dl className="mt-8 grid shrink-0 gap-6 border-t border-[color:var(--border)] pt-6">
                  {detail.origin && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
                        Origin
                      </dt>
                      <dd className="mt-2 text-sm">{detail.origin}</dd>
                    </div>
                  )}
                  {detail.process && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
                        Process
                      </dt>
                      <dd className="mt-2 text-sm">{detail.process}</dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
