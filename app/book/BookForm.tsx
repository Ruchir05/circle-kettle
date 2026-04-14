"use client";

import { submitBooking, type BookingState } from "@/app/actions/booking";
import { POPUP_EVENT_DATE, POPUP_TIMEZONE } from "@/lib/config";
import { getCoffeeOptionsForForm } from "@/lib/coffees";
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
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-8 text-sm font-semibold text-[color:var(--accent-foreground)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Sending…" : "Confirm booking"}
    </button>
  );
}

function formatSlotLabel(iso: string): string {
  const start = DateTime.fromISO(iso, { zone: "utc" }).setZone(POPUP_TIMEZONE);
  const end = start.plus({ minutes: 30 });
  return `${start.toFormat("h:mm a")}–${end.toFormat("h:mm a")}`;
}

export function BookForm() {
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
        if (!res.ok) {
          setSlotsError("Could not load availability.");
          setSlots([]);
          return;
        }
        const json = (await res.json()) as { slots: SlotRow[] };
        setSlots(json.slots ?? []);
      } catch {
        setSlotsError("Could not load availability.");
        setSlots([]);
      }
    });
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    const el = document.getElementById("slot_start_field") as HTMLInputElement | null;
    if (el) el.value = "";
  }, []);

  const coffeeOptions = useMemo(() => getCoffeeOptionsForForm(), []);

  return (
    <div className="grid gap-12 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <h2 className="font-serif text-3xl tracking-tight text-[color:var(--foreground)]">
          Your visit
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[color:var(--foreground-muted)]">
          Slots are 30 minutes, shared with other small parties until the room cap is reached.
        </p>
        <div className="mt-8 space-y-3 text-sm text-[color:var(--foreground)]">
          <p>
            <span className="font-medium text-[color:var(--foreground-muted)]">When · </span>
            Saturday, April 18, 2026 · 1:00–5:00 PM (Central)
          </p>
          <p>
            <span className="font-medium text-[color:var(--foreground-muted)]">Where · </span>
            1004 W Main Street, Urbana, IL 61801, Unit 204
          </p>
        </div>
        {slotsError && <p className="mt-4 text-sm text-red-700">{slotsError}</p>}
        {isPending && !slots && (
          <p className="mt-4 text-sm text-[color:var(--foreground-muted)]">Loading…</p>
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
          <legend className="font-serif text-2xl tracking-tight text-[color:var(--foreground)]">
            Timeslot
          </legend>
          {!slots?.length && !isPending && (
            <p className="text-sm text-[color:var(--foreground-muted)]">
              No slots are available right now. Please check back later.
            </p>
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
                      {disabled ? "Full" : `${row.remaining} / ${row.capacity} spots`}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
            Party size
            <select name="party_size" required defaultValue="2" className={fieldClass}>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)] sm:col-span-2">
            Coffee to taste
            <select name="coffee_choice" required defaultValue="" className={fieldClass}>
              <option value="" disabled>
                Select…
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
            Name
            <input name="name" required autoComplete="name" className={fieldClass} />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
            Phone{" "}
            <span className="font-normal normal-case text-[color:var(--foreground-muted)]">
              (optional)
            </span>
            <input name="phone" autoComplete="tel" className={fieldClass} />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">
            Notes{" "}
            <span className="font-normal normal-case text-[color:var(--foreground-muted)]">
              (optional)
            </span>
            <textarea name="notes" rows={3} className={fieldClass} />
          </label>
        </div>

        <p className="text-xs leading-relaxed text-[color:var(--foreground-muted)]">
          We only use your details to run this reservation. You can add a fuller privacy policy
          later; nothing here opts you into marketing.
        </p>

        {state.message && (
          <p
            role={state.ok ? "status" : "alert"}
            className={`text-sm ${state.ok ? "text-emerald-800" : "text-red-800"}`}
          >
            {state.message}
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
