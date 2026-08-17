# Desain: Dashboard Project + Indikator Jenis Project (Pribadi / Shared / Template)

Tanggal: 2026-08-17
Status: Disetujui (brainstorming)

## Ringkasan

Menambah halaman **Dashboard/Home** sebagai halaman awal setelah login, menampilkan semua project dalam grid yang dikelompokkan per seksi. Setiap kartu menampilkan indikator jenis project (Pribadi / Shared / Template), status read-only untuk template, jumlah kolaborator, status waktu trip, dan tombol favorit. Logika badge dipusatkan di satu helper agar konsisten di tiga tempat: kartu dashboard, dropdown TopNav, dan hero banner workspace.

## Latar belakang

Saat ini tidak ada halaman daftar project; pemilihan project hanya lewat dropdown TopNav yang badge-nya kecil, tidak konsisten, dan tersembunyi. Tidak ada penanda jelas di workspace (hero banner) apakah project itu pribadi, di-share, atau template yang hanya bisa dikopi.

## Arsitektur & file baru

- `src/utils/tripBadges.ts` — helper murni, satu sumber kebenaran badge:
  - `getTripType(trip, user)` → `'pribadi' | 'shared' | 'template'`
    - owned (`userId === user.uid` atau `userId` kosong/legacy) → `pribadi`
    - `userId !== user.uid` → `shared`
    - publik (`isTemplate` dari katalog, milik bukan user) → `template`
  - `getTripTimeStatus(trip)` → `'upcoming' | 'current' | 'past'`, dihitung dari `startDate`/`endDate` vs hari ini (tidak memakai field `status` yang sering basi).
  - `isTemplateReadOnly(trip, user)` → `!hasEditAccess && trip.isTemplate`, dengan `hasEditAccess = isOwner || isCollaborator`.
  - `getBadgeData(trip, user)` → objek siap-render (label, warna, ikon) untuk jenis project.
- `src/components/TripCard.tsx` — kartu presentasional: cover, nama, destinasi + tanggal, badge jenis, gembok read-only, chip jumlah kolaborator, chip status waktu, hati favorit. Klik kartu → buka workspace.
- `src/components/DashboardView.tsx` — grid seksi: **Project Saya** → **Di-share dengan Saya** → **Template Publik**.

## Dashboard & navigasi

- `App.tsx`: `currentView` default `'Dashboard'` → dashboard jadi home setelah login. Nav: **Home / Tracker / Account**.
- Klik kartu → `setActiveTripId(id)` + `setCurrentView('Workspace')`.
- Seksi "Template Publik": klik membuka workspace mode view-only (memakai alur `isTemplateViewOnly` yang sudah ada → tombol "Gunakan Template Ini" untuk menyalin). Entry `PublicTemplatesModal` dari dropdown TopNav dilepas (fungsinya tergantikan dashboard).
- Empty state bila tidak ada project.

## Badge & indikator

- Warna jenis: Pribadi = pink, Shared = ungu, Template = amber/soft-pink.
- Status waktu: chip "Akan Datang" / "Sedang Berlangsung" / "Selesai".
- Read-only template: ikon `Lock` + label "Hanya Bisa Dikopi" di kartu dan banner.
- Jumlah kolaborator: ikon `Users` + angka, hanya saat `collaborators.length > 0`.
- Favorit: `Heart` toggle di kartu → `toggleTripFavorite` (API sudah ada, tanpa perubahan schema).

## Konsistensi di dropdown & workspace

- `TopNav.tsx`: dropdown dipertahankan sebagai switcher cepat; badge memakai `getBadgeData` (bukan hardcode).
- `TripWorkspaceView.tsx`: hero banner mendapat badge jenis + indikator read-only, konsisten dengan kartu.

## Edge cases

- Template milik sendiri (`isTemplate=true` + owner) → muncul di "Project Saya" dengan badge Template, tetap bisa diedit (owner).
- Trip tanpa `userId` (guest/legacy) → dianggap Pribadi.
- Verifikasi: `npm run lint` (tsc --noEmit) + `npm run build`.

## Data flow

Tidak ada perubahan schema Supabase. Semua data dari state `TripContext` yang sudah ada. Favorit memakai `toggleTripFavorite`; pemilihan trip memakai `setActiveTripId`.

## Pengujian

- Lint + build lulus.
- Verifikasi manual: login → default ke Dashboard; kartu menampilkan badge yang benar; klik kartu membuka workspace; template publik view-only dengan tombol kopi; favorit tersimpan setelah reload.