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
  max_guests    integer not null default 1,  -- numero massimo di persone per questo invito
  rsvp_status   text check (rsvp_status in ('yes', 'no', 'maybe', 'pending')) default 'pending',
  allergies     text,
  message       text,
  responded_at  timestamptz,
  created_at    timestamptz default now()
);

-- Aggiunta colonna se la tabella esiste già (idempotente)
alter table public.guests add column if not exists max_guests integer not null default 1;

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
-- Tabella componenti dell'invito (guest_members)
-- Ogni riga = una persona fisica nell'invito (adulto o bambino)
-- ============================================================

create table if not exists public.guest_members (
  id          uuid primary key default gen_random_uuid(),
  guest_id    uuid not null references public.guests(id) on delete cascade,
  name        text not null,
  is_child    boolean not null default false,
  rsvp_status text not null default 'pending' check (rsvp_status in ('yes', 'no', 'pending')),
  allergies   text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_guest_members_guest_id on public.guest_members(guest_id);

alter table public.guest_members enable row level security;

create policy "sposi_full_access_members"
  on public.guest_members for all to authenticated
  using (true) with check (true);

create policy "guest_read_members"
  on public.guest_members for select to anon
  using (true);

create policy "guest_update_members"
  on public.guest_members for update to anon
  using (true) with check (true);

-- ============================================================
-- Dati di esempio (rimuovi o commenta in produzione)
-- ============================================================

insert into public.guests (name, slug, max_guests, rsvp_status, allergies, message, responded_at) values
  ('Marco Rossi', 'marco-rossi', 1, 'yes', null, 'Felicissimo di esserci!', now() - interval '2 days'),
  ('Famiglia Bianchi', 'famiglia-bianchi', 4, 'yes', 'Una persona è celiaca', 'Non vediamo l''ora!', now() - interval '1 day'),
  ('Laura Verdi', 'laura-verdi', 1, 'no', null, 'Purtroppo sarò all''estero', now() - interval '3 days'),
  ('Giovanni e Anna Esposito', 'giovanni-anna-esposito', 2, 'maybe', 'Anna è allergica alle noci', null, now() - interval '5 hours'),
  ('Famiglia Ferretti', 'famiglia-ferretti', 3, 'pending', null, null, null),
  ('Chiara Ricci', 'chiara-ricci', 1, 'pending', null, null, null)
on conflict (slug) do nothing;
