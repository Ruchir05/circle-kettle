import { AdminBookingsCards, AdminBookingsTable, AdminDashboardChrome } from "@/components/AdminBookingsTable";
import type { AdminBookingRow } from "@/lib/adminBookingTypes";
import { AdminCoffeeCapsPanel, type AdminCoffeeCapRow } from "@/components/AdminCoffeeCapsPanel";
import { getCoffeeForDisplay, getCoffeeRowsForAdminEdit } from "@/lib/coffees";
import { POPUP_EVENT_DATE, POPUP_TIMEZONE } from "@/lib/config";
import { createServiceClient } from "@/lib/supabase/service";
import { getSlotStartsForCalendarDay } from "@/lib/schedule";
import { DateTime } from "luxon";
import type { ReactNode } from "react";

function formatAdminSlotLabel(iso: string): string {
  const start = DateTime.fromISO(iso, { zone: "utc" }).setZone(POPUP_TIMEZONE);
  const end = start.plus({ minutes: 30 });
  return `${start.toFormat("h:mm a")}–${end.toFormat("h:mm a")}`;
}

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const client = createServiceClient();
  if (!client) {
    return (
      <AdminDashboardChrome>
        <div className="max-w-xl rounded border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-4 text-sm text-red-900">
          <p className="font-medium">Supabase is not configured for server-side access.</p>
          <p className="mt-2 text-[color:var(--foreground-muted)]">
            Add both of these to <code className="text-[color:var(--foreground)]">.env.local</code> (see{" "}
            <code className="text-[color:var(--foreground)]">.env.example</code>), then restart{" "}
            <code className="text-[color:var(--foreground)]">npm run dev</code>:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 font-mono text-xs text-[color:var(--foreground)]">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>
              <code className="text-[0.7rem]">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> (or legacy{" "}
              <code className="text-[0.7rem]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>)
            </li>
            <li>SUPABASE_SERVICE_ROLE_KEY (secret <code className="text-[0.7rem]">sb_secret_…</code> or legacy service_role)</li>
          </ul>
          <p className="mt-3 text-xs text-[color:var(--foreground-muted)]">
            Supabase → Settings → <strong>API Keys</strong>. Use the <strong>Secret</strong> key only on the server—never in the browser or git.
          </p>
        </div>
      </AdminDashboardChrome>
    );
  }

  const bookingColumnsFull =
    "id, slot_start, party_size, coffee_choice, name, email, phone, notes, status, created_at, guest_name_2, guest_name_3, guest_name_4";
  const bookingColumnsBase =
    "id, slot_start, party_size, coffee_choice, name, email, phone, notes, status, created_at";

  const primary = await client
    .from("bookings")
    .select(bookingColumnsFull)
    .order("slot_start", { ascending: true })
    .order("created_at", { ascending: true });

  let rowsData: AdminBookingRow[] | null = (primary.data as AdminBookingRow[]) ?? null;
  let loadError = primary.error;

  const msg = loadError?.message ?? "";
  const missingGuestColumn = /guest_name/i.test(msg) && /does not exist/i.test(msg);

  if (loadError && missingGuestColumn) {
    const fallback = await client
      .from("bookings")
      .select(bookingColumnsBase)
      .order("slot_start", { ascending: true })
      .order("created_at", { ascending: true });
    rowsData = (fallback.data as AdminBookingRow[]) ?? null;
    loadError = fallback.error;
  }

  if (loadError) {
    return (
      <AdminDashboardChrome>
        <p className="text-sm text-amber-800" role="alert">
          Could not load bookings: {loadError.message}
        </p>
      </AdminDashboardChrome>
    );
  }

  const rows = rowsData ?? [];

  const slotStarts = getSlotStartsForCalendarDay(POPUP_EVENT_DATE);
  const slotOptions = slotStarts.map((iso) => ({
    value: iso,
    label: formatAdminSlotLabel(iso),
  }));
  const coffeeEditOptions = getCoffeeRowsForAdminEdit("en");

  const capsRes = await client
    .from("coffee_cup_caps")
    .select("coffee_slug, max_cups")
    .order("coffee_slug", { ascending: true });

  let coffeeCapSection: ReactNode = null;
  if (capsRes.error) {
    coffeeCapSection = (
      <p className="mb-10 text-sm text-amber-800" role="alert">
        Could not load coffee cup caps: {capsRes.error.message}
      </p>
    );
  } else {
    const availRes = await client.rpc("get_coffee_cup_availability");
    const availList = Array.isArray(availRes.data) ? availRes.data : [];
    const availBySlug = new Map(
      availList.map(
        (r: { coffee_slug: string; booked: number; remaining: number }) =>
          [String(r.coffee_slug), { booked: Number(r.booked), remaining: Number(r.remaining) }] as const,
      ),
    );
    const capRows: AdminCoffeeCapRow[] = (capsRes.data ?? []).map(
      (row: { coffee_slug: string; max_cups: number }) => {
        const slug = String(row.coffee_slug);
        const snap = availBySlug.get(slug);
        return {
          slug,
          label: getCoffeeForDisplay(slug, "en")?.name ?? slug,
          maxCups: Number(row.max_cups),
          ...(snap
            ? { booked: snap.booked, remaining: snap.remaining }
            : {}),
        };
      },
    );
    const countsWarning =
      availRes.error != null
        ? `Live booked / remaining counts unavailable: ${availRes.error.message}. You can still edit max caps.`
        : null;
    coffeeCapSection =
      capRows.length > 0 ? (
        <div className="mb-10">
          <AdminCoffeeCapsPanel rows={capRows} countsWarning={countsWarning} />
        </div>
      ) : null;
  }

  return (
    <AdminDashboardChrome>
      {coffeeCapSection}
      <h2 className="mb-4 text-lg font-semibold tracking-tight">Bookings</h2>
      <div className="hidden lg:block">
        <AdminBookingsTable rows={rows} slotOptions={slotOptions} coffeeOptions={coffeeEditOptions} />
      </div>
      <div className="lg:hidden">
        <AdminBookingsCards rows={rows} slotOptions={slotOptions} coffeeOptions={coffeeEditOptions} />
      </div>
    </AdminDashboardChrome>
  );
}
