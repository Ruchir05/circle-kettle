# Circle Kettle

Next.js (App Router) site for **Circle Kettle** at **UIUC**: **charcoal and warm off‑white** editorial layout, **three featured coffees on the homepage** (each opens a detail dialog), and **Supabase-backed reservations** for shared 30‑minute slots with a configurable headcount cap.

## Stack

- [Next.js](https://nextjs.org/) 16 · React 19 · TypeScript  
- [Tailwind CSS](https://tailwindcss.com/) v4  
- [Supabase](https://supabase.com/) Postgres + RPC (aggregates for availability, transactional insert with advisory lock)  
- [Luxon](https://moment.github.io/luxon/) for **`America/Chicago`** slot boundaries  
- [Zod](https://zod.dev/) for server-side booking validation  
- [Vercel](https://vercel.com/) for deployment  

## Local development

```bash
npm install
cp .env.example .env.local
# fill in Supabase keys (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

- `npm run dev` — development server  
- `npm run build` / `npm start` — production build  
- `npm run lint` — ESLint  
- `npm test` — Vitest (schedule helper)  

## Supabase setup

1. Create a project in the [Supabase dashboard](https://supabase.com/dashboard).  
2. In **SQL Editor**, run the migration in [`supabase/migrations/20260414120000_bookings.sql`](supabase/migrations/20260414120000_bookings.sql) (or use the [Supabase CLI](https://supabase.com/docs/guides/cli) to `db push`).  
3. Copy **Project URL**, **anon public** key, and **service_role** key into `.env.local` as in [`.env.example`](.env.example).  

### Security model

- **`bookings`** has RLS enabled and **no policies** for `anon` / `authenticated` — the table is not directly readable or writable from the browser.  
- **`get_slot_booked_totals`** is `SECURITY DEFINER`; **`anon` may execute** it so the site can show remaining capacity without exposing PII.  
- **`create_booking`** is `SECURITY DEFINER`; **only `service_role` may execute** it. The Next.js **server action** calls this with the service key so inserts are never open to the public anon key.  

Keep `SUPABASE_SERVICE_ROLE_KEY` **server-only** (never `NEXT_PUBLIC_*`).

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | For bookings + live availability | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For live availability | Calls `get_slot_booked_totals` from `GET /api/slots` |
| `SUPABASE_SERVICE_ROLE_KEY` | For creating bookings | Server action `create_booking` RPC |
| `BOOKING_SLOT_CAPACITY` | Optional (default `8`) | Max total guests per 30‑minute slot |

If Supabase env vars are missing, `/api/slots` still returns the slot grid with **full remaining capacity** (`demo: true`) so the UI can be reviewed; the server action returns a clear “not configured” message until keys are set.

## Booking rules (product)

- **One event day:** Saturday **April 18, 2026**, **`America/Chicago`**, **1:00 PM–5:00 PM**. Slots are every **30 minutes** (eight windows). Change the date or hours in [`lib/config.ts`](lib/config.ts) (`POPUP_EVENT_DATE`, `POPUP_HOURS`, `POPUP_TIMEZONE`).  
- **Venue:** 1004 W Main Street, Urbana, IL 61801, Unit 204 (also on the homepage and booking copy).  
- Multiple parties may share a slot until **`BOOKING_SLOT_CAPACITY`** total `party_size` is reached.  
- Party size per booking: **1–4**.  
- `create_booking` uses a **transaction-scoped advisory lock** per `slot_start` so concurrent requests cannot oversubscribe a slot.  

## Deploying to Vercel

1. Push the repository to GitHub (or GitLab / Bitbucket).  
2. [Import the project](https://vercel.com/new) in Vercel.  
3. Add the same environment variables as in `.env.example` in the Vercel project settings.  
4. Deploy.  

## Content

Three coffee listings live in [`data/coffees.json`](data/coffees.json) with images under [`public/coffees/`](public/coffees/). On the **homepage**, they appear in a **full-width row** (same horizontal padding as the rest of the page) **below “Calm space, clear flavors”**; the hours/address block sits **below** the coffee row. Hover reveals name and notes; click opens a **slide-in panel from the right** (about one-third of the viewport) with full tasting copy. They also power the booking form’s coffee dropdown. Swap JSON and artwork without touching the database.

## Optional hardening

- Add IP-based rate limiting on `POST` (e.g. Vercel KV / Upstash) if you see spam.  
- Add email notifications (Resend, etc.) on successful `create_booking` from the server action.
