"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { getMessage, interpolate, type Locale } from "@/lib/messages";

const STORAGE_KEY = "ck-locale";

function isLocale(v: string | null): v is Locale {
  return v === "en" || v === "zh";
}

function readLocaleFromStorage(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}

function getLocaleSnapshot(): Locale {
  if (typeof document !== "undefined" && document.documentElement.dataset.locale === "zh") {
    return "zh";
  }
  const fromStorage = readLocaleFromStorage();
  if (fromStorage) return fromStorage;
  return "en";
}

function getServerSnapshot(): Locale {
  return "en";
}

const localeListeners = new Set<() => void>();

function emitLocaleChange() {
  for (const cb of localeListeners) cb();
}

function subscribeLocale(onStoreChange: () => void) {
  localeListeners.add(onStoreChange);
  return () => {
    localeListeners.delete(onStoreChange);
  };
}

function persistLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  if (locale === "zh") {
    document.documentElement.dataset.locale = "zh";
  } else {
    delete document.documentElement.dataset.locale;
  }
  try {
    if (locale === "en") {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, locale);
    }
  } catch {
    /* ignore */
  }
  emitLocaleChange();
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribeLocale, getLocaleSnapshot, getServerSnapshot);

  const setLocale = useCallback((next: Locale) => {
    persistLocale(next);
  }, []);

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => {
      const raw = getMessage(locale, path);
      return vars ? interpolate(raw, vars) : raw;
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    if (locale === "zh") {
      document.documentElement.dataset.locale = "zh";
    } else {
      delete document.documentElement.dataset.locale;
    }
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LocaleProvider");
  }
  return ctx;
}
