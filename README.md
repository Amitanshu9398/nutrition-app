# NutriIntake

A production-oriented nutrition client intake wizard + practitioner dashboard, built on
Next.js 15 (App Router), Supabase, and Tailwind.

## Status

This is a working scaffold, not a fully audited commercial product. Core flows are wired
end-to-end (landing page → intake wizard → Supabase → dashboard), but you should treat the
following as **not yet done** before charging real clients:

- No automated tests
- No CSRF token on top of Supabase's cookie-based session (relies on SameSite cookies +
  the rate limiter; add `next-safe-action` or an explicit CSRF token if you need more)
- No image/logo assets — placeholders only
- Email templates are minimal HTML, not visually polished
- `npm install` / `next build` have not been run in this environment — verify locally
  before deploying
- Multi-practitioner (multi-tenant) intake links are not implemented; `/intake` currently
  submits to whichever nutritionist row exists first. For multiple practitioners, add a
  `nutritionist_id` or slug to the intake URL and thread it through `app/api/intake/route.ts`.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then run the SQL
   in `supabase/migrations/0001_init.sql` in the Supabase SQL editor (or via
   `supabase db push` if you have the CLI linked).

3. **Copy environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API
   - `SUPABASE_SERVICE_ROLE_KEY` — same page, service_role key (server-only, keep secret)
   - `RESEND_API_KEY` and `EMAIL_FROM` — from [resend.com](https://resend.com) (free tier is fine to start)
   - `NUTRITIONIST_NOTIFY_EMAIL` — where new-submission alerts go
   - `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — optional, enables rate limiting
     on the public intake endpoint (recommended before going live; without it, rate
     limiting is silently skipped)

4. **Create your practitioner account** — go to `/signup` once the app is running. A
   database trigger automatically creates your `nutritionists` row.

5. **Run locally**
   ```bash
   npm run dev
   ```
   - Public intake form: `/intake`
   - Practitioner dashboard: `/dashboard` (after logging in at `/login`)

6. **Deploy to Vercel** — import the repo, add the same environment variables in the
   Vercel project settings, deploy. `vercel.json` is already configured.

## Project structure

```
app/
  page.tsx                  Landing page
  intake/page.tsx           Multi-step client intake wizard
  login/, signup/, forgot-password/
  dashboard/                Auth-protected practitioner area
  api/
    intake/                 Public submission + autosave draft endpoints
    clients/[id]/           Update/delete client, edit/delete individual responses
    auth/logout/
components/
  ui/                       Design-system primitives (button, input, card, textarea)
  form/                     Wizard-specific components (progress bar, question field)
  dashboard/                Dashboard-specific components (charts, toolbar, profile)
lib/
  supabase/                 Browser / server / middleware Supabase clients
  intake-sections.ts        The question set (edit this to change the form)
  validation.ts             Zod schemas
  email.ts, rate-limit.ts, export.ts, utils.ts
emails/templates.ts         HTML email templates
supabase/migrations/        SQL schema, RLS policies, storage bucket, seed notes
types/index.ts               Shared TypeScript types
middleware.ts                Route protection + session refresh
```

## Editing the intake questions

All questions live in `lib/intake-sections.ts` as a typed array of sections. Add, remove,
or reorder questions there — the wizard, validation, and dashboard display all read from
this single source of truth.

## Security notes

- Row Level Security is enabled on every table; practitioners can only ever see their own
  clients (enforced at the database level, not just in the UI).
- The public `/api/intake` route uses the Supabase **service role** key server-side (never
  exposed to the browser) because form submitters aren't authenticated users.
- All free-text input is sanitized server-side before being stored.
- Rate limiting (5 submissions / 10 min per IP) protects the public intake endpoint when
  Upstash is configured.
