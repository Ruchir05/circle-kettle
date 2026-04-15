import coffeesData from "@/data/coffees.json";
import coffeeLocaleZh from "@/data/coffee-locale.zh.json";
import type { Locale } from "@/lib/messages";

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
  if (locale === "en") return base;
  const zh = zhBySlug[base.slug];
  if (!zh) return base;
  return { ...base, ...zh };
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

/** Label for booking `coffee_choice` (slug or `unsure`). */
export function getCoffeeChoiceLabel(slug: string, locale: Locale = "en"): string {
  if (slug === "unsure") {
    return locale === "zh" ? "不确定 — 由我们推荐" : "Unsure — surprise me";
  }
  return getCoffeeForDisplay(slug, locale)?.name ?? slug;
}

export function getCoffeeSlugs(): string[] {
  return list.map((c) => c.slug);
}

export function isCoffeeSlugOrUnsure(value: string): boolean {
  if (value === "unsure") return true;
  return list.some((c) => c.slug === value);
}

export function getCoffeeOptionsForForm(locale: Locale = "en"): { slug: string; label: string }[] {
  const unsure = locale === "zh" ? "不确定 — 由我们推荐" : "Unsure — surprise me";
  return [...getCoffees(locale).map((c) => ({ slug: c.slug, label: c.name })), { slug: "unsure", label: unsure }];
}
