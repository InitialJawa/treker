# Desain: UI/UX Overhaul Treker (Tema, Konsistensi, Lokalisasi, Aksesibilitas, Responsif, Animasi)

Tanggal: 2026-08-17
Status: Disetujui (brainstorming)

## Ringkasan

Perombakan UI/UX menyeluruh dalam 6 fase: (A) migrasi semua hex hardcode ke token tema + perluasan settingan tema, (B) standarisasi komponen primitif & konsistensi gaya, (C) lokalisasi bahasa Indonesia, (D) aksesibilitas & feedback (toast, konfirmasi, aria-label), (E) perbaikan responsif, (F) UX & animasi (transisi tab/halaman/modal, loading skeleton, micro-interaksi). Semua fase berakhir verifikasi lint + build + commit, dan diakhiri push GitHub + auto-deploy Vercel.

## Latar belakang (temuan survei)

- Token tema sudah ada (`--color-primary-pink`, `--color-soft-pink`, dst.) tapi form/modal memakai hex hardcode (`#20263D`, `#E8EBEF`, `#F7F8FA`, `#6F7787`, `#DB2777`, `#EC4899`) sehingga custom theme Dark/Ocean/Emerald tidak berfungsi di layer form (~60% UI).
- Warna border `#E8EBEF` tidak punya token; `.border-card-pink` di `index.css` hardcoded `rgba(226,232,240,0.6)` → tidak ikut tema.
- Settingan tema (`types/theme.ts`, `ThemeContext.tsx`, `AccountView.tsx`) hanya mengekspos 3 dari 8 warna di fine-tuning; tidak punya konsep "border".
- Inkonsistensi: 4 level radius, 2 gaya modal, TabNotes beda dari 8 tab lain, CreateTripModal 100% bahasa Inggris.
- Bahasa campur ID/EN pada label & tombol form.
- 0 `aria-label`; `alert()`/`confirm()` native; hapus data tanpa konfirmasi; teks usang "Firestore"; `z-index 999999` di moodboard.
- Responsif: TopNav mobile tanpa akses Home; moodboard tinggi fixed; ExportPdfModal grid budget 3 kolom tetap.
- Pustaka `motion` sudah terpasang (`motion: ^12.23.24`); ada `animate-fade-in`/`animate-scale-up`.

## Prinsip desain

- Token tema = satu-satunya sumber warna; semua elemen ikut tema.
- Skala radius seragam: kartu utama `rounded-3xl`, kartu dalam tab `rounded-2xl`, modal `rounded-2xl`, tombol pill `rounded-full`.
- Satu gaya modal: backdrop `bg-black/60 backdrop-blur-xs` + kartu token + animasi buka.
- Bahasa UI Indonesia; nama tab workspace (Itinerary, Budget, dst.) tetap sebagai label fitur.
- Feedback: toast global + dialog konfirmasi; tidak ada `alert()`/`confirm()` native.
- Animasi memakai `motion` + `AnimatePresence`.

## Fase A — Tema

**Perluasan sistem token & settingan tema:**
- `types/theme.ts`: tambah key `border` ke `ThemeColors` (default `#E8EBEF`). Isi nilai `border` untuk ke-6 preset (Dark → `#1E293B`, dst.).
- `ThemeContext.tsx` `applyColorsToDOM`: set `--color-border-soft` dari `colors.border`.
- `index.css`: `:root` tambah `--color-border-soft: #E8EBEF`; `.border-card-pink` pakai `var(--color-border-soft)`.
- `AccountView.tsx`: tambah picker warna untuk `border` di bagian Custom Color Fine-Tuning.

**Migrasi hardcode → token (seluruh src):**
- `#20263D` → `text-dark` (atau `bg-dark` baru bila ada `bg-[#20263D]`).
- `#E8EBEF` (border) → `border-card-pink`.
- `#F7F8FA` (bg) → `bg-screen-pink`.
- `#6F7787` → `text-gray-custom`.
- `#DB2777` (hover) → `hover:bg-primary-pink` / `hover:bg-primary-pink/90`.
- `#EC4899` → `primary-pink` (ring/focus) atau `rose-*` → token.
- `#E11D48`/`#FFF1F2`/`#64748B` di string inline → token kelas.

