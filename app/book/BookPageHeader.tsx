"use client";

import { useI18n } from "@/lib/i18n";
import { useEffect, useRef, useState } from "react";

export function BookPageHeader() {
  const { t } = useI18n();
  const headerRef = useRef<HTMLElement | null>(null);
  const [isInitialReady, setIsInitialReady] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean((window as Window & { __bookInitialReady?: boolean }).__bookInitialReady);
  });
  const intro = t("bookPage.intro", { address: t("bookPage.introAddress") });

  useEffect(() => {
    if (isInitialReady) return;
    const onReady = () => setIsInitialReady(true);
    window.addEventListener("book:initial-ready", onReady);
    return () => window.removeEventListener("book:initial-ready", onReady);
  }, [isInitialReady]);

  useEffect(() => {
    if (!isInitialReady) return;
    const root = headerRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-book-reveal]"));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          target.classList.add("book-reveal-visible");
          observer.unobserve(target);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [isInitialReady]);

  return (
    <header ref={headerRef} className={`max-w-2xl ${isInitialReady ? "" : "opacity-0"}`}>
      <p
        className="book-reveal-init text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--foreground-muted)]"
        data-book-reveal="left"
        data-book-delay="120"
      >
        {t("bookPage.kicker")}
      </p>
      <h1
        className="book-reveal-init mt-4 text-4xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-5xl"
        data-book-reveal="left"
        data-book-delay="120"
      >
        {t("bookPage.title")}
      </h1>
      <p
        className="book-reveal-init mt-6 text-base leading-relaxed text-[color:var(--foreground-muted)]"
        data-book-reveal="left"
        data-book-delay="120"
      >
        {intro}
      </p>
    </header>
  );
}
