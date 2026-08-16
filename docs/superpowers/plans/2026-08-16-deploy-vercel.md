# Deploy Treker ke Vercel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merapikan lapisan data Treker ke satu sumber kebenaran (Supabase Postgres), mengganti Express AI proxy dengan Vercel serverless functions, dan men-deploy ke Vercel.

**Architecture:** Frontend React static di Vercel memanggil supabase-js untuk auth + semua data; `/api/ai/*` di-handle oleh Vercel serverless functions (proxy Gemini, key aman di server). Lapisan Drizzle/Express/`pg` dibuang.

**Tech Stack:** React 19, Vite 6, Tailwind 4, TypeScript, supabase-js, @google/genai, Vercel Functions.

## Global Constraints

- Bahasa kode Indonesia (variabel, komentar, pesan error).
- Semua data melalui Supabase Postgres — Drizzle/Express/`pg` DIHAPUS, tidak boleh ada import tersisa.
- Skema kanonik: `supabaseService.saveItemToSupabase` menulis `{ id, trip_id, user_id, data (jsonb), updated_at }`; `saveTripToSupabase` menulis kolom eksplisit `trips`.
- Frontend tetap memanggil `/api/ai/generate-itinerary` dan `/api/ai/generate-packing` (URL tidak berubah).
- Verifikasi tiap task: `npm run lint` (tsc --noEmit) + `npm run build` (vite build) harus lulus.
- Lockfile: pakai `package-lock.json` (npm). `bun.lock` dihapus dari tracking.
- Jangan pernah commit secret/env asli; `.env` di-gitignore.

---

### Task 1: Skema SQL Supabase + RLS

**Files:**
- Create: `supabase/schema.sql`
- Create: `supabase/seed.sql` (opsional, data template Banyuwangi)

**Interfaces:**
- Produces: DDL yang akan dieksekusi di Supabase SQL editor. Tabel: `trips`, `itinerary_days`, `itinerary_items`, `places`, `expenses`, `bookings`, `packing_items`, `transports`, `notes`, `moodboard_items`.
- Consumes: kolom yang dipakai `src/services/supabaseService.ts` (sudah dibaca).

- [ ] **Step 1: Buat `supabase/schema.sql`** dengan DDL:

```sql
-- trips: kolom eksplisit (sesuai saveTripToSupabase)
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

-- tabel item: skema seragam { id, trip_id, user_id, data, updated_at }
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

-- RLS helper
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

-- Policy trips
drop policy if exists "trips_select" on public.trips;
create policy "trips_select" on public.trips
  for select using (
    user_id = auth.uid() or is_template = true or allow_public_view = true
  );
drop policy if exists "trips_insert" on public.trips;
create policy "trips_insert" on public.trips
  for insert with check (user_id = auth.uid());
drop policy if exists "trips_update" on public.trips;
create policy "trips_update" on public.trips
  for update using (user_id = auth.uid());
drop policy if exists "trips_delete" on public.trips;
create policy "trips_delete" on public.trips
  for delete using (user_id = auth.uid());

-- Policy item (template sama untuk semua tabel item)
-- contoh itinerary_days:
drop policy if exists "days_select" on public.itinerary_days;
create policy "days_select" on public.itinerary_days
  for select using (user_id = auth.uid());
drop policy if exists "days_insert" on public.itinerary_days;
create policy "days_insert" on public.itinerary_days
  for insert with check (user_id = auth.uid());
drop policy if exists "days_update" on public.itinerary_days;
create policy "days_update" on public.itinerary_days
  for update using (user_id = auth.uid());
drop policy if exists "days_delete" on public.itinerary_days;
create policy "days_delete" on public.itinerary_days
  for delete using (user_id = auth.uid());
-- (ulangi pola yang sama untuk itinerary_items, places, expenses, bookings,
--  packing_items, transports, notes, moodboard_items)
```

- [ ] **Step 2: Buat `supabase/seed.sql`** berisi INSERT Banyuwangi (data dari `src/data/banyuwangiTemplate.ts`) ke `trips` + tabel item dengan `user_id` placeholder `'guest'`. Template public (is_template=true) sehingga bisa dilihat semua user.

