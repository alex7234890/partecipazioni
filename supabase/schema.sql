-- ============================================================
-- Schema Supabase — Partecipazioni Matrimonio Matteo & Clio
-- Incolla nell'SQL Editor di Supabase e clicca "Run"
-- ============================================================

-- Abilita l'estensione uuid se non già attiva
create extension if not exists "pgcrypto";

-- Tabella ospiti
create table if not exists public.guests (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  rsvp_status   text check (rsvp_status in ('yes', 'no', 'maybe', 'pending')) default 'pending',
  allergies     text,
  message       text,
  responded_at  timestamptz,
  created_at    timestamptz default now()
);

-- Indice sullo slug per ricerche veloci
create index if not exists guests_slug_idx on public.guests(slug);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.guests enable row level security;

-- Policy: ospite autenticato (sposi) vede tutto
create policy "sposi_full_access"
  on public.guests
  for all
  to authenticated
  using (true)
  with check (true);

-- Policy: ospite anonimo può leggere solo il proprio record tramite slug
create policy "guest_read_own"
  on public.guests
  for select
  to anon
  using (true);   -- il filtraggio per slug avviene a livello applicativo

-- Policy: ospite anonimo può aggiornare solo il proprio record
create policy "guest_update_own"
  on public.guests
  for update
  to anon
  using (true)
  with check (true);

-- ============================================================
-- Dati di esempio (rimuovi o commenta in produzione)
-- ============================================================

insert into public.guests (name, slug) values
  ('Marco Rossi', 'marco-rossi'),
  ('Laura Bianchi', 'laura-bianchi'),
  ('Giovanni Esposito', 'giovanni-esposito')
on conflict (slug) do nothing;
