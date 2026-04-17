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
  /** When false, the lot is hidden from booking and shown as unavailable (also enforce via `coffee_cup_caps`). */
  available?: boolean;
  name: string;
  subtitle?: string;
  shortNotes: string;
  longNotes: string;
  priceUsd: number;
  origin?: string;
  variety?: string;
  producer?: string;
  elevation?: string;
  process?: string;
  image: string;
};

const list = coffeesData as Coffee[];

type CoffeeZhFields = Omit<Coffee, "slug" | "image" | "priceUsd">;
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

/** Catalog + optional JSON flag; DB caps are enforced separately in booking RPC. */
export function isCoffeeBookable(slug: string): boolean {
  const c = getCoffeeBySlug(slug);
  return c != null && c.available !== false;
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
  return isCoffeeBookable(value);
}

/** True if `coffee_choice` is valid JSON payload or a legacy single slug. */
export function isValidCoffeeChoiceField(value: string): boolean {
  const parsed = parseCoffeeChoiceJson(value);
  if (parsed?.unsure) return false;
  if (parsed && !parsed.unsure) {
    return parsed.items.every((i) => isCoffeeBookable(i.slug));
  }
  return isCoffeeSlugOrUnsure(value);
}

/** Admin edits: any catalog slug is allowed (including `available: false` for existing parties). */
export function isValidCoffeeChoiceForAdmin(value: string): boolean {
  const t = value.trim();
  if (!t) return false;
  if (t.toLowerCase() === "unsure") return true;
  const parsed = parseCoffeeChoiceJson(t);
  if (parsed?.unsure) return true;
  if (parsed && !parsed.unsure) {
    return parsed.items.length > 0 && parsed.items.every((i) => Boolean(getCoffeeBySlug(i.slug)));
  }
  if (!t.startsWith("{")) {
    return Boolean(getCoffeeBySlug(t));
  }
  return false;
}

/**
 * Line items for inventory math (matches `public.booking_coffee_line_items` for JSON + legacy slug).
 */
export function getBookingCoffeeLineItems(
  partySize: number,
  coffeeChoice: string,
): { slug: string; qty: number }[] {
  const trimmed = coffeeChoice.trim();
  if (!trimmed || trimmed.toLowerCase() === "unsure") return [];

  const parsed = parseCoffeeChoiceJson(trimmed);
  if (parsed?.unsure) return [];
  if (parsed && !parsed.unsure && parsed.items.length > 0) {
    return parsed.items.map((i) => ({
      slug: i.slug,
      qty: Math.max(1, Math.min(i.qty, 4)),
    }));
  }
  if (!trimmed.startsWith("{")) {
    const slug = trimmed;
    if (!getCoffeeBySlug(slug)) return [];
    const qty = Math.max(1, Math.min(Math.max(1, partySize), 4));
    return [{ slug, qty }];
  }
  return [];
}

export function sumBookingCoffeeQty(items: { slug: string; qty: number }[]): number {
  return items.reduce((s, i) => s + i.qty, 0);
}

export function buildCoffeeChoiceJsonFromItems(
  items: { slug: string; qty: number }[],
  serve: ServeStyle = "hot",
): string {
  return JSON.stringify({
    v: COFFEE_CHOICE_JSON_VERSION,
    serve,
    unsure: false,
    items,
  });
}

export function buildUnsureCoffeeChoiceJson(serve: ServeStyle = "hot"): string {
  return JSON.stringify({
    v: COFFEE_CHOICE_JSON_VERSION,
    serve,
    unsure: true,
  });
}

export type AdminEditCoffeeRow = { slug: string; label: string };

/** All catalog coffees for admin booking edits (ignores `available`). */
export function getCoffeeRowsForAdminEdit(locale: Locale = "en"): AdminEditCoffeeRow[] {
  return getCoffees(locale).map((c) => ({
    slug: c.slug,
    label: `${c.name} ${c.priceUsd} ${locale === "zh" ? "美元" : "USD"}`.trim(),
  }));
}

export type BookingCoffeeRow = { slug: string; label: string; available: boolean };

/** Catalog rows for the booking form (name without pouch suffix + price). */
export function getCoffeeRowsForBookingForm(locale: Locale): BookingCoffeeRow[] {
  return getCoffees(locale).map((c) => ({
    slug: c.slug,
    label: `${c.name} ${c.priceUsd} ${locale === "zh" ? "美元" : "USD"}`.trim(),
    available: c.available !== false,
  }));
}
