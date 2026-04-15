"use client";

import { submitBooking, type BookingState } from "@/app/actions/booking";
import { translateBookingUiMessage } from "@/lib/bookingUiMessages";
import { POPUP_EVENT_DATE, POPUP_TIMEZONE } from "@/lib/config";
import { COFFEE_CHOICE_JSON_VERSION, getCoffeeRowsForBookingForm } from "@/lib/coffees";
import { useI18n } from "@/lib/i18n";
import { DateTime } from "luxon";
import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

const initial: BookingState = { ok: false, message: "" };

const fieldClass =
  "form-field mt-3 block w-full rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm text-[color:var(--foreground)] shadow-none outline-none focus:border-[color:var(--foreground)]/30";

const qtySelectClass =
  "form-field mt-0 block w-auto min-w-[4.5rem] rounded-xl border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--foreground)] shadow-none outline-none focus:border-[color:var(--foreground)]/30";

type SlotRow = {
  slot_start: string;
  booked: number;
  capacity: number;
  remaining: number;
};

function SubmitButton({ disabled, pending }: { disabled: boolean; pending: boolean }) {
  const { t } = useI18n();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full text-left text-sm font-medium text-[color:var(--foreground-muted)] underline decoration-[color:var(--border)] underline-offset-[6px] transition-[color,text-decoration-color] hover:text-[color:var(--foreground)] hover:decoration-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:text-[color:var(--foreground-muted)] disabled:hover:decoration-[color:var(--border)] sm:w-auto"
    >
      {pending ? t("bookForm.sending") : t("bookForm.confirm")}
    </button>
  );
}

function formatSlotLabel(iso: string): string {
  const start = DateTime.fromISO(iso, { zone: "utc" }).setZone(POPUP_TIMEZONE);
  const end = start.plus({ minutes: 30 });
  return `${start.toFormat("h:mm a")}–${end.toFormat("h:mm a")}`;
}

