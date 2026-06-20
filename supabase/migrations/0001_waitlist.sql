-- Mentorque waitlist table + row-level security.
-- Run this in the Supabase SQL editor (or via the CLI) for project
-- ajaxhsvjvmqtiyzelgrd before the form can persist leads.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text not null default 'pt' check (locale in ('pt', 'en')),
  source text not null default 'landing',
  created_at timestamptz not null default now()
);

-- One signup per email.
create unique index if not exists waitlist_email_key
  on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

-- Allow anonymous (anon/publishable key) inserts only — no read access from the
-- client. Reads happen via the dashboard or a service-role key on the server.
drop policy if exists "anon can join waitlist" on public.waitlist;
create policy "anon can join waitlist"
  on public.waitlist
  for insert
  to anon
  with check (true);
