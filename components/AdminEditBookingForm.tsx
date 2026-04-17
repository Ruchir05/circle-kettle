"use client";

import { updateBookingAdmin, type AdminBookingUpdatePayload } from "@/app/actions/adminBooking";
import type { AdminBookingRow, AdminCoffeeOption, AdminSlotOption } from "@/lib/adminBookingTypes";
import {
  buildCoffeeChoiceJsonFromItems,
  buildUnsureCoffeeChoiceJson,
  getBookingCoffeeLineItems,
  parseCoffeeChoiceJson,
  sumBookingCoffeeQty,
} from "@/lib/coffees";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

function normSlot(iso: string): string {
  return DateTime.fromISO(iso, { zone: "utc" }).toISO()!;
}

function matchSlotValue(iso: string, options: AdminSlotOption[]): string {
  const n = normSlot(iso);
  const hit = options.find((o) => normSlot(o.value) === n);
  return hit?.value ?? iso;
}

function isUnsureChoice(choice: string): boolean {
  const t = choice.trim().toLowerCase();
  if (t === "unsure") return true;
  return parseCoffeeChoiceJson(choice)?.unsure === true;
}

const fieldClass =
  "form-field mt-2 block w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--foreground)] shadow-none outline-none focus:border-[color:var(--foreground)]/30";

const qtySelectClass =
  "form-field mt-0 block w-auto min-w-[4.5rem] rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1.5 text-sm text-[color:var(--foreground)] shadow-none outline-none focus:border-[color:var(--foreground)]/30";

export function AdminEditBookingForm({
  row,
  slotOptions,
  coffeeOptions,
}: {
  row: AdminBookingRow;
  slotOptions: AdminSlotOption[];
  coffeeOptions: AdminCoffeeOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const initialSlot = useMemo(() => matchSlotValue(row.slot_start, slotOptions), [row.slot_start, slotOptions]);
  const initialUnsure = useMemo(() => isUnsureChoice(row.coffee_choice), [row.coffee_choice]);
  const initialCoffee = useMemo(() => {
    if (initialUnsure) {
      return { checked: {} as Record<string, boolean>, qty: {} as Record<string, number> };
    }
    const items = getBookingCoffeeLineItems(row.party_size, row.coffee_choice);
    const checked: Record<string, boolean> = {};
    const qty: Record<string, number> = {};
    for (const i of items) {
      checked[i.slug] = true;
      qty[i.slug] = i.qty;
    }
    return { checked, qty };
  }, [initialUnsure, row.party_size, row.coffee_choice]);

  const [slotStart, setSlotStart] = useState(initialSlot);
  const [partySize, setPartySize] = useState(row.party_size);
  const [notes, setNotes] = useState(row.notes ?? "");
  const [guest2, setGuest2] = useState(row.guest_name_2 ?? "");
  const [guest3, setGuest3] = useState(row.guest_name_3 ?? "");
  const [guest4, setGuest4] = useState(row.guest_name_4 ?? "");
  const [unsure, setUnsure] = useState(initialUnsure);
  const [checked, setChecked] = useState<Record<string, boolean>>(() => ({ ...initialCoffee.checked }));
  const [qty, setQty] = useState<Record<string, number>>(() => ({ ...initialCoffee.qty }));

  const maxQtyForSlug = (slug: string) => Math.min(4, partySize);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let coffee_choice: string;
    if (unsure) {
      coffee_choice = buildUnsureCoffeeChoiceJson();
    } else {
      const items = coffeeOptions
        .filter((o) => checked[o.slug])
        .map((o) => ({
          slug: o.slug,
          qty: Math.max(1, Math.min(qty[o.slug] ?? 1, maxQtyForSlug(o.slug))),
        }));
      if (items.length === 0) {
        setError("Select at least one coffee, or enable “Unsure / surprise me”.");
        return;
      }
      if (sumBookingCoffeeQty(items) > partySize) {
        setError("Total tasting quantities cannot exceed party size.");
        return;
      }
      coffee_choice = buildCoffeeChoiceJsonFromItems(items);
    }

    const payload: AdminBookingUpdatePayload = {
      slot_start: slotStart,
      party_size: partySize,
      coffee_choice,
      notes,
      guest_name_2: guest2,
      guest_name_3: guest3,
      guest_name_4: guest4,
    };

    startTransition(async () => {
      const result = await updateBookingAdmin(row.id, payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-4 border-t border-[color:var(--border)] pt-3 text-left">
      <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground-muted)]">
        Timeslot
        <select
          required
          value={slotStart}
          onChange={(e) => setSlotStart(e.target.value)}
          className={fieldClass}
        >
          {slotOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground-muted)]">
        Party size
        <select
          required
          value={partySize}
          onChange={(e) => {
            const n = Number(e.target.value);
            setPartySize(n);
            if (n < 3) setGuest3("");
            if (n < 4) setGuest4("");
          }}
          className={fieldClass}
        >
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[color:var(--foreground)]">
          <input
            type="checkbox"
            checked={unsure}
            onChange={(e) => {
              const on = e.target.checked;
              setUnsure(on);
              if (on) {
                setChecked({});
                setQty({});
              }
            }}
          />
          <span>Unsure / surprise me (no specific coffees)</span>
        </label>

        {!unsure ? (
          <ul className="space-y-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] p-3">
            {coffeeOptions.map((opt) => {
              const isOn = Boolean(checked[opt.slug]);
              const maxQ = maxQtyForSlug(opt.slug);
              return (
                <li key={opt.slug} className="flex flex-wrap items-center gap-2 text-sm">
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={(e) => {
                        const on = e.target.checked;
                        setChecked((c) => ({ ...c, [opt.slug]: on }));
                        if (on) setQty((q) => ({ ...q, [opt.slug]: q[opt.slug] ?? 1 }));
                        else setQty((q) => {
                          const next = { ...q };
                          delete next[opt.slug];
                          return next;
                        });
                      }}
                    />
                    <span className="truncate">{opt.label}</span>
                  </label>
                  <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--foreground-muted)]">
                    Qty
                    <select
                      className={qtySelectClass}
                      disabled={!isOn}
                      value={Math.min(qty[opt.slug] ?? 1, Math.max(1, maxQ))}
                      onChange={(e) =>
                        setQty((q) => ({
                          ...q,
                          [opt.slug]: Number(e.target.value),
                        }))
                      }
                    >
                      {Array.from({ length: Math.max(1, maxQ) }, (_, i) => i + 1).map((n) => (
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
        ) : null}
      </div>

      {partySize >= 2 ? (
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground-muted)]">
          Guest 2 name
          <input className={fieldClass} value={guest2} onChange={(e) => setGuest2(e.target.value)} required />
        </label>
      ) : null}
      {partySize >= 3 ? (
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground-muted)]">
          Guest 3 name
          <input className={fieldClass} value={guest3} onChange={(e) => setGuest3(e.target.value)} required />
        </label>
      ) : null}
      {partySize >= 4 ? (
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground-muted)]">
          Guest 4 name
          <input className={fieldClass} value={guest4} onChange={(e) => setGuest4(e.target.value)} required />
        </label>
      ) : null}

      <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground-muted)]">
        Notes
        <textarea rows={2} className={fieldClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      {error ? (
        <p className="text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="text-sm font-medium text-[color:var(--foreground-muted)] underline decoration-[color:var(--border)] underline-offset-[5px] transition-colors hover:text-[color:var(--foreground)] hover:decoration-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
