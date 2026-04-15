# Circle Kettle

Next.js (App Router) site for **Circle Kettle** at **UIUC**: **charcoal and warm off‑white** editorial layout, **three featured coffees on the homepage** (each opens a slide-in detail panel), and **Supabase-backed reservations** for shared 30‑minute slots with a configurable headcount cap.

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
cp .env.example .env.local   # skip if .env.local already exists
# fill in Supabase keys — step-by-step: [docs/supabase-env-setup.md](docs/supabase-env-setup.md)
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
2. Apply migrations **either** in the **SQL Editor** (paste and run each file under `supabase/migrations/`), **or** from this repo with the **Supabase CLI** (installed as a dev dependency):

   ```bash
   npm run supabase:login          # once per machine: browser or paste access token from Account → Access Tokens
   npm run supabase:link           # links this folder to your project (ref matches your NEXT_PUBLIC_SUPABASE_URL host)
   npm run supabase:db:push:dry    # optional: see pending migrations
   npm run supabase:db:push        # applies pending migrations; use -p if prompted, e.g. npx supabase db push -p YOUR_DB_PASSWORD
   ```

   The **database password** is under **Project Settings → Database** (not the API keys in `.env.local`). If `db push` asks for it, pass `-p` or set `SUPABASE_DB_PASSWORD` for that shell session.

3. Copy **Project URL**, **anon public** key, and **service_role** key into `.env.local` as in [`.env.example`](.env.example).  

### Security model

- **`bookings`** has RLS enabled and **no policies** for `anon` / `authenticated` — the table is not directly readable or writable from the browser.  
- **`get_slot_booked_totals`** is `SECURITY DEFINER`; **`anon` may execute** it so the site can show remaining capacity without exposing PII.  
- **`create_booking`** is `SECURITY DEFINER`; **only `service_role` may execute** it. The Next.js **server action** calls this with the service key so inserts are never open to the public anon key.  

Keep `SUPABASE_SERVICE_ROLE_KEY` **server-only** (never `NEXT_PUBLIC_*`).

## Admin dashboard

- **URL:** **`/admin`** on your site origin (local: [http://localhost:3000/admin](http://localhost:3000/admin)). If you are not signed in, you are sent to **`/admin/login`**.  
- **Sign-in:** By default both **username** and **password** are **`coffee`** (no env vars required for that demo setup). Set `ADMIN_DASHBOARD_USERNAME` and `ADMIN_DASHBOARD_PASSWORD` in `.env.local` to override.  
- The dashboard lists **all bookings** (name, email, phone, slot, party size, coffee choice, notes) using the **service role** on the server only; `bookings` stays closed to the browser anon key.  
- Routes under `/admin` except `/admin/login` are protected by **middleware** (signed **httpOnly** cookie). Use **Sign out** on the dashboard to clear the session.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | For bookings + live availability | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | For live availability + SSR helpers | New **Publishable** key (`sb_publishable_…`); preferred |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional fallback | Legacy **anon** JWT if publishable key is not set |
| `SUPABASE_SERVICE_ROLE_KEY` | For creating bookings + `/admin` | Legacy **service_role** JWT or new **Secret** key (`sb_secret_…`); server-only |
| `ADMIN_DASHBOARD_USERNAME` | Optional (default **`coffee`**) | Admin login username |
| `ADMIN_DASHBOARD_PASSWORD` | Optional (default **`coffee`**) | Admin login password; also used to sign the session cookie unless `ADMIN_SESSION_SECRET` is set |
| `ADMIN_SESSION_SECRET` | Optional | If set, used to sign admin cookies instead of the dashboard password |
| `BOOKING_SLOT_CAPACITY` | Optional (default `8`) | Max total guests per 30‑minute slot |

If Supabase env vars are missing, `/api/slots` still returns the slot grid with **full remaining capacity** (`demo: true`) so the UI can be reviewed; the server action returns a clear “not configured” message until keys are set.

## Booking rules (product)

- **One event day:** Saturday **April 18, 2026**, **`America/Chicago`**, **1:00 PM–5:00 PM**. Slots are every **30 minutes** (eight windows). Change the date or hours in [`lib/config.ts`](lib/config.ts) (`POPUP_EVENT_DATE`, `POPUP_HOURS`, `POPUP_TIMEZONE`).  
- **Venue:** 1004 W Main Street, Urbana, IL 61801, Unit 204 (also on the homepage and booking copy).  
- Multiple parties may share a slot until **`BOOKING_SLOT_CAPACITY`** total `party_size` is reached.  
- Party size per booking: **1–4**.  
- `create_booking` uses a **transaction-scoped advisory lock** per `slot_start` so concurrent requests cannot oversubscribe a slot.  

## Deploying to Vercel

Vercel **does not read** a committed `.env.local` from the repo. You configure variables in the Vercel dashboard (or CLI); builds inject them at compile/runtime. **`.env.local` stays gitignored** so secret keys are never pushed to GitHub.

1. Push the repository to GitHub (or GitLab / Bitbucket).  
2. [Import the project](https://vercel.com/new) in Vercel and connect the repo.  
3. In Vercel: **Project → Settings → Environment Variables**. For **Production** (and **Preview** if you use it), add each name from [`.env.example`](.env.example) that your app needs, at minimum:  
   - `NEXT_PUBLIC_SUPABASE_URL`  
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`, or use legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`)  
   - `SUPABASE_SERVICE_ROLE_KEY` (secret `sb_secret_…` or legacy service_role)  
   Paste the **same values** you use locally in `.env.local`.  
4. **Redeploy** (Deployments → … → Redeploy) so a new build picks up the variables.  

Local dev: keep using **`.env.local`** on your machine only (`cp .env.example .env.local` then fill in). After changing env on Vercel, redeploy; after changing `.env.local`, restart `npm run dev`.

## Content

Three coffee listings live in [`data/coffees.json`](data/coffees.json) with images under [`public/coffees/`](public/coffees/). On the **homepage**, they appear in a **full-width row** (same horizontal padding as the rest of the page) **below “Calm space, clear flavors”**; the hours/address block sits **below** the coffee row. Hover reveals name and notes; click opens a **slide-in panel from the right** (about one-third of the viewport) with full tasting copy. They also power the booking form’s coffee dropdown. Swap JSON and artwork without touching the database.

## Optional hardening

- Add IP-based rate limiting on `POST` (e.g. Vercel KV / Upstash) if you see spam.  
- Add email notifications (Resend, etc.) on successful `create_booking` from the server action.
