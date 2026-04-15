import coffeesData from "@/data/coffees.json";

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

export function getCoffees(): Coffee[] {
  return list;
}

export function getCoffeeBySlug(slug: string): Coffee | undefined {
  return list.find((c) => c.slug === slug);
}

/** Label for booking `coffee_choice` (slug or `unsure`). */
export function getCoffeeChoiceLabel(slug: string): string {
  if (slug === "unsure") return "Unsure — surprise me";
  return getCoffeeBySlug(slug)?.name ?? slug;
}

export function getCoffeeSlugs(): string[] {
  return list.map((c) => c.slug);
}

export function isCoffeeSlugOrUnsure(value: string): boolean {
  if (value === "unsure") return true;
  return list.some((c) => c.slug === value);
}

export function getCoffeeOptionsForForm(): { slug: string; label: string }[] {
  return [
    ...list.map((c) => ({ slug: c.slug, label: c.name })),
    { slug: "unsure", label: "Unsure — surprise me" },
  ];
}
