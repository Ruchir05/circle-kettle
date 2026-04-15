"use client";

import { submitBooking, type BookingState } from "@/app/actions/booking";
import { translateBookingUiMessage } from "@/lib/bookingUiMessages";
import { POPUP_EVENT_DATE, POPUP_TIMEZONE } from "@/lib/config";
import { getCoffeeOptionsForForm } from "@/lib/coffees";
import { useI18n } from "@/lib/i18n";
import { DateTime } from "luxon";
import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

const initial: BookingState = { ok: false, message: "" };

const fieldClass =
  "form-field mt-3 block w-full rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm text-[color:var(--foreground)] shadow-none outline-none focus:border-[color:var(--foreground)]/30";

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
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-8 text-sm font-semibold text-[color:var(--accent-foreground)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
  const [isPending, startTransition] = useTransition();

  const loadSlots = useCallback(() => {
    startTransition(async () => {
      setSlotsError(null);
      try {
        const res = await fetch(
          `/api/slots?date=${encodeURIComponent(POPUP_EVENT_DATE)}`,
          { cache: "no-store" },
        );
        const json = (await res.json()) as {
          slots?: SlotRow[];
          error?: string;
          message?: string;
          supabase_error?: string;
        };
        if (!res.ok) {
          setSlotsError(
            json.message ??
              json.error ??
              t("bookForm.slotLoadErrorStatus", { status: String(res.status) }),
          );
          setSlots([]);
          return;
        }
        if (json.supabase_error) {
          setSlotsError(t("bookForm.slotLiveCounts", { reason: json.supabase_error }));
        }
        setSlots(json.slots ?? []);
      } catch {
        setSlotsError(t("bookForm.slotLoadError"));
        setSlots([]);
      }
    });
  }, [t]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  /** Keep slot counts in sync when bookings change (e.g. admin delete); avoids needing a full reload. */
  useEffect(() => {
    const intervalMs = 25_000;
    const interval = window.setInterval(() => loadSlots(), intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") loadSlots();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadSlots]);

  useEffect(() => {
    const el = document.getElementById("slot_start_field") as HTMLInputElement | null;
    if (el) el.value = "";
  }, []);

  const coffeeOptions = useMemo(() => getCoffeeOptionsForForm(locale), [locale]);

  return (
    <div className="grid gap-12 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">
          {t("bookForm.yourVisit")}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[color:var(--foreground-muted)]">
          {t("bookForm.visitHelp")}
        </p>
        <div className="mt-8 space-y-3 text-sm text-[color:var(--foreground)]">
          <p>
            <span className="font-medium text-[color:var(--foreground-muted)]">
              {t("bookForm.whenLabel")}
            </span>
            {t("bookForm.whenValue")}
          </p>
          <p>
            <span className="font-medium text-[color:var(--foreground-muted)]">
              {t("bookForm.whereLabel")}
            </span>
            {t("bookForm.whereValue")}
          </p>
        </div>
        {slotsError && <p className="mt-4 text-sm text-red-700">{slotsError}</p>}
        {isPending && !slots && (
          <p className="mt-4 text-sm text-[color:var(--foreground-muted)]">
            {t("bookForm.loadingSlots")}
          </p>
        )}
      </div>

      <form action={formAction} className="space-y-10 lg:col-span-3">
        <input type="hidden" name="slot_start" id="slot_start_field" defaultValue="" />
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          aria-hidden="true"
        />

        <fieldset key={POPUP_EVENT_DATE} className="space-y-4">
          <legend className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
            {t("bookForm.timeslot")}
          </legend>
          {!slots?.length && !isPending && (
            <p className="text-sm text-[color:var(--foreground-muted)]">{t("bookForm.noSlots")}</p>
          )}
          <ul className="space-y-3">
            {slots?.map((row) => {
              const disabled = row.remaining <= 0;
              return (
                <li key={row.slot_start}>
                  <label
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4 text-sm shadow-none transition-colors ${
                      disabled ? "cursor-not-allowed opacity-50" : "hover:border-[color:var(--foreground)]/20"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="slot_pick"
                        value={row.slot_start}
                        disabled={disabled}
                        required
                        onChange={() => {
                          const el = document.getElementById(
                            "slot_start_field",
                          ) as HTMLInputElement | null;
                          if (el) el.value = row.slot_start;
                        }}
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
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
            {t("bookForm.partySize")}
            <select name="party_size" required defaultValue="2" className={fieldClass}>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? t("bookForm.guest") : t("bookForm.guests")}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)] sm:col-span-2">
            {t("bookForm.coffeeChoice")}
            <select
              key={locale}
              name="coffee_choice"
              required
              defaultValue=""
              className={fieldClass}
            >
              <option value="" disabled>
                {t("bookForm.selectPlaceholder")}
              </option>
              {coffeeOptions.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-6">
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
            {t("bookForm.name")}
            <input name="name" required autoComplete="name" className={fieldClass} />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
            {t("bookForm.email")}
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
            {t("bookForm.phone")}{" "}
            <span className="font-normal normal-case text-[color:var(--foreground-muted)]">
              {t("bookForm.optional")}
            </span>
            <input name="phone" autoComplete="tel" className={fieldClass} />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
            {t("bookForm.notes")}{" "}
            <span className="font-normal normal-case text-[color:var(--foreground-muted)]">
              {t("bookForm.optional")}
            </span>
            <textarea name="notes" rows={3} className={fieldClass} />
          </label>
        </div>

        <p className="text-xs leading-relaxed text-[color:var(--foreground-muted)]">
          {t("bookForm.privacy")}
        </p>

        {state.message && (
          <p
            role={state.ok ? "status" : "alert"}
            className={`text-sm ${state.ok ? "text-emerald-800" : "text-red-800"}`}
          >
            {translateBookingUiMessage(state.message, locale)}
          </p>
        )}

        <SubmitButton
          pending={isSubmitPending}
          disabled={
            isPending ||
            !slots?.length ||
            !slots.some((row) => row.remaining > 0)
          }
        />
      </form>
    </div>
  );
}