- [ ] **Step 3: Verifikasi** — tidak bisa dijalankan lokal (butuh Supabase). Validasi sintaks dengan membaca ulang; pastikan setiap `create policy` punya `drop policy if exists` pendamping.

- [ ] **Step 4: Commit**

```bash
git add supabase/schema.sql supabase/seed.sql
git commit -m "feat: skema SQL Supabase + RLS untuk Treker"
```

---

### Task 2: Unifikasi data layer di supabaseService.ts

**Files:**
- Modify: `src/services/supabaseService.ts`

**Interfaces:**
- Produces: `fetchAllDataFromSupabase(userId: string): Promise<AllSupabaseData | null>` — dipakai Task 3.
- Consumes: `supabase` client, `isSupabaseConfigured` dari `src/services/supabase.ts`; tipe dari `src/types/travel.ts`.

- [ ] **Step 1: Tambah tipe hasil fetch + fungsi hydrate di akhir `supabaseService.ts`**

```ts
import {
  Trip, ItineraryDay, ItineraryItem, Place, Expense, Booking,
  PackingItem, TransportLeg, Note, MoodboardItem,
} from '../types/travel';

export interface AllSupabaseData {
  trips: Trip[];
  itineraryDays: ItineraryDay[];
  itineraryItems: ItineraryItem[];
  places: Place[];
  expenses: Expense[];
  bookings: Booking[];
  packingItems: PackingItem[];
  transports: TransportLeg[];
  notes: Note[];
  moodboardItems: MoodboardItem[];
}

const ITEM_TABLES = [
  'itinerary_days', 'itinerary_items', 'places', 'expenses', 'bookings',
  'packing_items', 'transports', 'notes', 'moodboard_items',
] as const;

/** Baca semua data user dari Supabase. `data` kolom jsonb di-parse kembali. */
export async function fetchAllDataFromSupabase(userId: string): Promise<AllSupabaseData | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: trips, error: tripsError } = await supabase
      .from('trips')
      .select('*')
      .or(`user_id.eq.${userId},is_template.eq.true,allow_public_view.eq.true`);
    if (tripsError) throw tripsError;

    const result: AllSupabaseData = {
      trips: (trips || []).map(mapTripRow),
      itineraryDays: [], itineraryItems: [], places: [], expenses: [],
      bookings: [], packingItems: [], transports: [], notes: [], moodboardItems: [],
    };

    await Promise.all(ITEM_TABLES.map(async (table) => {
      const { data, error } = await supabase.from(table).select('data').eq('user_id', userId);
      if (error) return;
      const rows = (data || []).map((r: any) => r.data).filter(Boolean);
      (result as any)[camelTableName(table)] = rows;
    }));

    return result;
  } catch (err) {
    console.warn('fetchAllDataFromSupabase notice:', err);
    return null;
  }
}

function camelTableName(snake: string): string {
  return snake.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function mapTripRow(t: any): Trip {
  return {
    id: t.id, name: t.name, destination: t.destination,
    startDate: t.start_date, endDate: t.end_date,
    travelersCount: t.travelers_count ?? 1,
    currency: t.currency ?? 'IDR', budget: Number(t.budget || 0),
    actualSpent: Number(t.actual_spent || 0), description: t.description || '',
    coverImage: t.cover_image || '', status: t.status || 'upcoming',
    isTemplate: !!t.is_template, isFavorite: !!t.is_favorite,
    userId: t.user_id, collaborators: t.collaborators || [],
    memberIds: t.member_ids || [], allowPublicView: !!t.allow_public_view,
    createdAt: t.created_at || t.start_date || '',
  };
}
```

- [ ] **Step 2: Verifikasi typecheck** — `npx tsc --noEmit` harus lulus (jika import `supabaseService.ts` tidak punya `supabase` name clash). Pastikan `supabase` di-import (sudah ada di file).

- [ ] **Step 3: Commit**

```bash
git add src/services/supabaseService.ts
git commit -m "feat: fungsi hydrate semua data dari Supabase"
```

---

### Task 3: Rapikan TripContext (buang jalur SQL)

**Files:**
- Modify: `src/context/TripContext.tsx`
- Delete: `src/services/sqlService.ts`

**Interfaces:**
- Consumes: `fetchAllDataFromSupabase` dari Task 2.
- Produces: `TripContext` yang hanya bergantung pada supabase-js; tidak ada import `sqlService`.

