import { adminLogout } from "@/app/actions/adminAuth";
import { AdminDeleteBookingButton } from "@/components/AdminDeleteBookingButton";
import { getCoffeeChoiceLabel } from "@/lib/coffees";
import { POPUP_TIMEZONE } from "@/lib/config";
import { DateTime } from "luxon";
import Link from "next/link";
import type { ReactNode } from "react";

export type AdminBookingRow = {
  id: string;
  slot_start: string;
  party_size: number;
  coffee_choice: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

function formatSlot(iso: string): string {
  const dt = DateTime.fromISO(iso, { zone: "utc" }).setZone(POPUP_TIMEZONE);
  if (!dt.isValid) return iso;
  return dt.toFormat("ccc, MMM d, yyyy · h:mm a");
}

function formatCreated(iso: string): string {
  const dt = DateTime.fromISO(iso, { zone: "utc" }).setZone(POPUP_TIMEZONE);
  if (!dt.isValid) return iso;
  return dt.toFormat("MMM d, yyyy · h:mm a");
}

export function AdminBookingsTable({ rows }: { rows: AdminBookingRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-10 text-center text-sm text-[color:var(--foreground-muted)]">
        No bookings yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-[color:var(--border)] bg-[color:var(--surface)]">
      <table className="w-full min-w-[60rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[color:var(--border)] text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground-muted)]">
            <th className="px-4 py-3 font-semibold">Slot</th>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Phone</th>
            <th className="px-4 py-3 font-semibold">Party</th>
            <th className="px-4 py-3 font-semibold">Coffee</th>
            <th className="px-4 py-3 font-semibold">Notes</th>
            <th className="px-4 py-3 font-semibold">Booked</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 w-24 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[color:var(--border)] last:border-b-0 align-top"
            >
              <td className="px-4 py-3 whitespace-nowrap">{formatSlot(row.slot_start)}</td>
              <td className="px-4 py-3">{row.name}</td>
              <td className="px-4 py-3">
                <a
                  href={`mailto:${encodeURIComponent(row.email)}`}
                  className="underline decoration-[color:var(--border)] underline-offset-2"
                >
                  {row.email}
                </a>
              </td>
              <td className="px-4 py-3 text-[color:var(--foreground-muted)]">
                {row.phone ? (
                  <a
                    href={`tel:${row.phone.replace(/\D/g, "")}`}
                    className="text-[color:var(--foreground)] underline decoration-[color:var(--border)] underline-offset-2"
                  >
                    {row.phone}
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{row.party_size}</td>
              <td className="px-4 py-3">{getCoffeeChoiceLabel(row.coffee_choice)}</td>
              <td className="max-w-[12rem] px-4 py-3 text-[color:var(--foreground-muted)]">
                {row.notes?.trim() ? row.notes : "—"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-[color:var(--foreground-muted)]">
                {formatCreated(row.created_at)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{row.status}</td>
              <td className="px-4 py-3 align-top">
                <AdminDeleteBookingButton bookingId={row.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminBookingsCards({ rows }: { rows: AdminBookingRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-10 text-center text-sm text-[color:var(--foreground-muted)]">
        No bookings yet.
      </p>
    );
  }

  return (
    <ul className="space-y-4 lg:hidden">
      {rows.map((row) => (
        <li
          key={row.id}
          className="border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4 text-sm"
        >
          <p className="font-medium">{row.name}</p>
          <p className="mt-1 text-[color:var(--foreground-muted)]">{formatSlot(row.slot_start)}</p>
          <p className="mt-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground-muted)]">
              Coffee
            </span>
            <br />
            {getCoffeeChoiceLabel(row.coffee_choice)}
          </p>
          <p className="mt-2">
            <a href={`mailto:${encodeURIComponent(row.email)}`} className="underline underline-offset-2">
              {row.email}
            </a>
          </p>
          {row.phone ? (
            <p className="mt-1">
              <a href={`tel:${row.phone.replace(/\D/g, "")}`} className="underline underline-offset-2">
                {row.phone}
              </a>
            </p>
          ) : null}
          <p className="mt-2 text-[color:var(--foreground-muted)]">
            Party of {row.party_size} · {row.status}
          </p>
          {row.notes?.trim() ? <p className="mt-2 text-[color:var(--foreground-muted)]">{row.notes}</p> : null}
          <div className="mt-4 flex justify-end border-t border-[color:var(--border)] pt-3">
            <AdminDeleteBookingButton bookingId={row.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AdminDashboardChrome({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
          <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">
            Reservations and coffee choices (admin only).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-[color:var(--foreground-muted)] underline decoration-[color:var(--border)] underline-offset-4"
          >
            View site
          </Link>
          <form action={adminLogout}>
            <button
              type="submit"
              className="text-sm font-medium text-[color:var(--foreground-muted)] underline decoration-[color:var(--border)] underline-offset-4"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      <div className="mt-10">{children}</div>
    </div>
  );
}
