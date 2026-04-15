import coffeesData from "@/data/coffees.json";
import coffeeLocaleZh from "@/data/coffee-locale.zh.json";
import type { Locale } from "@/lib/messages";

/** Strip trailing retail pouch suffix (e.g. " — 7") for marketing copy; booking uses `7 USD` separately. */
const RETAIL_POUCH_SUFFIX = /\s*[—–-]\s*7\s*$/u;

export function stripRetailPouchSuffix(name: string): string {
  return name.replace(RETAIL_POUCH_SUFFIX, "").trim();
}

export type Coffee = {
  slug: string;
  name: string;
  subtitle?: string;
  shortNotes: string;
  longNotes: string;
  origin?: string;
  variety?: string;
  producer?: string;
  elevation?: string;
  process?: string;
  image: string;
};

const list = coffeesData as Coffee[];

type CoffeeZhFields = Omit<Coffee, "slug" | "image">;
const zhBySlug = coffeeLocaleZh as Record<string, CoffeeZhFields>;

function localizeCoffee(base: Coffee, locale: Locale): Coffee {
  const merged =
    locale === "en" ? base : { ...base, ...(zhBySlug[base.slug] ?? {}) };
  return { ...merged, name: stripRetailPouchSuffix(merged.name) };
}

export function getCoffees(locale: Locale = "en"): Coffee[] {
  return list.map((c) => localizeCoffee(c, locale));
}

export function getCoffeeBySlug(slug: string): Coffee | undefined {
  return list.find((c) => c.slug === slug);
}

/** Base catalog row merged with locale copy (for UI). */
export function getCoffeeForDisplay(slug: string, locale: Locale): Coffee | undefined {
  const base = getCoffeeBySlug(slug);
  if (!base) return undefined;
  return localizeCoffee(base, locale);
}

export const COFFEE_CHOICE_JSON_VERSION = 2 as const;

export type ServeStyle = "hot" | "iced";

export type CoffeeChoiceJson =
  | { v?: number; serve?: ServeStyle; unsure: true }
  | { v?: number; serve?: ServeStyle; unsure: false; items: { slug: string; qty: number }[] };

function parseServeField(rec: Record<string, unknown>): ServeStyle | undefined {
  if (!("serve" in rec)) return undefined;
  if (rec.serve === "hot" || rec.serve === "iced") return rec.serve;
  return undefined;
}

/** Invalid `serve` value makes the whole JSON fail parse (avoids accepting garbage). */
function serveFieldInvalid(rec: Record<string, unknown>): boolean {
  if (!("serve" in rec)) return false;
  return rec.serve !== "hot" && rec.serve !== "iced";
}

export function parseCoffeeChoiceJson(raw: string): CoffeeChoiceJson | null {
  const t = raw.trim();
  if (!t.startsWith("{")) return null;
  try {
    const o = JSON.parse(t) as unknown;
    if (!o || typeof o !== "object") return null;
    const rec = o as Record<string, unknown>;
    if (serveFieldInvalid(rec)) return null;

    const serve = parseServeField(rec);

    if (rec.unsure === true) return { v: COFFEE_CHOICE_JSON_VERSION, unsure: true, serve };
    if (rec.unsure !== false || !Array.isArray(rec.items)) return null;
    const items: { slug: string; qty: number }[] = [];
    for (const row of rec.items) {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      if (typeof r.slug !== "string" || typeof r.qty !== "number") return null;
      if (!Number.isInteger(r.qty) || r.qty < 1 || r.qty > 4) return null;
      items.push({ slug: r.slug, qty: r.qty });
    }
    if (items.length === 0) return null;
    return { v: COFFEE_CHOICE_JSON_VERSION, unsure: false, items, serve };
  } catch {
    return null;
  }
}

function serveLabelPrefix(serve: ServeStyle | undefined, locale: Locale): string {
  const s = serve ?? "hot";
  if (locale === "zh") return s === "iced" ? "冰饮 · " : "热饮 · ";
  return s === "iced" ? "Iced · " : "Hot · ";
}

/** Human-readable coffee choice for admin / email (supports JSON or legacy slug). */
export function getCoffeeChoiceLabel(raw: string, locale: Locale = "en"): string {
  const parsed = parseCoffeeChoiceJson(raw);
  if (parsed?.unsure) {
    const body = locale === "zh" ? "不确定 — 由我们推荐" : "Unsure — surprise me";
    return `${serveLabelPrefix(parsed.serve, locale)}${body}`;
  }
  if (parsed && !parsed.unsure) {
    const body = parsed.items
      .map(({ slug, qty }) => {
        const label = getCoffeeForDisplay(slug, locale)?.name ?? slug;
        return `${label} ×${qty}`;
      })
      .join(locale === "zh" ? "；" : "; ");
    return `${serveLabelPrefix(parsed.serve, locale)}${body}`;
  }
  if (raw === "unsure") {
    return locale === "zh" ? "不确定 — 由我们推荐" : "Unsure — surprise me";
  }
  return getCoffeeForDisplay(raw, locale)?.name ?? raw;
}

export function getCoffeeSlugs(): string[] {
  return list.map((c) => c.slug);
}

export function isCoffeeSlugOrUnsure(value: string): boolean {
  return list.some((c) => c.slug === value);
}

/** True if `coffee_choice` is valid JSON payload or a legacy single slug. */
export function isValidCoffeeChoiceField(value: string): boolean {
  const parsed = parseCoffeeChoiceJson(value);
  if (parsed?.unsure) return false;
  if (parsed && !parsed.unsure) {
    return parsed.items.every((i) => list.some((c) => c.slug === i.slug));
  }
  return isCoffeeSlugOrUnsure(value);
}

export type BookingCoffeeRow = { slug: string; label: string };

/** Catalog rows for the booking form (name without pouch suffix + price). */
export function getCoffeeRowsForBookingForm(
  locale: Locale,
  priceSuffix: string,
): BookingCoffeeRow[] {
  return getCoffees(locale).map((c) => ({
    slug: c.slug,
    label: `${c.name} ${priceSuffix}`.trim(),
  }));
}
