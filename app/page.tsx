import { HomeBeanShowcase } from "@/components/HomeBeanShowcase";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getCoffees } from "@/lib/coffees";
import Link from "next/link";

export default function Home() {
  const coffees = getCoffees();

  return (
    <main className="overflow-x-hidden">
      <section className="border-b border-[color:var(--border)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--foreground-muted)]">
            One day only · UIUC
          </p>
          <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-[1.08] tracking-tight text-[color:var(--foreground)] sm:text-6xl">
            Coffee, unhurried. A thirty-minute table for up to four.
          </h1>

          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-[color:var(--foreground-muted)]">
            We brew a focused menu of single-origin lots—bright, balanced, and bold—so you can
            taste with a little guidance and a lot of room to talk. Book a slot, pick a coffee or
            stay open-minded, and we will meet you there.
          </p>
          <div className="mt-12">
            <Link
              href="/book"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--accent)] px-8 text-sm font-semibold text-[color:var(--accent-foreground)] transition-opacity hover:opacity-90"
            >
              Book a tasting
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
        <ScrollReveal direction="from-left" className="max-w-3xl">
          <h2 className="font-serif text-3xl tracking-tight text-[color:var(--foreground)] sm:text-4xl">
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
          <aside className="w-full border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-8">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
              Hours
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[color:var(--foreground)]">
              Saturday, April 18, 2026 · 1:00 PM–5:00 PM
              <br />
              30-minute reservations · up to 4 guests
            </p>
            <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
              Address
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--foreground)]">
              1004 W Main Street
              <br />
              Urbana, IL 61801
              <br />
              Unit 204
            </p>
          </aside>
        </ScrollReveal>
      </section>
    </main>
  );
}
