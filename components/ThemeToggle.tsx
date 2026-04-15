"use client";

import { useI18n } from "@/lib/i18n";
import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "ck-theme";

function getThemeSnapshot(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerSnapshot(): "light" | "dark" {
  return "light";
}

function subscribe(onStoreChange: () => void) {
  const el = document.documentElement;
  const obs = new MutationObserver(onStoreChange);
  obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

function applyTheme(mode: "light" | "dark") {
  if (mode === "light") {
    delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem(STORAGE_KEY, "light");
    } catch {
      /* ignore */
    }
  } else {
    document.documentElement.dataset.theme = "dark";
    try {
      localStorage.setItem(STORAGE_KEY, "dark");
    } catch {
      /* ignore */
    }
  }
}

export function ThemeToggle() {
  const { t } = useI18n();
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
      aria-label={isLight ? t("theme.useDark") : t("theme.useLight")}
      title={isLight ? t("theme.darkTitle") : t("theme.lightTitle")}
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