- [ ] **Step 1: Ganti import** — hapus `import { fetchAllDataFromSql, seedBanyuwangiToSql } from '../services/sqlService';` (baris 22), tambah:

```ts
import { saveTripToSupabase, deleteTripFromSupabase, addCollaboratorToTrip, removeCollaboratorFromTrip, saveItemToSupabase, deleteItemFromSupabase, fetchAllDataFromSupabase } from '../services/supabaseService';
```

- [ ] **Step 2: Ganti blok hydrate (baris ~168-192)** — hapus panggilan `fetchAllDataFromSql`/`seedBanyuwangiToSql`, jadi:

```ts
useEffect(() => {
  if (!user) {
    setTrips([banyuwangiTrip]);
    setItineraryDays(banyuwangiDays);
    setItineraryItems(banyuwangiItems);
    setPlaces(banyuwangiPlaces);
    setActiveTripId(banyuwangiTrip.id);
    return;
  }

  fetchAllDataFromSupabase(user.uid).then(data => {
    if (data && data.trips && data.trips.length > 0) {
      setTrips(data.trips);
      if (data.itineraryDays.length > 0) setItineraryDays(data.itineraryDays);
      if (data.itineraryItems.length > 0) setItineraryItems(data.itineraryItems);
      if (data.places.length > 0) setPlaces(data.places);
      if (data.expenses.length > 0) setExpenses(data.expenses);
      if (data.bookings.length > 0) setBookings(data.bookings);
      if (data.packingItems.length > 0) setPackingItems(data.packingItems);
      if (data.transports.length > 0) setTransports(data.transports);
      if (data.notes.length > 0) setNotes(data.notes);
      if (data.moodboardItems.length > 0) setMoodboardItems(data.moodboardItems);
      if (!activeTripId || !data.trips.some(t => t.id === activeTripId)) {
        setActiveTripId(data.trips[0].id);
      }
    } else {
      // Seed template Banyuwangi sebagai trip milik user (opsional)
      loadBanyuwangiTemplateToSupabase(user.uid);
    }
  }).catch(err => {
    console.warn('Supabase initial fetch notice:', err);
  });
}, [user]);
```

- [ ] **Step 3: Tambah import `loadBanyuwangiTemplateToSupabase`** dari `../scripts/loadTemplate` (file sudah ada). Bila file `src/scripts/loadTemplate.ts` tidak diinginkan, hapus juga — tetapi pastikan tidak ada referensi lain.

- [ ] **Step 4: Hapus blok Supabase fetch kedua yang duplikat (baris ~193-224)** — karena sudah ter-handle oleh `fetchAllDataFromSupabase`.

- [ ] **Step 5: Hapus file `src/services/sqlService.ts`**

```bash
git rm src/services/sqlService.ts
```

- [ ] **Step 6: Verifikasi** — `npm run lint` dan `npm run build` lulus; pastikan tidak ada referensi `sqlService` tersisa:

```bash
rg -n "sqlService|fetchAllDataFromSql|seedBanyuwangiToSql" src/
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: unifikasi data layer ke Supabase, buang jalur SQL"
```

---

### Task 4: Hapus lapisan Express/Drizzle

**Files:**
- Delete: `server.ts`, `src/server/apiRouter.ts`, `src/server/expressMiddleware.ts`, `src/db/schema.ts`, `src/db/index.ts`, `src/db/drizzle.config.ts`
- Modify: `vite.config.ts`, `package.json`

**Interfaces:**
- Consumes: Task 3 (tidak ada lagi yang mengimpor dari file ini).
- Produces: repo tanpa Express/pg/drizzle; `vite.config.ts` tanpa plugin proxy SQL.

- [ ] **Step 1: Hapus file**

```bash
git rm server.ts src/server/apiRouter.ts src/server/expressMiddleware.ts src/db/schema.ts src/db/index.ts src/db/drizzle.config.ts
```

- [ ] **Step 2: Edit `vite.config.ts`** — buang import `GoogleGenAI`, `sqlDevMiddleware`, dan seluruh `apiProxyPlugin`. Hasil:

```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
```

- [ ] **Step 3: Edit `package.json`** — hapus deps: `express`, `@types/express`, `pg`, `@types/pg`, `drizzle-orm`, `drizzle-kit`, `@cloudflare/kv-asset-handler`, `dotenv`, `tsx`. Tambah `@vercel/node`. Update scripts:

