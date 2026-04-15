"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "ck-theme";

function getThemeSnapshot(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerSnapshot(): "light" | "dark" {
  return "dark";
}

function subscribe(onStoreChange: () => void) {
  const el = document.documentElement;
  const obs = new MutationObserver(onStoreChange);
  obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

function applyTheme(mode: "light" | "dark") {
  if (mode === "light") {
    document.documentElement.dataset.theme = "light";
    try {
      localStorage.setItem(STORAGE_KEY, "light");
    } catch {
      /* ignore */
    }
  } else {
    delete document.documentElement.dataset.theme;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot);
  const isLight = mode === "light";

  const toggle = useCallback(() => {
    applyTheme(isLight ? "dark" : "light");
  }, [isLight]);

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-sm transition-[background-color,box-shadow,color] hover:bg-[color:var(--background)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--foreground)]"
      aria-pressed={isLight}
      aria-label={isLight ? "Use dark hero" : "Use light hero"}
      title={isLight ? "Dark hero" : "Light hero"}
      suppressHydrationWarning
    >
      {isLight ? (
        <span className="text-[0.95rem] leading-none" aria-hidden>
          ☾
        </span>
      ) : (
        <span className="text-[0.95rem] leading-none" aria-hidden>
          ☀
        </span>
      )}
    </button>
  );
}