File target: 6 modal CRUD tab (Budget, Bookings, Places, Transport, Packing, Notes), `CreateTripModal`, `ImagePickerField`, `AccountView`, `InteractiveMap`, `ExportPdfModal`, `LoginView`, `TopNav`, `TripWorkspaceView`, `TabOverview`, `TabMoodboard`.

**Verifikasi:** ganti tema ke Dark di runtime, pastikan form/modal/border ikut berubah.

## Fase B — Konsistensi gaya & komponen primitif

File baru `src/components/ui/`:
- `Button.tsx` — variant primary/secondary/ghost/danger, size sm/md, prop `loading`.
- `Modal.tsx` — backdrop + kartu `rounded-2xl` + animasi (motion) + close; dipakai semua modal.
- `Card.tsx` — `rounded-3xl` + `border-card-pink`.
- `Badge.tsx` — chip token.
- `Field.tsx` — label + control wrapper seragam.
- `EmptyState.tsx` — ikon + judul + aksi.
- `ConfirmDialog.tsx` — konfirmasi hapus.
- `Skeleton.tsx` — loading placeholder.

Refactor: unifikasi radius header tab (kartu utama `rounded-3xl`), gaya modal (`rounded-2xl`), dan rapikan `TabNotes` agar seragam dengan 8 tab lain (header, radius, spacing, token). Tombol header workspace pakai `Button`.

## Fase C — Lokalisasi bahasa ID

- `CreateTripModal` (100% EN → ID): judul, placeholder, tombol Back/Next/Create.
- Tombol/label/placeholder form tab: Add→Tambah, Save→Simpan, Cancel→Batal, Edit→Edit, New Note→Catatan Baru, dst.
- `ExportPdfModal`: Share Link→Bagikan Tautan, Print→Cetak PDF, Copied→Tersalin.
- `AccountView`: Reset Default→Atur Ulang, Custom Color Fine-Tuning→Penyesuaian Warna Kustom.
- `TabOverview`: Upcoming Schedule→Jadwal Mendatang, Quick Action Cards→Kartu Aksi Cepat.
- Pertahankan istilah produk (TREKER, Tracker, Workspace) dan nama tab.

## Fase D — Aksesibilitas & feedback

- `src/context/ToastContext.tsx` + `useToast()`; render toast container di App; ganti toast inline (`TripWorkspaceView`, `AccountView`).
- Ganti `alert()`/`confirm()` native dengan `ConfirmDialog`/toast di: `CreateTripModal`, `TripWorkspaceView`, `ProjectMediaPickerModal`, `ImagePickerField`.
- Tambah `aria-label` ke semua tombol ikon (grep `className=".*p-2"` dsb.).
- Konfirmasi sebelum hapus: Places, Moodboard, Budget, Transport, Packing, Bookings.
- Hapus teks "Firestore" → "Supabase".
- Normalisasi `z-index`: moodboard `999999` → `z-50`; modal `z-50`.

## Fase E — Responsif

- `TopNav`: tambah tombol Home di nav mobile.
- `TabMoodboard`: tinggi board responsif; hindari `h-[600px] md:h-[800px]` fixed untuk layout kolom di layar kecil.
- `ExportPdfModal`: ringkasan budget `grid-cols-1 sm:grid-cols-3`.
- `TopNav` dropdown: `max-w-[90vw]`.

## Fase F — UX & animasi

- Transisi tab workspace: `motion.div key={activeTab}` fade + slide di `TripWorkspaceView`.
- Transisi halaman: `AnimatePresence` di `App` untuk Dashboard↔Workspace↔Account.
- Modal seragam: animasi buka via `Modal` (backdrop fade + kartu scale).
- Loading skeleton: dashboard (grid kartu) saat data dimuat; skeleton komponen untuk list tab.
- Micro-interaksi: `active:scale-95` dan hover konsisten (mayoritas sudah ada; lengkapi yang belum).

## Urutan eksekusi & verifikasi

Urutan: A → B → C → D → E → F. Tiap fase: `npm run lint` + `npm run build` + commit. Akhir: push GitHub → auto-deploy Vercel → verifikasi bundle live mengandung penanda baru.

## Pengujian

- Lint (tsc --noEmit) + build lulus setiap fase.
- Verifikasi manual: ganti tema Dark → form/modal/border ikut tema; akses semua tab CRUD normal; hapus data muncul konfirmasi; toast muncul; transisi tab halus; mobile punya akses Home.