"use client";

import type { Coffee } from "@/lib/coffees";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type Props = { coffees: Coffee[] };

export function HomeBeanShowcase({ coffees }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<Coffee | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!active) return;
    const el = dialogRef.current;
    if (el && !el.open) el.showModal();
  }, [active]);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onClose = () => setActive(null);
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, []);

  const onDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) close();
  };

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
              onClick={() => setActive(coffee)}
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

      <dialog
        ref={dialogRef}
        className="bean-dialog max-h-[min(90vh,40rem)] overflow-y-auto border border-[color:var(--border)] bg-[color:var(--surface)] p-0 text-[color:var(--foreground)] shadow-2xl"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={onDialogClick}
      >
        {active && (
          <div className="p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <h2 id={titleId} className="font-serif text-2xl tracking-tight sm:text-3xl">
                {active.name}
              </h2>
              <button
                type="button"
                onClick={close}
                className="shrink-0 border border-[color:var(--border)] px-3 py-1.5 text-sm font-medium text-[color:var(--foreground-muted)] transition-colors hover:border-[color:var(--foreground)]/25 hover:text-[color:var(--foreground)]"
              >
                Close
              </button>
            </div>
            <p id={descId} className="mt-2 text-sm text-[color:var(--foreground-muted)]">
              {active.shortNotes}
            </p>

            <div className="mt-6 overflow-hidden border border-[color:var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.image}
                alt=""
                width={800}
                height={600}
                className="h-auto w-full object-cover"
              />
            </div>

            <p className="mt-6 text-base leading-relaxed">{active.longNotes}</p>

            {(active.origin || active.process) && (
              <dl className="mt-8 grid gap-6 border-t border-[color:var(--border)] pt-6 sm:grid-cols-2">
                {active.origin && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
                      Origin
                    </dt>
                    <dd className="mt-2 text-sm">{active.origin}</dd>
                  </div>
                )}
                {active.process && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
                      Process
                    </dt>
                    <dd className="mt-2 text-sm">{active.process}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
