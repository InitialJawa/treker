# Spec: Deploy Treker ke Vercel (jalur B — Supabase sebagai sumber kebenaran)

- Tanggal: 2026-08-16
- Status: Disetujui oleh user (Imam Nasrulloh / InitialJawa)
- Repo: github.com/InitialJawa/treker (HEAD `e389fd4`)
- Tujuan: merapikan lapisan data, mengaktifkan Supabase sebagai satu-satunya sumber kebenaran, dan men-deploy aplikasi ke Vercel (frontend static + serverless function untuk AI proxy).

## 1. Latar Belakang

Aplikasi Treker (Trip Planner & Workspace) saat ini punya dua jalur data yang tidak konsisten:

1. **Drizzle/Express SQL** (`src/db/`, `src/server/`, `sqlService.ts`, `server.ts`) — membaca/menulis ke Postgres lewat endpoint `/api/sql`. Skema di `src/db/schema.ts` (kolom `total_budget`, `currency`, `tenant_id`, dst).
2. **Supabase langsung dari browser** (`src/services/supabaseService.ts`) — menulis ke tabel Supabase dengan kolom berbeda (`budget`, `travelers_count`, `description`, dst).

`TripContext.tsx` memakai keduanya sekaligus (hydrate dari SQL, tulis ke Supabase). Ini bikin data tidak konsisten dan menyulitkan deployment.

Keputusan user: **Supabase Postgres menjadi satu-satunya sumber kebenaran**. Lapisan Drizzle/Express SQL dibuang. Backend AI dipertahankan sebagai **serverless function di Vercel** (proxy Gemini agar API key tidak terekspos ke browser).

## 2. Arsitektur Target

```
[ Vercel ]
  ├── Frontend static (dist/ dari `vite build`)
  │     ├── auth & semua baca/tulis data  → Supabase Postgres via supabase-js
  │     └── panggilan AI                  → /api/ai/* (serverless)
  └── Serverless Functions
        └── api/ai/generate-itinerary.ts   (proxy Gemini, key aman di server)
        └── api/ai/generate-packing.ts     (proxy Gemini, key aman di server)

[ Supabase zysdubniqzugiyocgnfp ]
  ├── Auth: Google OAuth + Email/Password
  └── Postgres: 11 tabel (trips, itinerary_days, itinerary_items, places,
      expenses, bookings, packing_items, transports, notes, moodboard_items)
```

## 3. Keputusan Desain

- **Supabase Postgres** = satu-satunya sumber kebenaran data. Drizzle/pg dihapus.
- **Serverless function** = pengganti Express untuk endpoint AI. Kode frontend tetap memanggil `/api/ai/...` sehingga `aiService.ts` tidak berubah.
- **Skema kanonik** = mengikuti kolom yang sudah dipakai `supabaseService.ts` (snake_case). `src/db/schema.ts` (Drizzle) tidak dipakai lagi.
- **Login produksi** = Google OAuth diaktifkan (perlu set redirect URL di Supabase + konfigurasi OAuth di Google Cloud Console).
- **RLS (Row Level Security)** aktif di Supabase: user hanya bisa mengakses data miliknya.

## 4. Perubahan Kode

### 4.1 Dihapus
- `server.ts`
- `src/server/apiRouter.ts`, `src/server/expressMiddleware.ts`
- `src/db/schema.ts`, `src/db/index.ts`, `src/db/drizzle.config.ts`
- `src/services/sqlService.ts`
- Plugin `apiProxyPlugin` di `vite.config.ts` (termasuk import express/drizzle)

### 4.2 Diubah
- `src/context/TripContext.tsx` — buang semua panggilan `fetchAllDataFromSql` / `seedBanyuwangiToSql`; hydrate data lewat Supabase (query `supabase.from(...)` per tabel, filter `user_id`); tulis via `saveTripToSupabase` / `saveItemToSupabase`.
- `src/components/workspace/TabItinerary.tsx` — cek dependency ke `sqlService` (bila ada).
- `.env.example` — hapus variabel SQL, beri contoh Google Maps + Supabase.
- `vite.config.ts` — buang `process.env.GOOGLE_MAPS_PLATFORM_KEY` bila tidak dipakai; pastikan `@/` alias tetap.
- `package.json` — hapus dependency yang tidak terpakai: `express`, `pg`, `@types/pg`, `drizzle-orm`, `drizzle-kit`, `@cloudflare/kv-asset-handler`, `dotenv`, `tsx` (bila server.ts dihapus, `start` script dihapus). Tambah `@vercel/node` untuk serverless.

