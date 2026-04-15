import { EventHeroBanner } from "@/components/EventHeroBanner";
import { HomeBeanShowcase } from "@/components/HomeBeanShowcase";
import { HomeVisitBlock } from "@/components/HomeVisitBlock";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getCoffees } from "@/lib/coffees";

export default function Home() {
  const coffees = getCoffees();

  return (
    <main className="overflow-x-hidden">
      <EventHeroBanner />

      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
        <ScrollReveal direction="from-left" className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
            Calm space, clear flavors
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[color:var(--foreground-muted)]">
            Editorial layouts and generous margins keep the focus on what is in the cup—similar
            spirit to the quiet confidence of a well-made storefront site, without borrowing
            anyone else&apos;s identity.
          </p>
        </ScrollReveal>

        <ScrollReveal
          id="beans"
          direction="from-right"
          className="mt-12 w-full border-t border-[color:var(--border)] pt-12 sm:mt-16 sm:pt-16"
        >
          <HomeBeanShowcase coffees={coffees} />
        </ScrollReveal>

        <ScrollReveal direction="from-left" className="mt-12 w-full sm:mt-16">
          <HomeVisitBlock />
        </ScrollReveal>
      </section>
    </main>
  );
}
