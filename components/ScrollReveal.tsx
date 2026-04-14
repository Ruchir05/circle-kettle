"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type ScrollRevealDirection = "from-left" | "from-right";

type Props = {
  children: ReactNode;
  direction: ScrollRevealDirection;
  className?: string;
  id?: string;
};

/**
 * Slides content in on first scroll into view (once).
 * from-left: enters from the left (moves right into place). from-right: the opposite.
 * prefers-reduced-motion: no animation; content stays visible via CSS overrides.
 */
export function ScrollReveal({ children, direction, className = "", id }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setRevealed(true);
        obs.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const hidden =
    direction === "from-left"
      ? "-translate-x-10 opacity-0 sm:-translate-x-16"
      : "translate-x-10 opacity-0 sm:translate-x-16";
  const shown = "translate-x-0 opacity-100";

  return (
    <div
      ref={ref}
      id={id}
      className={`will-change-[transform,opacity] motion-safe:transition motion-safe:duration-[680ms] motion-safe:ease-out ${
        revealed ? shown : hidden
      } motion-reduce:translate-x-0 motion-reduce:opacity-100 motion-reduce:transition-none ${className}`.trim()}
    >
      {children}
    </div>
  );
}
