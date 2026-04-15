# Supabase and `.env.local` — full setup

This project needs a **Supabase** project and a **`.env.local`** file at the repo root so bookings, slot availability, and `/admin` work.

A **`.env.local`** file was created for you by copying [`.env.example`](../.env.example) (only if you did not already have one). You must **replace the placeholder values** with keys from your own Supabase project.

---

## Part 1 — Create the Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in (or create an account).
2. Click **New project**.
3. Choose an organization, set a **name** (e.g. `circle-kettle`), a **database password** (save it somewhere safe), and a **region** close to your users (e.g. `Central US` for Illinois).
4. Click **Create new project** and wait until the dashboard says the project is ready (usually 1–2 minutes).

---

## Part 2 — Create the `bookings` table and functions

1. In the Supabase sidebar, open **SQL Editor**.
2. Click **New query**.
3. Open this file in your repo: [`supabase/migrations/20260414120000_bookings.sql`](../supabase/migrations/20260414120000_bookings.sql).
4. **Copy the entire contents** of that file and paste them into the SQL Editor.
5. Click **Run** (or press the shortcut shown in the editor).
6. You should see **Success** with no errors. If you see an error, copy the message and fix it (e.g. run only once; if objects already exist, the migration uses `if not exists` where possible).

This creates the `bookings` table, RLS, `get_slot_booked_totals`, and `create_booking` RPC as the app expects.

---

## Part 3 — Copy API keys into `.env.local`

Supabase may show either **new** keys (`sb_publishable_…` / `sb_secret_…`) or **legacy** JWT keys (`anon` / `service_role`). Both work with `supabase-js` on the hosted platform—use whichever your dashboard offers.

### If you see “Publishable” and “Secret” keys (new UI)

1. Open **Project Settings** → **API Keys** (or the **Connect** dialog for your project).
2. Copy the **Project URL** (same as before). In `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=<Project URL>
   ```

3. Under **Publishable key**, copy the value starting with `sb_publishable_`. Set:

   ```env
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<paste publishable key here>
   ```

   (The app also accepts legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` if the publishable variable is unset.)

4. Under **Secret keys**, copy the **secret** value starting with `sb_secret_`. Set:

   ```env
   SUPABASE_SERVICE_ROLE_KEY=<paste secret key here>
   ```

   **Warning:** Secret / `service_role` **bypasses Row Level Security**. Never put it in `NEXT_PUBLIC_*`, never commit it, never use it in the browser. This app only uses it on the **server** (bookings + `/admin`).

### If you see legacy JWT keys instead

1. **Settings** → **API** → tab **Legacy API keys** (wording may vary).
2. **`anon` `public`** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. **`service_role`** (reveal) → `SUPABASE_SERVICE_ROLE_KEY`
4. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`

5. Save **`.env.local`**.

Optional lines from `.env.example` (phone on site, slot capacity, admin overrides) can stay commented unless you need them.

---

## Part 4 — Run the app locally

1. In a terminal, from the project root:

   ```bash
   npm install
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000). The booking page should load slots from Supabase (not only “demo” mode).
3. Open [http://localhost:3000/admin](http://localhost:3000/admin), sign in (default username and password are both **`coffee`** unless you changed them in `.env.local`). You should see bookings (or “No bookings yet”).

If you change **`.env.local`**, stop the dev server (`Ctrl+C`) and run **`npm run dev`** again so Next.js picks up new variables.

---

## Part 5 — Deploy (e.g. Vercel)

1. Push your repo to GitHub (or similar) **without** committing `.env.local` (it is gitignored).
2. In [Vercel](https://vercel.com) → your project → **Settings** → **Environment Variables**, add the **same** variable names and values as in `.env.local` for **Production** (and Preview if you use it).
3. Redeploy after saving env vars.

---

## Checklist

| Step | Done? |
|------|--------|
| Supabase project created | ☐ |
| SQL migration run successfully | ☐ |
| `NEXT_PUBLIC_SUPABASE_URL` set in `.env.local` | ☐ |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in `.env.local` | ☐ |
| `SUPABASE_SERVICE_ROLE_KEY` set in `.env.local` | ☐ |
| `npm run dev` restarted after editing env | ☐ |
| Test booking on `/book` | ☐ |
| Test `/admin` shows list or empty state (not “not configured”) | ☐ |

---

## Troubleshooting

- **Admin still says Supabase is not configured**  
  - Confirm all three variables are set and have **no** extra quotes or spaces.  
  - Restart `npm run dev`.

- **`Could not load bookings: ...` on admin**  
  - Migration may be missing or wrong project. Re-run the SQL file in the SQL Editor for this project.

- **Booking fails with permission or RPC errors**  
  - Confirm `create_booking` exists and is granted to `service_role` (see migration).  
  - Confirm `SUPABASE_SERVICE_ROLE_KEY` is the **Secret** (`sb_secret_…`) or **service_role** JWT—not the publishable / anon key.

- **Accidentally shared a secret key** (screenshot, chat, etc.)  
  - In **API Keys**, create a new secret key, update `.env.local` / Vercel, then **revoke** the old one.

For a shorter overview, see the **Supabase setup** section in [README.md](../README.md).