### 4.3 Ditambahkan
- `api/ai/generate-itinerary.ts` — Vercel serverless function, memakai `@google/genai` + `GEMINI_API_KEY`, logika prompt diambil dari `server.ts`.
- `api/ai/generate-packing.ts` — Vercel serverless function, logika sama dari `server.ts`.
- `vercel.json` — konfigurasi SPA rewrite ke `index.html`.
- `supabase/schema.sql` — DDL pembuatan tabel (skema kanonik) + RLS policies.
- (opsional) `supabase/seed.sql` — data template Banyuwangi bila perlu di-seed ke produksi.

## 5. Env Vars di Vercel
| Variabel | Keterangan |
|---|---|
| `VITE_SUPABASE_URL` | URL project Supabase (public) |
| `VITE_SUPABASE_ANON_KEY` | Anon key (public) |
| `GEMINI_API_KEY` | Key Gemini (rahasia, hanya untuk serverless) |
| `GOOGLE_MAPS_PLATFORM_KEY` | Opsional, untuk peta |

## 6. Skema Database Kanonik (ringkas)

Tabel utama `trips`: `id, name, destination, start_date, end_date, travelers_count, currency, budget, actual_spent, description, cover_image, status, is_template, is_favorite, user_id, collaborators (jsonb), member_ids (jsonb), allow_public_view, updated_at`.

Tabel pendukung (`itinerary_days`, `itinerary_items`, `places`, `expenses`, `bookings`, `packing_items`, `transports`, `notes`, `moodboard_items`) memakai skema seragam:
`id (text PK), trip_id (text), user_id (text), data (jsonb), updated_at (timestamptz)`.

Alasan: `supabaseService.saveItemToSupabase` sudah menulis payload seperti ini (`{ id, trip_id, user_id, data, updated_at }`). Hydrate dari Supabase tinggal membaca kolom `data` dan men-parsing-nya ke objek domain `TripContext`. Ini membuat kode tulis tidak perlu diubah dan skema seragam untuk semua tabel item.

## 7. RLS

- Policy `select`: `user_id = auth.uid()` ATAU `is_template = true` ATAU `allow_public_view = true`.
- Policy `insert/update/delete`: `user_id = auth.uid()`.
- `auth.uid()` dijamin konsisten karena `user_id` ditulis dari `user.uid` (Supabase user id).

## 8. Konfigurasi Auth (Google OAuth)

1. Dashboard Supabase → Authentication → Providers → Google → aktifkan.
2. Buat OAuth Client di Google Cloud Console (email: `imamnasrulloh02@gmail.com`).
3. Set `Authorized redirect URIs`:
   - `https://<project>.supabase.co/auth/v1/callback`
   - `https://<app>.vercel.app/**` (sesuai domain Vercel)
4. Isi Client ID + Client Secret di dashboard Supabase.

## 9. Cara Deploy

- **Vercel dashboard/CLI** tersambung ke repo `InitialJawa/treker` (auto-deploy per push ke `main`), ATAU `vercel` CLI dari lokal.
- Build command: `npm run build` (Vite → `dist/`).
- Set env vars di project Vercel.

## 10. Langkah Verifikasi Pasca-Deploy

1. `npm run lint` (tsc --noEmit) + `npm run build` lulus lokal.
2. Buka domain Vercel → login Google → data tampil.
3. Buat trip baru → simpan → reload → data tetap ada (Supabase).
4. Cek `/api/ai/generate-itinerary` berfungsi (iseng membuat trip dengan AI).
5. Cek RLS: user lain tidak bisa lihat trip milik user A.

## 11. Risiko / Catatan

- `bun.lock` vs `package-lock.json`: pastikan lockfile konsisten. Karena proses npm, `bun.lock` dihapus dari tracking bila tidak dipakai.
- Serverless function Vercel punya batas payload & durasi; cukup untuk Gemini (respon < 10 detik).
