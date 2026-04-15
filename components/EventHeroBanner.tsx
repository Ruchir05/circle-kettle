import Link from "next/link";
import { CoffeePlantGraphic } from "@/components/CoffeePlantGraphic";
import { getContactPhoneDisplay, POPUP_VENUE_ADDRESS_LINES } from "@/lib/config";
import { getPopupScheduleLines } from "@/lib/popupDisplay";

const heroLinkClass =
  "hero-inline-link text-sm font-medium underline underline-offset-[6px] transition-[text-decoration-color,color]";

/** ~10% wider than max-w-xl (36rem). */
const copyMax = "max-w-[40rem]";

export function EventHeroBanner() {
  const schedule = getPopupScheduleLines();
  const phone = getContactPhoneDisplay();

  return (
    <section
      className="box-border flex min-h-[100dvh] flex-col pr-[8%] pb-[12dvh] text-[color:var(--hero-text)]"
      style={{ backgroundColor: "var(--hero-bg)" }}
    >
      {/*
        lg: items-stretch so the main column gets the full inset height (required for justify-center).
        Aside uses self-start + hero-cream-rail-height (90% of inset) so ~10% charcoal shows below the rail.
      */}
      <div className="flex w-full min-h-0 flex-1 flex-col lg:h-[calc(100dvh-12dvh)] lg:min-h-[calc(100dvh-12dvh)] lg:flex-row lg:items-stretch">
        {/* Main charcoal — stretches full row height on lg; copy vertically centered */}
        <div className="relative flex min-h-[calc(100dvh-12dvh)] flex-1 flex-col px-6 py-14 sm:px-8 sm:py-16 lg:min-h-0 lg:flex-1 lg:justify-center lg:py-0 lg:pl-8 lg:pr-4 xl:pl-12">
          {/*
            < lg: copy + plant share space in normal flow (no full-bleed overlay), so the graphic
            sits in empty margin — column + bottom-right on phones, row + right column on md–lg.
            lg+: plant returns to an absolute layer (decorative, right edge) like before.
          */}
          <div className="relative z-[2] mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-6 lg:mx-0 lg:flex lg:h-full lg:max-w-none lg:min-h-0 lg:flex-1 lg:flex-col">
            <div className="relative z-[2] flex min-h-0 flex-1 flex-col justify-center md:min-w-0 lg:z-[3] lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:justify-center">
              <div className={copyMax}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--hero-kicker)]">
                  One day only · UIUC
                </p>
                <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-[color:var(--hero-text-muted)] sm:text-5xl lg:text-6xl xl:text-[3.5rem] xl:leading-[1.06]">
                  Coffee, unhurried. A thirty-minute table for up to four.
                </h1>

                <p className="mt-8 text-base leading-relaxed text-[color:var(--hero-text-muted)] sm:text-lg">
                  We brew a focused menu of single-origin lots—bright, balanced, and bold—so you can taste
                  with a little guidance and a lot of room to talk. Book a slot, pick a coffee or stay
                  open-minded, and we will meet you there.
                </p>

                <div className="mt-10">
                  <Link href="/book" className={heroLinkClass}>
                    Book a tasting
                  </Link>
                </div>
              </div>
            </div>

            <div
              className="coffee-plant-motion pointer-events-none mt-auto flex min-h-0 w-full shrink-0 justify-end self-end pb-1 sm:pb-2 md:mt-0 md:min-w-0 md:flex-1 md:self-center md:justify-end md:pb-0 lg:absolute lg:inset-0 lg:z-[1] lg:mt-0 lg:flex lg:items-center lg:justify-end lg:pb-0 lg:pr-0"
              aria-hidden
            >
              {/*
                Below lg: scale up with viewport so the branch reads as a hero motif, not a favicon.
                min() keeps it off the left edge; md:flex-1 lets the right column swallow spare width.
              */}
              <div className="flex w-[min(88vw,22rem)] max-w-full min-w-[12rem] justify-end sm:w-[min(82vw,26rem)] sm:min-w-[14rem] md:w-[min(100%,48vw,30rem)] md:max-w-[min(100%,32rem)] lg:absolute lg:right-0 lg:top-1/2 lg:max-w-none lg:w-[min(92%,34rem)] lg:min-w-0 lg:-translate-y-1/2 lg:translate-x-[14%] lg:justify-end xl:w-[min(92%,38rem)] xl:translate-x-[18%]">
                <CoffeePlantGraphic />
              </div>
            </div>
          </div>
        </div>

        <aside
          className="hero-cream-rail-height relative z-[3] flex w-full shrink-0 flex-col justify-center border-t border-t-[color:var(--hero-rail-border-t)] bg-[color:var(--surface)] px-6 py-9 text-[color:var(--foreground)] sm:px-7 lg:w-[clamp(13.25rem,19vw,16.5rem)] lg:shrink-0 lg:self-start lg:border-t-0 lg:border-l lg:border-l-[color:var(--hero-rail-border-l)] lg:px-5 lg:py-10 xl:w-[clamp(13.75rem,17vw,17.25rem)] xl:px-7"
          style={{ boxShadow: "var(--hero-rail-box-shadow)" }}
        >
          <div className="space-y-7 overflow-y-auto lg:space-y-8">
            <div className="border-b border-[color:var(--border)] pb-7 lg:pb-8">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground-muted)]">
                Hours
              </h3>
              <p className="mt-3 text-sm font-medium leading-snug text-[color:var(--foreground)]">
                {schedule.dateLine}
              </p>
              <p className="mt-2 text-sm leading-snug text-[color:var(--foreground-muted)]">
                {schedule.timeLine}
              </p>
              <p className="mt-2 text-sm leading-snug text-[color:var(--foreground-muted)]">
                {schedule.reservationNote}
              </p>
            </div>

            {phone ? (
              <div className="border-b border-[color:var(--border)] pb-7 lg:pb-8">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground-muted)]">
                  Contact
                </h3>
                <p className="mt-3">
                  <a
                    href={`tel:${phone.replace(/\D/g, "")}`}
                    className="text-sm font-medium text-[color:var(--foreground)] underline decoration-[color:var(--border)] underline-offset-[5px] transition-colors hover:decoration-[color:var(--foreground)]"
                  >
                    {phone}
                  </a>
                </p>
              </div>
            ) : null}

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground-muted)]">
                Address
              </h3>
              <p className="mt-3 text-sm leading-snug text-[color:var(--foreground)]">
                {POPUP_VENUE_ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              <p className="mt-5">
                <Link
                  href="/book"
                  className="text-sm font-medium text-[color:var(--foreground)] underline decoration-[color:var(--border)] underline-offset-[5px] transition-colors hover:decoration-[color:var(--foreground)]"
                >
                  Book a tasting
                </Link>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