```json
"scripts": {
  "dev": "vite --port=3000 --host=0.0.0.0",
  "build": "vite build",
  "preview": "vite preview",
  "clean": "rm -rf dist",
  "lint": "tsc --noEmit"
}
```

- [ ] **Step 4: Install ulang** — `npm install`; pastikan tidak ada dep yang hilang. `npm uninstall express pg drizzle-orm drizzle-kit @cloudflare/kv-asset-handler dotenv tsx` atau edit manual + `npm install`.

- [ ] **Step 5: Verifikasi** — `npm run lint` dan `npm run build` lulus; `rg -n "express|drizzle|pg" src/ server.ts` tidak menemukan apa pun.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: hapus lapisan Express/Drizzle, migrasi ke Vercel Functions"
```

---

### Task 5: Serverless functions AI

**Files:**
- Create: `api/ai/generate-itinerary.ts`
- Create: `api/ai/generate-packing.ts`

**Interfaces:**
- Consumes: `GEMINI_API_KEY` dari env Vercel; logika prompt dari `server.ts` (sudah dibaca).
- Produces: endpoint `POST /api/ai/generate-itinerary` & `POST /api/ai/generate-packing` — dipanggil frontend via `aiService.ts` (URL tidak berubah).

- [ ] **Step 1: Buat `api/ai/generate-itinerary.ts`**

```ts
import { GoogleGenAI } from '@google/genai';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(500).json({ error: 'NO_API_KEY' });
  }
  try {
    const { destination, days, travelers, budget, currency, description } = req.body || {};
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert travel planner. Create a detailed ${days}-day itinerary for a trip to "${destination}" for ${travelers} traveler(s) with an estimated total budget of ${currency} ${budget?.toLocaleString()}.
User details: ${description || 'Sightseeing, local food, nature, culture, and popular landmarks'}.

Output MUST be strictly valid JSON without markdown formatting, matching this exact schema:
{
  "daysTitles": ["Day 1 Title", "Day 2 Title"],
  "activities": [
    {
      "dayNumber": 1,
      "time": "08:00",
      "duration": "1h 30m",
      "title": "Activity name",
      "location": "Specific place name, City",
      "category": "Food",
      "estimatedCost": 50000,
      "description": "Short 1-2 sentence description",
      "notes": "Useful tip",
      "transportType": "Car"
    }
  ]
}
Language: Bahasa Indonesia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('AI itinerary generation error:', err);
    return res.status(500).json({ error: err.message || 'AI generation failed' });
  }
}
```

- [ ] **Step 2: Buat `api/ai/generate-packing.ts`**

```ts
import { GoogleGenAI } from '@google/genai';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(500).json({ error: 'NO_API_KEY' });
  }
  try {
    const { destination, days } = req.body || {};
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate a travel packing list for a ${days}-day trip to "${destination}".
Return strictly valid JSON array of objects with schema:
[{"category": "Documents"|"Clothing"|"Electronics"|"Toiletries"|"Other", "name": "Item name", "quantity": 1}]
Provide 12 to 18 essential items in Bahasa Indonesia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return res.json(JSON.parse(response.text || '[]'));
  } catch (err: any) {
    console.error('AI packing generation error:', err);
    return res.status(500).json({ error: err.message || 'AI generation failed' });
  }
}
```

- [ ] **Step 3: Verifikasi** — `npm run lint` lulus; fungsi mengikuti signature Vercel (`VercelRequest`/`VercelResponse`). Pastikan `@vercel/node` terpasang (Task 4).

- [ ] **Step 4: Commit**

```bash
git add api/ai/
git commit -m "feat: serverless functions AI untuk Vercel"
```

---

### Task 6: Konfigurasi deploy Vercel + env

**Files:**
- Create: `vercel.json`
- Modify: `.env.example`

**Interfaces:**
- Produces: `vercel.json` SPA rewrite; `.env.example` mencerminkan env yang dipakai.
- Consumes: `dist/` hasil build; `api/` folder functions.

- [ ] **Step 1: Buat `vercel.json`**

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 2: Update `.env.example`**

```env
# GEMINI_API_KEY: Required for Gemini AI API calls (serverless).
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# SUPABASE: Configuration for Supabase Backend (Auth, Database)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# GOOGLE_MAPS_PLATFORM_KEY (optional)
GOOGLE_MAPS_PLATFORM_KEY=""
```

- [ ] **Step 3: Hapus `bun.lock` dari tracking** (pakai npm):

```bash
git rm --cached bun.lock
```

- [ ] **Step 4: Verifikasi** — `npm run lint` + `npm run build` lulus; `dist/` ter-generate.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: konfigurasi Vercel + update env example"
```

