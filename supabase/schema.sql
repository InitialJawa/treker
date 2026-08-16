-- ============================================================
-- Skema Database Supabase untuk Treker
-- DDL + Row Level Security (RLS)
-- ------------------------------------------------------------
-- trips: kolom eksplisit (sesuai saveTripToSupabase)
-- tabel item (itinerary_days, itinerary_items, places, expenses,
--   bookings, packing_items, transports, notes, moodboard_items):
--   skema seragam { id, trip_id, user_id, data, updated_at }
-- ============================================================

-- ---------- TRIPS ----------
create table if not exists public.trips (
  id text primary key,
  name text not null,
  destination text not null,
  start_date text,
  end_date text,
  travelers_count integer default 1,
  currency text default 'IDR',
  budget numeric default 0,
  actual_spent numeric default 0,
  description text default '',
  cover_image text default '',
  status text default 'upcoming',
  is_template boolean default false,
  is_favorite boolean default false,
  user_id text not null,
  collaborators jsonb default '[]',
  member_ids jsonb default '[]',
  allow_public_view boolean default false,
  updated_at timestamptz default now()
);

-- ---------- TABEL ITEM: skema seragam ----------
create table if not exists public.itinerary_days (
  id text primary key,
  trip_id text,
  user_id text not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

create table if not exists public.itinerary_items (
  id text primary key,
  trip_id text,
  user_id text not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

create table if not exists public.places (
  id text primary key,
  trip_id text,
  user_id text not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

create table if not exists public.expenses (
  id text primary key,
  trip_id text,
  user_id text not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

create table if not exists public.bookings (
  id text primary key,
  trip_id text,
  user_id text not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

create table if not exists public.packing_items (
  id text primary key,
  trip_id text,
  user_id text not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

create table if not exists public.transports (
  id text primary key,
  trip_id text,
  user_id text not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

create table if not exists public.notes (
  id text primary key,
  trip_id text,
  user_id text not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

create table if not exists public.moodboard_items (
  id text primary key,
  trip_id text,
  user_id text not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- ---------- ENABLE RLS ----------
alter table public.trips enable row level security;
alter table public.itinerary_days enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.places enable row level security;
alter table public.expenses enable row level security;
alter table public.bookings enable row level security;
alter table public.packing_items enable row level security;
alter table public.transports enable row level security;
alter table public.notes enable row level security;
alter table public.moodboard_items enable row level security;

-- ---------- POLICY trips ----------
-- select: user pemilik ATAU template publik ATAU trip publik
drop policy if exists "trips_select" on public.trips;
create policy "trips_select" on public.trips
  for select using (
    user_id = auth.uid()::text or is_template = true or allow_public_view = true
  );

drop policy if exists "trips_insert" on public.trips;
create policy "trips_insert" on public.trips
  for insert with check (user_id = auth.uid()::text);

drop policy if exists "trips_update" on public.trips;
create policy "trips_update" on public.trips
  for update using (user_id = auth.uid()::text);

drop policy if exists "trips_delete" on public.trips;
create policy "trips_delete" on public.trips
  for delete using (user_id = auth.uid()::text);

-- ---------- POLICY itinerary_days ----------
drop policy if exists "days_select" on public.itinerary_days;
create policy "days_select" on public.itinerary_days
  for select using (user_id = auth.uid()::text);

drop policy if exists "days_insert" on public.itinerary_days;
create policy "days_insert" on public.itinerary_days
  for insert with check (user_id = auth.uid()::text);

drop policy if exists "days_update" on public.itinerary_days;
create policy "days_update" on public.itinerary_days
  for update using (user_id = auth.uid()::text);

drop policy if exists "days_delete" on public.itinerary_days;
create policy "days_delete" on public.itinerary_days
  for delete using (user_id = auth.uid()::text);

-- ---------- POLICY itinerary_items ----------
drop policy if exists "items_select" on public.itinerary_items;
create policy "items_select" on public.itinerary_items
  for select using (user_id = auth.uid()::text);

drop policy if exists "items_insert" on public.itinerary_items;
create policy "items_insert" on public.itinerary_items
  for insert with check (user_id = auth.uid()::text);

drop policy if exists "items_update" on public.itinerary_items;
create policy "items_update" on public.itinerary_items
  for update using (user_id = auth.uid()::text);

drop policy if exists "items_delete" on public.itinerary_items;
create policy "items_delete" on public.itinerary_items
  for delete using (user_id = auth.uid()::text);

-- ---------- POLICY places ----------
drop policy if exists "places_select" on public.places;
create policy "places_select" on public.places
  for select using (user_id = auth.uid()::text);

drop policy if exists "places_insert" on public.places;
create policy "places_insert" on public.places
  for insert with check (user_id = auth.uid()::text);

drop policy if exists "places_update" on public.places;
create policy "places_update" on public.places
  for update using (user_id = auth.uid()::text);

drop policy if exists "places_delete" on public.places;
create policy "places_delete" on public.places
  for delete using (user_id = auth.uid()::text);

-- ---------- POLICY expenses ----------
drop policy if exists "expenses_select" on public.expenses;
create policy "expenses_select" on public.expenses
  for select using (user_id = auth.uid()::text);

drop policy if exists "expenses_insert" on public.expenses;
create policy "expenses_insert" on public.expenses
  for insert with check (user_id = auth.uid()::text);

drop policy if exists "expenses_update" on public.expenses;
create policy "expenses_update" on public.expenses
  for update using (user_id = auth.uid()::text);

drop policy if exists "expenses_delete" on public.expenses;
create policy "expenses_delete" on public.expenses
  for delete using (user_id = auth.uid()::text);

-- ---------- POLICY bookings ----------
drop policy if exists "bookings_select" on public.bookings;
create policy "bookings_select" on public.bookings
  for select using (user_id = auth.uid()::text);

drop policy if exists "bookings_insert" on public.bookings;
create policy "bookings_insert" on public.bookings
  for insert with check (user_id = auth.uid()::text);

drop policy if exists "bookings_update" on public.bookings;
create policy "bookings_update" on public.bookings
  for update using (user_id = auth.uid()::text);

drop policy if exists "bookings_delete" on public.bookings;
create policy "bookings_delete" on public.bookings
  for delete using (user_id = auth.uid()::text);

-- ---------- POLICY packing_items ----------
drop policy if exists "packing_select" on public.packing_items;
create policy "packing_select" on public.packing_items
  for select using (user_id = auth.uid()::text);

drop policy if exists "packing_insert" on public.packing_items;
create policy "packing_insert" on public.packing_items
  for insert with check (user_id = auth.uid()::text);

drop policy if exists "packing_update" on public.packing_items;
create policy "packing_update" on public.packing_items
  for update using (user_id = auth.uid()::text);

drop policy if exists "packing_delete" on public.packing_items;
create policy "packing_delete" on public.packing_items
  for delete using (user_id = auth.uid()::text);

-- ---------- POLICY transports ----------
drop policy if exists "transports_select" on public.transports;
create policy "transports_select" on public.transports
  for select using (user_id = auth.uid()::text);

drop policy if exists "transports_insert" on public.transports;
create policy "transports_insert" on public.transports
  for insert with check (user_id = auth.uid()::text);

drop policy if exists "transports_update" on public.transports;
create policy "transports_update" on public.transports
  for update using (user_id = auth.uid()::text);

drop policy if exists "transports_delete" on public.transports;
create policy "transports_delete" on public.transports
  for delete using (user_id = auth.uid()::text);

-- ---------- POLICY notes ----------
drop policy if exists "notes_select" on public.notes;
create policy "notes_select" on public.notes
  for select using (user_id = auth.uid()::text);

drop policy if exists "notes_insert" on public.notes;
create policy "notes_insert" on public.notes
  for insert with check (user_id = auth.uid()::text);

drop policy if exists "notes_update" on public.notes;
create policy "notes_update" on public.notes
  for update using (user_id = auth.uid()::text);

drop policy if exists "notes_delete" on public.notes;
create policy "notes_delete" on public.notes
  for delete using (user_id = auth.uid()::text);

-- ---------- POLICY moodboard_items ----------
drop policy if exists "moodboard_select" on public.moodboard_items;
create policy "moodboard_select" on public.moodboard_items
  for select using (user_id = auth.uid()::text);

drop policy if exists "moodboard_insert" on public.moodboard_items;
create policy "moodboard_insert" on public.moodboard_items
  for insert with check (user_id = auth.uid()::text);

drop policy if exists "moodboard_update" on public.moodboard_items;
create policy "moodboard_update" on public.moodboard_items
  for update using (user_id = auth.uid()::text);

drop policy if exists "moodboard_delete" on public.moodboard_items;
create policy "moodboard_delete" on public.moodboard_items
  for delete using (user_id = auth.uid()::text);