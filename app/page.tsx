import { EventHeroBanner } from "@/components/EventHeroBanner";
import { HomeBeanShowcase } from "@/components/HomeBeanShowcase";
import { HomePhilosophy } from "@/components/HomePhilosophy";
import { HomeVisitBlock } from "@/components/HomeVisitBlock";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <EventHeroBanner />

      <div className="bg-[color:var(--surface)]">
        <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
          <ScrollReveal direction="from-left" className="max-w-3xl">
            <HomePhilosophy />
          </ScrollReveal>

          <ScrollReveal
            id="beans"
            direction="from-right"
            className="mt-12 w-full border-t border-[color:var(--border)] pt-12 sm:mt-16 sm:pt-16"
          >
            <HomeBeanShowcase />
          </ScrollReveal>

          <ScrollReveal direction="from-left" className="mt-12 w-full sm:mt-16">
            <HomeVisitBlock />
          </ScrollReveal>
        </section>
      </div>
    </main>
  );
}
