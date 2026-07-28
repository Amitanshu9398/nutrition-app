-- =============================================================================
-- Nutrition Intake — initial schema
-- Run via: supabase db push   (or paste into the SQL editor in Supabase Studio)
-- =============================================================================

create extension if not exists "pgcrypto";

-- ── nutritionists (maps 1:1 to a Supabase auth.users row) ───────────────────
create table if not exists public.nutritionists (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  practice_name text,
  email text not null,
  created_at timestamptz not null default now()
);

-- ── clients ───────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  nutritionist_id uuid not null references public.nutritionists(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  status text not null default 'new' check (status in ('new', 'active', 'in_progress', 'completed', 'archived')),
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_nutritionist_id_idx on public.clients(nutritionist_id);
create index if not exists clients_status_idx on public.clients(status);
create index if not exists clients_created_at_idx on public.clients(created_at desc);
create index if not exists clients_name_trgm_idx on public.clients using gin (name gin_trgm_ops);
create extension if not exists pg_trgm;

-- ── intake_responses (the answers submitted through the wizard) ────────────
create table if not exists public.intake_responses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  section_id text not null,
  question_id text not null,
  question_label text not null,
  answer jsonb not null,
  created_at timestamptz not null default now(),
  unique (client_id, question_id)
);

create index if not exists intake_responses_client_id_idx on public.intake_responses(client_id);

-- ── intake_drafts (autosave, keyed by a client-side session token) ─────────
create table if not exists public.intake_drafts (
  session_token uuid primary key default gen_random_uuid(),
  answers jsonb not null default '{}'::jsonb,
  current_step integer not null default 0,
  client_name text,
  client_phone text,
  client_email text,
  updated_at timestamptz not null default now()
);

-- ── activity_log (dashboard "recent activity" feed) ─────────────────────────
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  nutritionist_id uuid not null references public.nutritionists(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  event_type text not null, -- 'submission' | 'status_change' | 'note_added' | 'export'
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_nutritionist_id_idx on public.activity_log(nutritionist_id, created_at desc);

-- ── updated_at trigger ───────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- ── auto-create a nutritionists row whenever a new auth user signs up ──────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.nutritionists (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.nutritionists enable row level security;
alter table public.clients enable row level security;
alter table public.intake_responses enable row level security;
alter table public.intake_drafts enable row level security;
alter table public.activity_log enable row level security;

-- nutritionists: a user can only read/update their own row
create policy "nutritionists_select_own" on public.nutritionists
  for select using (auth.uid() = id);
create policy "nutritionists_update_own" on public.nutritionists
  for update using (auth.uid() = id);

-- clients: only visible to the owning nutritionist
create policy "clients_select_own" on public.clients
  for select using (auth.uid() = nutritionist_id);
create policy "clients_insert_own" on public.clients
  for insert with check (auth.uid() = nutritionist_id);
create policy "clients_update_own" on public.clients
  for update using (auth.uid() = nutritionist_id);
create policy "clients_delete_own" on public.clients
  for delete using (auth.uid() = nutritionist_id);

-- intake_responses: only visible via the owning client → nutritionist chain
create policy "responses_select_own" on public.intake_responses
  for select using (
    exists (select 1 from public.clients c
            where c.id = intake_responses.client_id and c.nutritionist_id = auth.uid())
  );
create policy "responses_update_own" on public.intake_responses
  for update using (
    exists (select 1 from public.clients c
            where c.id = intake_responses.client_id and c.nutritionist_id = auth.uid())
  );
create policy "responses_delete_own" on public.intake_responses
  for delete using (
    exists (select 1 from public.clients c
            where c.id = intake_responses.client_id and c.nutritionist_id = auth.uid())
  );
-- Inserts to intake_responses happen only via the service-role key in the
-- /api/intake route (public form submitters are not authenticated), so no
-- public insert policy is defined here — the service role bypasses RLS.

-- intake_drafts: no RLS-restricted read policy needed since access is only
-- ever by exact session_token (via service role from the API route). Table
-- is not exposed to the anon key directly.
create policy "drafts_no_public_access" on public.intake_drafts
  for all using (false);

-- activity_log: only visible to the owning nutritionist
create policy "activity_select_own" on public.activity_log
  for select using (auth.uid() = nutritionist_id);

-- =============================================================================
-- Storage bucket for exported PDFs / attachments
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('client-exports', 'client-exports', false)
on conflict (id) do nothing;

create policy "exports_owner_read" on storage.objects
  for select using (
    bucket_id = 'client-exports' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "exports_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'client-exports' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================================================
-- Seed data (safe to run in a fresh dev project; no-ops if already present)
-- Replace the UUID below with a real auth.users id after creating your first
-- nutritionist account, then run just the clients/responses inserts.
-- =============================================================================
-- example:
-- insert into public.clients (nutritionist_id, name, phone, email, status, tags)
-- values ('00000000-0000-0000-0000-000000000000', 'Priya Sharma', '+91 98765 43210',
--         'priya@example.com', 'new', array['high-priority']);