export function BookForm() {
  const { locale, t } = useI18n();
  const [state, formAction, isSubmitPending] = useActionState(submitBooking, initial);
  const [slots, setSlots] = useState<SlotRow[] | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [cupBySlug, setCupBySlug] = useState<Record<string, number> | null>(null);
  const [cupsDemo, setCupsDemo] = useState(false);
  const [coffeeCupsError, setCoffeeCupsError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isInitialReady, setIsInitialReady] = useState(false);
  const revealRootRef = useRef<HTMLDivElement | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [coffeeChecked, setCoffeeChecked] = useState<Record<string, boolean>>({});
  const [coffeeQty, setCoffeeQty] = useState<Record<string, number>>({});
  /** Controlled so the chosen slot survives re-renders after a server action and is always posted as `slot_start`. */
  const [selectedSlot, setSelectedSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [guest2, setGuest2] = useState("");
  const [guest3, setGuest3] = useState("");
  const [guest4, setGuest4] = useState("");

  const loadLiveAvailability = useCallback(() => {
    startTransition(async () => {
      setSlotsError(null);
      setCoffeeCupsError(null);
      try {
        const [slotRes, cupRes] = await Promise.all([
          fetch(`/api/slots?date=${encodeURIComponent(POPUP_EVENT_DATE)}`, {
            cache: "no-store",
          }),
          fetch("/api/coffee-cups", { cache: "no-store" }),
        ]);

        const slotJson = (await slotRes.json()) as {
          slots?: SlotRow[];
          error?: string;
          message?: string;
          supabase_error?: string;
        };
        const cupJson = (await cupRes.json()) as {
          cups?: { coffee_slug: string; remaining: number }[];
          demo?: boolean;
          supabase_error?: string;
          message?: string;
        };

        if (!slotRes.ok) {
          setSlotsError(
            slotJson.message ??
              slotJson.error ??
              t("bookForm.slotLoadErrorStatus", { status: String(slotRes.status) }),
          );
          setSlots([]);
        } else {
          if (slotJson.supabase_error) {
            setSlotsError(t("bookForm.slotLiveCounts", { reason: slotJson.supabase_error }));
          }
          setSlots(slotJson.slots ?? []);
        }

        if (!cupRes.ok) {
          setCoffeeCupsError(
            cupJson.message ??
              t("bookForm.slotLoadErrorStatus", { status: String(cupRes.status) }),
          );
          setCupBySlug(null);
          setCupsDemo(false);
        } else {
          setCupsDemo(Boolean(cupJson.demo));
          if (cupJson.supabase_error) {
            setCoffeeCupsError(
              t("bookForm.coffeeCupLiveCounts", { reason: cupJson.supabase_error }),
            );
          }
          if (cupJson.demo || !Array.isArray(cupJson.cups)) {
            setCupBySlug(null);
          } else {
            const next: Record<string, number> = {};
            for (const row of cupJson.cups) {
              next[row.coffee_slug] = Math.max(0, Number(row.remaining));
            }
            setCupBySlug(next);
          }
        }
      } catch {
        setSlotsError(t("bookForm.slotLoadError"));
        setSlots([]);
        setCoffeeCupsError(t("bookForm.slotLoadError"));
        setCupBySlug(null);
      } finally {
        setIsInitialReady(true);
      }
    });
  }, [t]);

  useEffect(() => {
    loadLiveAvailability();
  }, [loadLiveAvailability]);

  useEffect(() => {
    if (!isInitialReady) return;
    (window as Window & { __bookInitialReady?: boolean }).__bookInitialReady = true;
    window.dispatchEvent(new CustomEvent("book:initial-ready"));
  }, [isInitialReady]);

  useEffect(() => {
    if (!isInitialReady) return;
    const root = revealRootRef.current;
    if (!root) return;

    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>("[data-book-reveal]"),
    );
    nodes.forEach((el, index) => {
      if (!el.style.getPropertyValue("--book-reveal-delay")) {
        const explicitDelay = Number(el.dataset.bookDelay ?? "");
        const delayMs =
          Number.isFinite(explicitDelay) && explicitDelay >= 0
            ? explicitDelay
            : Math.min(index * 60, 760);
        el.style.setProperty("--book-reveal-delay", `${delayMs}ms`);
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          target.classList.add("book-reveal-visible");
          observer.unobserve(target);
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    nodes.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isInitialReady, slots, locale, partySize]);

  /** Keep slot + cup counts in sync when bookings change (e.g. admin delete). */
  useEffect(() => {
    const intervalMs = 25_000;
    const interval = window.setInterval(() => loadLiveAvailability(), intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") loadLiveAvailability();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadLiveAvailability]);

  const coffeeRows = useMemo(() => getCoffeeRowsForBookingForm(locale), [locale]);

  useEffect(() => {
    if (!cupBySlug || cupsDemo) return;
    setCoffeeChecked((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const slug of Object.keys(next)) {
        if (
          next[slug] &&
          Object.hasOwn(cupBySlug, slug) &&
          cupBySlug[slug] <= 0
        ) {
          next[slug] = false;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    setCoffeeQty((q) => {
      const next = { ...q };
      let changed = false;
      for (const slug of Object.keys(next)) {
        if (Object.hasOwn(cupBySlug, slug) && cupBySlug[slug] <= 0) {
          delete next[slug];
          changed = true;
        }
      }
      return changed ? next : q;
    });
  }, [cupBySlug, cupsDemo]);

  useEffect(() => {
    setCoffeeChecked({});
    setCoffeeQty({});
    setSelectedSlot("");
    setName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setGuest2("");
    setGuest3("");
    setGuest4("");
  }, [locale]);

  useEffect(() => {
    if (!slots?.length || !selectedSlot) return;
    const stillThere = slots.some((s) => s.slot_start === selectedSlot);
    if (!stillThere) setSelectedSlot("");
  }, [slots, selectedSlot]);

  useEffect(() => {
    if (!state.ok || !state.bookingId) return;
    setSelectedSlot("");
    setName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setGuest2("");
    setGuest3("");
    setGuest4("");
    setPartySize(2);
    setCoffeeChecked({});
    setCoffeeQty({});
  }, [state.ok, state.bookingId]);

  const coffeeChoiceJson = useMemo(() => {
    const items = coffeeRows
      .filter((r) => coffeeChecked[r.slug])
      .map((r) => ({ slug: r.slug, qty: coffeeQty[r.slug] ?? 1 }));
    return JSON.stringify({
      v: COFFEE_CHOICE_JSON_VERSION,
      serve: "hot",
      unsure: false,
      items,
    });
  }, [coffeeChecked, coffeeQty, coffeeRows]);

  const totalCoffeeQty = useMemo(() => {
    return coffeeRows
      .filter((r) => coffeeChecked[r.slug])
      .reduce((s, r) => s + (coffeeQty[r.slug] ?? 1), 0);
  }, [coffeeChecked, coffeeQty, coffeeRows]);

  const coffeeChoiceValid = coffeeRows.some((r) => coffeeChecked[r.slug]);
  const qtyWithinParty = totalCoffeeQty <= partySize;

  useEffect(() => {
    setCoffeeQty((q) => {
      const next = { ...q };
      let changed = false;
      const maxParty = Math.min(4, partySize);
      for (const row of coffeeRows) {
        if (!coffeeChecked[row.slug]) continue;
        const inv =
          cupBySlug && !cupsDemo && Object.hasOwn(cupBySlug, row.slug)
            ? cupBySlug[row.slug]
            : undefined;
        const cap = inv !== undefined ? Math.min(maxParty, inv) : maxParty;
        if ((q[row.slug] ?? 1) > cap) {
          next[row.slug] = Math.max(1, cap);
          changed = true;
        }
      }
      return changed ? next : q;
    });
  }, [coffeeRows, coffeeChecked, partySize, cupBySlug, cupsDemo]);

  return (
    <div ref={revealRootRef} className="grid gap-12 lg:grid-cols-5">
      <div className={`${isInitialReady ? "lg:col-span-2" : "lg:col-span-2 opacity-0"}`}>
        <h2
          data-book-reveal="left"
          className="book-reveal-init text-3xl font-semibold tracking-tight text-[color:var(--foreground)]"
        >
          {t("bookForm.yourVisit")}
        </h2>
        <p
          data-book-reveal="left"
          className="book-reveal-init mt-4 text-sm leading-relaxed text-[color:var(--foreground-muted)]"
        >
          {t("bookForm.visitHelp")}
        </p>
        <div
          data-book-reveal="left"
          className="book-reveal-init mt-8 space-y-3 text-sm text-[color:var(--foreground)]"
        >
          <p>
            <span className="font-medium text-[color:var(--foreground-muted)]">
              {t("bookForm.whenLabel")}
            </span>{" "}
            <span>{t("bookForm.whenValue")}</span>
          </p>
          <p>
            <span className="font-medium text-[color:var(--foreground-muted)]">
              {t("bookForm.whereLabel")}
            </span>{" "}
            <span>{t("bookForm.whereValue")}</span>
          </p>
        </div>
        {slotsError && (
          <p data-book-reveal="left" className="book-reveal-init mt-4 text-sm text-amber-800">
            {slotsError}
          </p>
        )}
      </div>

      <form action={formAction} className="space-y-10 lg:col-span-3">
        <input type="hidden" name="slot_start" value={selectedSlot} />
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          aria-hidden="true"
        />

        <fieldset key={POPUP_EVENT_DATE} className="space-y-4">
          {isInitialReady ? (
            <>
              <legend
                data-book-reveal="up"
                className="book-reveal-init text-2xl font-semibold tracking-tight text-[color:var(--foreground)]"
              >
                {t("bookForm.timeslot")}
              </legend>
              {!slots?.length && !isPending && (
                <p
                  data-book-reveal="up"
                  className="book-reveal-init text-sm text-[color:var(--foreground-muted)]"
                >
                  {t("bookForm.noSlots")}
                </p>
              )}
              <ul className="space-y-3">
                {slots?.map((row, index) => {
                  const disabled = row.remaining <= 0;
                  return (
                    <li
                      key={row.slot_start}
                      data-book-reveal="up"
                      data-book-delay={90 + index * 50}
                      className="book-reveal-init"
                    >
                      <label
                        className={`book-on-light-surface flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4 text-sm shadow-none transition-colors ${
                          disabled
                            ? "cursor-not-allowed opacity-50"
                            : "hover:border-[color:var(--foreground)]/20"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="slot_pick"
                            value={row.slot_start}
                            checked={selectedSlot === row.slot_start}
                            disabled={disabled}
                            onChange={() => setSelectedSlot(row.slot_start)}
                          />
                          <span className="font-medium text-[color:var(--foreground)]">
                            {formatSlotLabel(row.slot_start)}
                          </span>
                        </span>
                        <span className="text-[color:var(--foreground-muted)]">
                          {disabled
                            ? t("bookForm.full")
                            : t("bookForm.spots", {
                                remaining: row.remaining,
                                capacity: row.capacity,
                              })}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <label
            data-book-reveal="up"
            className="book-reveal-init block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]"
          >
            {t("bookForm.partySize")}
            <select
              name="party_size"
              required
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
              className={fieldClass}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? t("bookForm.guest") : t("bookForm.guests")}
                </option>
              ))}
            </select>
          </label>

          <fieldset data-book-reveal="up" className="book-reveal-init sm:col-span-2">
            <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
              {t("bookForm.coffeeChoice")}
            </legend>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--foreground-muted)]">
              {t("bookForm.coffeeChoiceHelp")}
            </p>
            {coffeeCupsError ? (
              <p className="mt-2 text-sm text-amber-800" role="status">
                {coffeeCupsError}
              </p>
            ) : null}
            <input type="hidden" name="coffee_choice" value={coffeeChoiceJson} readOnly />

            <ul className="mt-4 space-y-3" key={locale}>
              {coffeeRows.map((row) => {
                const checked = Boolean(coffeeChecked[row.slug]);
                const inv =
                  cupBySlug && !cupsDemo && Object.hasOwn(cupBySlug, row.slug)
                    ? cupBySlug[row.slug]
                    : undefined;
                const soldOut = inv !== undefined && inv <= 0;
                const maxQty = Math.min(4, partySize, inv ?? 999);
                return (
                  <li
                    key={row.slug}
                    data-book-reveal="up"
                    className={`book-reveal-init book-on-light-surface flex flex-wrap items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm transition-opacity duration-500 sm:flex-nowrap sm:justify-between ${
                      soldOut ? "opacity-45 book-sold-out-fade" : "opacity-100"
                    }`}
                  >
                    <label
                      className={`flex min-w-0 flex-1 items-center gap-3 ${soldOut ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={soldOut}
                        onChange={(e) => {
                          if (soldOut) return;
                          const on = e.target.checked;
                          setCoffeeChecked((c) => ({ ...c, [row.slug]: on }));
                          if (on) {
                            setCoffeeQty((q) => ({ ...q, [row.slug]: q[row.slug] ?? 1 }));
                          } else {
                            setCoffeeQty((q) => {
                              const next = { ...q };
                              delete next[row.slug];
                              return next;
                            });
                          }
                        }}
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="font-medium text-[color:var(--foreground)]">
                          {row.label}
                        </span>
                        {inv !== undefined ? (
                          <span className="text-xs font-medium text-[color:var(--foreground-muted)]">
                            {soldOut
                              ? t("bookForm.coffeeSoldOutBadge")
                              : t("bookForm.coffeeCupsLeft", { count: inv })}
                          </span>
                        ) : null}
                      </span>
                    </label>
                    <label className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground-muted)]">
                      <span className="whitespace-nowrap">{t("bookForm.qty")}</span>
                      <select
                        className={qtySelectClass}
                        disabled={!checked || soldOut || maxQty < 1}
                        value={Math.min(coffeeQty[row.slug] ?? 1, Math.max(1, maxQty))}
                        onChange={(e) =>
                          setCoffeeQty((q) => ({
                            ...q,
                            [row.slug]: Number(e.target.value),
                          }))
                        }
                      >
                        {Array.from({ length: Math.max(1, maxQty) }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  </li>
                );
              })}
            </ul>
            {!qtyWithinParty && (
              <p className="mt-3 text-sm text-amber-800" role="alert">
                {translateBookingUiMessage(
                  "Total tasting quantities cannot exceed party size.",
                  locale,
                )}
              </p>
            )}
          </fieldset>
        </div>

        <div className="grid gap-6">
          <label
            data-book-reveal="up"
            className="book-reveal-init block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]"
          >
            {partySize === 1 ? t("bookForm.name") : t("bookForm.guest1")}
            <input
              name="name"
              required
              autoComplete="name"
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          {partySize >= 2 ? (
            <label
              data-book-reveal="up"
              className="book-reveal-init block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]"
            >
              {t("bookForm.guest2")}
              <input
                name="guest_name_2"
                required
                autoComplete="name"
                className={fieldClass}
                value={guest2}
                onChange={(e) => setGuest2(e.target.value)}
              />
            </label>
          ) : null}
          {partySize >= 3 ? (
            <label
              data-book-reveal="up"
              className="book-reveal-init block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]"
            >
              {t("bookForm.guest3")}
              <input
                name="guest_name_3"
                required
                autoComplete="name"
                className={fieldClass}
                value={guest3}
                onChange={(e) => setGuest3(e.target.value)}
              />
            </label>
          ) : null}
          {partySize >= 4 ? (
            <label
              data-book-reveal="up"
              className="book-reveal-init block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]"
            >
              {t("bookForm.guest4")}
              <input
                name="guest_name_4"
                required
                autoComplete="name"
                className={fieldClass}
                value={guest4}
                onChange={(e) => setGuest4(e.target.value)}
              />
            </label>
          ) : null}
          <label
            data-book-reveal="up"
            className="book-reveal-init block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]"
          >
            {t("bookForm.email")}
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label
            data-book-reveal="up"
            className="book-reveal-init block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]"
          >
            {t("bookForm.phone")}{" "}
            <span className="font-normal normal-case text-[color:var(--foreground-muted)]">
              {t("bookForm.optional")}
            </span>
            <input
              name="phone"
              autoComplete="tel"
              className={fieldClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label
            data-book-reveal="up"
            className="book-reveal-init block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]"
          >
            {t("bookForm.notes")}{" "}
            <span className="font-normal normal-case text-[color:var(--foreground-muted)]">
              {t("bookForm.optional")}
            </span>
            <textarea
              name="notes"
              rows={3}
              className={fieldClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>

        <p
          data-book-reveal="up"
          className="book-reveal-init text-xs leading-relaxed text-[color:var(--foreground-muted)]"
        >
          {t("bookForm.privacy")}
        </p>

        {state.message && (
          <p
            data-book-reveal="up"
            role={state.ok ? "status" : "alert"}
            className={`book-reveal-init text-sm ${state.ok ? "text-emerald-800" : "text-amber-800"}`}
          >
            {translateBookingUiMessage(state.message, locale)}
          </p>
        )}

        <div data-book-reveal="up" className="book-reveal-init">
          <SubmitButton
            pending={isSubmitPending}
            disabled={
              isPending ||
              !slots?.length ||
              !slots.some((row) => row.remaining > 0) ||
              !selectedSlot.trim() ||
              !coffeeChoiceValid ||
              !qtyWithinParty
            }
          />
        </div>
      </form>
    </div>
  );
}