---

### Task 7: Setup Supabase (schema + Google OAuth)

**Files:**
- Tidak ada perubahan kode. Aktivitas dashboard.

**Interfaces:**
- Consumes: `supabase/schema.sql`, `supabase/seed.sql` (Task 1); project `zysdubniqzugiyocgnfp`.
- Produces: tabel + RLS aktif; Google OAuth terkonfigurasi.

- [ ] **Step 1: Eksekusi `supabase/schema.sql`** di Supabase SQL Editor (project `zysdubniqzugiyocgnfp`). Pastikan tidak ada error (tabel dibuat, RLS aktif).

- [ ] **Step 2: Eksekusi `supabase/seed.sql`** untuk template Banyuwangi public.

- [ ] **Step 3: Konfigurasi Google OAuth** — dashboard → Authentication → Providers → Google:
  - Google Cloud Console: buat OAuth Client ID (Web), `Authorized redirect URIs` = `https://zysdubniqzugiyocgnfp.supabase.co/auth/v1/callback`.
  - Dashboard Supabase: isi Client ID + Client Secret.

- [ ] **Step 4: Verifikasi** — di halaman Auth providers, Google "enabled"; coba test email/password di UI lokal (`npm run dev`) atau dashboard.

- [ ] **Step 5: Commit** (jika ada perubahan — biasanya tidak)

```bash
git status
```

---

### Task 8: Deploy ke Vercel + verifikasi

**Files:**
- Tidak ada perubahan kode.

**Interfaces:**
- Consumes: repo GitHub `InitialJawa/treker`; akun Vercel; env vars.
- Produces: URL produksi `https://<app>.vercel.app`.

- [ ] **Step 1: Login Vercel CLI** (atau import di dashboard)

```bash
npx vercel login
```

- [ ] **Step 2: Set env vars** di project Vercel (dashboard → Settings → Environment Variables), tiap environment:

```
VITE_SUPABASE_URL=https://zysdubniqzugiyocgnfp.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key dari dashboard>
GEMINI_API_KEY=<gemini key>
```

- [ ] **Step 3: Deploy**

```bash
npx vercel --prod
```

- [ ] **Step 4: Verifikasi produksi**
  1. Buka URL → halaman login tampil.
  2. Login via Google → masuk ke workspace.
  3. Buat trip baru → simpan → reload → data tetap (Supabase).
  4. Test `/api/ai/generate-itinerary` (buat trip dengan AI generate).
  5. Cek RLS: user lain tidak bisa melihat trip milik user A (via SQL editor atau akun kedua).

- [ ] **Step 5: Commit** (tidak diperlukan — deploy dari git auto, tapi pastikan `main` sudah berisi semua commit Task 1-6)

```bash
git push origin main
```

---

## Self-Review

- **Spec coverage:** Semua bagian spec (arsitektur, hapus Drizzle, serverless AI, skema, RLS, OAuth, vercel.json, env) punya task. Verifikasi post-deploy ada di Task 8.
- **Placeholder scan:** Tidak ada TBD; semua file memiliki isi konkret. Script `seed.sql` merujuk data `banyuwangiTemplate.ts` — data harus di-copy manual saat Task 1 Step 2 (file template 586 baris; plan menginstruksikan salinan isi).
- **Type consistency:** `fetchAllDataFromSupabase` (Task 2) dipakai di Task 3; nama tabel konsisten (`itinerary_days` dll.); `mapTripRow` dipakai internal Task 2.
- **Catatan:** `src/scripts/loadTemplate.ts` masih dipakai Task 3 Step 3 untuk seed template Banyuwangi ke Supabase saat user kosong; jangan dihapus. Bila user tidak ingin seed otomatis, hapus panggilan itu.