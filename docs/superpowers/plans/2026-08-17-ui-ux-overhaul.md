# UI/UX Overhaul Treker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merombak UI/UX Treker: tema penuh (migrasi hardcode → token + perluasan settingan tema), konsistensi komponen, lokalisasi ID, aksesibilitas & feedback, responsif, dan animasi — lalu push + deploy.

**Architecture:** 6 fase berurutan (A→F). Fase A menambah token `border` ke sistem tema (types/theme.ts, ThemeContext, AccountView) lalu migrasi semua hex hardcode di `src/`. Fase B membuat primitives di `src/components/ui/` dan menyamakan radius/gaya. Fase C menerjemahkan string EN. Fase D menambah ToastContext + ConfirmDialog + aria-label. Fase E memperbaiki responsif. Fase F menambah animasi motion. Verifikasi tiap task: `npm run lint` + `npm run build`.

**Tech Stack:** React 19, TypeScript, Vite 6, Tailwind 4, Supabase, `motion@^12.23.24`.

## Global Constraints

- Bahasa kode & UI: Indonesia (kecuali istilah produk: TREKER, Tracker, nama tab workspace).
- Sumber warna tunggal = token tema (CSS vars). DILARANG hex hardcode baru.
- Radius: kartu utama `rounded-3xl`, kartu dalam tab `rounded-2xl`, modal `rounded-2xl`, tombol pill `rounded-full`.
- Gaya modal tunggal: backdrop `bg-black/60 backdrop-blur-xs` + kartu token + animasi.
- DILARANG `alert()`/`confirm()` native; pakai toast/ConfirmDialog.
- Verifikasi: `npm run lint` (tsc --noEmit) + `npm run build` harus lulus.
- Repo pakai npm. Jangan sentuh `bun.lock`.
- Tiap task diakhiri commit; urutan task = urutan commit.

**Token map (satu-satunya acuan migrasi hex):**
| Hex | Kelas Tailwind |
|-----|----------------|
| `#20263D` | `text-dark` |
| `#E8EBEF` (border) | `border-card-pink` |
| `#F7F8FA` (bg) | `bg-screen-pink` |
| `#6F7787` | `text-gray-custom` |
| `#DB2777` (hover) | `hover:bg-primary-pink` / `hover:bg-primary-pink/90` |
| `#EC4899` (ring/focus) | `ring-primary-pink/20` / `focus:border-primary-pink` |
| `#E11D48` | `primary-pink` (danger→`red-500`) |
| `#FFF1F2` | `bg-soft-pink` |
| `#64748B` (inline) | `text-gray-custom` |

---

### Task 1: Perluas sistem token tema (border) & settingan tema

**Files:**
- Modify: `src/types/theme.ts` (interface ThemeColors + DEFAULT_THEME + THEME_PRESETS)
- Modify: `src/context/ThemeContext.tsx:19-30` (applyColorsToDOM)
- Modify: `src/index.css` (:root + `.border-card-pink`)
- Modify: `src/components/AccountView.tsx` (picker border)

**Interfaces:**
- Produces: `ThemeColors.border: string`; CSS var `--color-border-soft`.

- [ ] **Step 1: Tambah key `border` ke ThemeColors + DEFAULT_THEME + preset**

`src/types/theme.ts`: tambah `border: string;` di interface; `DEFAULT_THEME` tambah `border: '#E8EBEF'`; tiap preset di `THEME_PRESETS` tambah nilai `border` koheren (rose→`#E8EBEF`, dark→`#1E293B`, ocean→`#CBD5E1`, emerald→`#D1FAE5`, lemon→`#FDE68A`, tokyo→`#312E81`). Periksa dulu id preset yang ada sebelum menulis.

- [ ] **Step 2: Set token di applyColorsToDOM**

`src/context/ThemeContext.tsx:19-30` tambah baris: `root.style.setProperty('--color-border-soft', colors.border);`

- [ ] **Step 3: Default var + border-card-pink ikut tema**

`src/index.css`: `:root { --color-border-soft: #E8EBEF; }`. Ganti definisi `.border-card-pink` agar `border-color: var(--color-border-soft);`.

- [ ] **Step 4: Picker border di AccountView**

`src/components/AccountView.tsx` di blok Custom Color Fine-Tuning, tambah kartu picker `Warna Border` (label: "Warna Border", desc: "Garis kartu & input", `onChange: (e) => handleColorChange('border', e.target.value)`, nilai `colors.border`). Pastikan `handleColorChange` bertipe `(key: keyof ThemeColors, value: string)`.

- [ ] **Step 5: Lint + build + commit**

Run: `npm run lint; npm run build`
Commit: `feat: token border masuk sistem tema + settingan tema`

### Task 2: Migrasi hardcode hex → token di seluruh src

**Files:** semua file yang memuat hex berikut (ditemukan via grep): `TabBudget`, `TabBookings`, `TabPlaces`, `TabTransport`, `TabPacking`, `TabNotes`, `CreateTripModal`, `ImagePickerField`, `AccountView`, `InteractiveMap`, `ExportPdfModal`, `LoginView`, `TopNav`, `TripWorkspaceView`, `TabOverview`, `TabMoodboard`.

**Interfaces:**
- Consumes: token map (Global Constraints).

- [ ] **Step 1: Grep semua hex target**

Run: `rg -n "#(20263D|E8EBEF|F7F8FA|6F7787|DB2777|EC4899|E11D48|FFF1F2|64748B)" src`

- [ ] **Step 2: Ganti tiap hex dengan kelas token sesuai map**

Untuk tiap kemunculan:
- `text-[#20263D]`→`text-dark`; `bg-[#20263D]`→tambah util `.bg-dark{background:var(--color-dark)}` di index.css lalu `bg-dark`.
- `border-[#E8EBEF]`/`border-gray-200`→`border-card-pink`.
- `bg-[#F7F8FA]`→`bg-screen-pink`.
- `text-[#6F7787]`→`text-gray-custom`.
- `hover:bg-[#DB2777]`→`hover:bg-primary-pink`; `hover:text-[#DB2777]`→`hover:text-primary-pink`.
- `focus:ring-[#EC4899]/20`→`focus:ring-primary-pink/20`; `text-[#EC4899]`→`text-primary-pink`.
- `bg-[#E11D48]`→`bg-primary-pink`; `text-[#E11D48]`→`text-red-500`/`text-primary-pink`.
- `bg-[#FFF1F2]`→`bg-soft-pink`.
- Hex yang merupakan nilai inline `style={{ color: ... }}` untuk aksen → ganti pakai `text-primary-pink` kelas.

- [ ] **Step 3: Cek sisa + custom = preset**

Run: `rg -n "#(20263D|E8EBEF|F7F8FA|6F7787|DB2777|EC4899|E11D48|FFF1F2)" src` → hanya tersisa yang memang data (bukan warna). Verifikasi `THEME_PRESETS`/`DEFAULT_THEME` bebas mapping.

- [ ] **Step 4: Lint + build + commit**

Run: `npm run lint; npm run build`
Commit: `feat: migrasi hardcode hex ke token tema di seluruh komponen`

### Task 3: Komponen primitif ui/

**Files:**
- Create: `src/components/ui/Button.tsx`, `Modal.tsx`, `Card.tsx`, `Badge.tsx`, `Field.tsx`, `EmptyState.tsx`, `ConfirmDialog.tsx`, `Skeleton.tsx`, `index.ts`

**Interfaces:**
- Produces: `Button` (props `variant: 'primary'|'secondary'|'ghost'|'danger'`, `size: 'sm'|'md'`, `loading?`, extends `React.ButtonHTMLAttributes`), `Modal` (props `open`, `onClose`, `title?`, `children`, `size?: 'md'|'lg'`), `ConfirmDialog` (props `open`, `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`, `danger?`), `useToast` via ToastContext (Task 6).

- [ ] **Step 1: Buat Button.tsx**

```tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  loading?: boolean;
}

const base = 'inline-flex items-center justify-center gap-2 font-bold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95';
const variants = {
  primary: 'bg-primary-pink hover:bg-primary-pink/90 text-white shadow-md',
  secondary: 'border border-card-pink bg-white hover:bg-gray-50 text-dark',
  ghost: 'text-gray-custom hover:bg-soft-pink hover:text-dark',
  danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
};
const sizes = { sm: 'px-4 py-2 text-xs rounded-xl', md: 'px-5 py-2.5 text-sm rounded-2xl' };

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...rest }) => (
  <button
    className={`${base} ${variants[variant]} ${sizes[size]} ${className || ''}`}
    disabled={disabled || loading}
    {...rest}
  >
    {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
    {children}
  </button>
);
```

- [ ] **Step 2: Buat Modal.tsx** (backdrop `bg-black/60 backdrop-blur-xs`, kartu `bg-white rounded-2xl p-6`, animasi motion fade/scale, tombol close, `role="dialog" aria-modal`, klik backdrop & Escape close, max-h + overflow-y-auto).

- [ ] **Step 3: Buat Card, Badge, Field, EmptyState, Skeleton** (`Card`: `rounded-3xl border border-card-pink`; `Badge`: chip token primary/soft; `Field`: label + children; `EmptyState`: ikon + judul + deskripsi + children; `Skeleton`: `animate-pulse bg-gray-100 rounded-*`). Export dari `index.ts`.

- [ ] **Step 4: Lint + build + commit**

Run: `npm run lint; npm run build`
Commit: `feat: komponen primitif ui (Button, Modal, Card, Badge, Field, EmptyState, ConfirmDialog, Skeleton)`

### Task 4: Konsistensi gaya — radius, modal, TabNotes, tombol header

**Files:**
- Modify: `src/components/workspace/TabNotes.tsx` (samakan header & token)
- Modify: semua modal di `src/components/` (radius `rounded-2xl`, backdrop seragam — jika belum memakai Modal, pakai `Modal` dari Task 3)
- Modify: `src/components/TripWorkspaceView.tsx`, `src/components/DashboardView.tsx`, `src/components/workspace/*` (header tab `rounded-3xl`, kartu dalam `rounded-2xl`, tombol aksi pakai `Button`)

**Interfaces:**
- Consumes: `Modal`, `Button` dari Task 3.

- [ ] **Step 1: Rapikan TabNotes**

Samakan struktur header & wrapper dengan TabPlaces (radius `rounded-3xl`, header `rounded-2xl`, token sama), ganti div tombol dengan `Button`, pastikan teks Indonesia.

- [ ] **Step 2: Standarkan modal**

Untuk setiap modal (CreateTripModal, ProjectMediaPickerModal, ExportPdfModal, modal CRUD tab): backdrop `bg-black/60 backdrop-blur-xs`, kartu `rounded-2xl`, width seragam (`max-w-lg`/`max-w-2xl`), header konsisten.

- [ ] **Step 3: Konsistensi radius & tombol workspace**

Header tab workspace → `rounded-3xl`; kartu dalam tab → `rounded-2xl`; tombol Add/simpan di header pakai `Button size="sm"`.

- [ ] **Step 4: Lint + build + commit**

Run: `npm run lint; npm run build`
Commit: `feat: standarkan radius, gaya modal, dan TabNotes`

### Task 5: Lokalisasi bahasa Indonesia

**Files:**
- Modify: `src/components/CreateTripModal.tsx` (100% EN → ID)
- Modify: label/tombol form di tab & `ExportPdfModal` & `AccountView` & `TabOverview`

- [ ] **Step 1: Terjemahkan CreateTripModal**

Judul → `Buat Perjalanan Baru`; Step 1 judul → `Langkah 1: Informasi Dasar`; `Back`→`Kembali`, `Next`→`Lanjut`, `Create Trip`→`Buat Perjalanan`; placeholder `Nama perjalanan`, `Deskripsi (opsional)`; `Where are you going?`→`Mau ke mana?`; dsb. Pertahankan label tab fitur.

- [ ] **Step 2: Terjemahkan form tab**

Grep `(Add|Save|Cancel|Delete|Edit|New|Title|Notes|Amount|Search|Filter)` di `src/components/workspace/` → ganti: Add→Tambah, Save→Simpan, Cancel→Batal, Delete→Hapus, New Note→Catatan Baru, Search→Cari, dst.

- [ ] **Step 3: Terjemahkan ExportPdfModal + AccountView + TabOverview**

`Share Link`→`Bagikan Tautan`, `Copied`→`Tersalin`, `Print`→`Cetak PDF`, `Reset Default`→`Atur Ulang`, `Custom Color Fine-Tuning`→`Penyesuaian Warna Kustom`, `Upcoming Schedule`→`Jadwal Mendatang`, `Quick Action Cards`→`Kartu Aksi Cepat`.

- [ ] **Step 4: Lint + build + commit**

Run: `npm run lint; npm run build`
Commit: `feat: lokalisasi bahasa Indonesia untuk form, modal, dan tab`

### Task 6: Toast global (ToastContext + useToast)

**Files:**
- Create: `src/context/ToastContext.tsx`
- Modify: `src/App.tsx` (bungkus provider + render container)
- Modify: `src/components/TripWorkspaceView.tsx`, `src/components/AccountView.tsx` (ganti toast inline)

**Interfaces:**
- Produces: `useToast()` → `{ showToast(message: string, type?: 'success'|'error'|'info'): void }`.

- [ ] **Step 1: Buat ToastContext.tsx**

Provider simpan `{id, message, type}[]`; `showToast` auto-remove 3s; render container `fixed bottom-6 right-6 z-[100]` dengan animasi motion (fade + slide). Ikon sesuai type. `useToast` hook.

- [ ] **Step 2: Integrasikan di App.tsx**

Bungkus tree dengan `<ToastProvider>`. 

- [ ] **Step 3: Ganti toast inline**

`TripWorkspaceView.tsx` & `AccountView.tsx`: hapus state/JSX toast lokal, pakai `useToast().showToast(...)`.

- [ ] **Step 4: Lint + build + commit**

Run: `npm run lint; npm run build`
Commit: `feat: toast global (ToastContext + useToast)`

### Task 7: Konfirmasi hapus, aria-label, hapus Firestore, z-index

**Files:**
- Modify: `src/components/workspace/*` (ConfirmDialog pada aksi hapus)
- Modify: `src/components/CreateTripModal.tsx`, `TripWorkspaceView.tsx`, `ProjectMediaPickerModal.tsx`, `ImagePickerField.tsx` (ganti `alert()`/`confirm()` native)
- Modify: tombol ikon di semua komponen (`aria-label`)
- Modify: `src/components/workspace/TabMoodboard.tsx` (z-index 999999→z-50)

**Interfaces:**
- Consumes: `ConfirmDialog` (Task 3), `useToast` (Task 6).

- [ ] **Step 1: Ganti alert/confirm native**

Grep `(alert|confirm)\\(` → ganti: konfirmasi pakai `ConfirmDialog` (state `confirmState` di tiap tab), feedback pakai `showToast`. Buat pattern: `const [confirm, setConfirm] = useState<{type, payload} | null>(null)`; render `<ConfirmDialog open={!!confirm} ... />`; handler hapus dipanggil dari dialog.

- [ ] **Step 2: Konfirmasi hapus di tab**

Terapkan ConfirmDialog untuk hapus di Places, Moodboard, Budget, Transport, Packing, Bookings (item/budget/booking/note sesuai domain).

- [ ] **Step 3: aria-label tombol ikon**

Grep tombol tanpa teks (hanya ikon lucide) → tambah `aria-label="<tindakan>"` (Contoh: Hapus tempat, Tutup, Bagikan, Edit).

- [ ] **Step 4: Bersihkan teks & z-index**

Grep `Firestore` → ganti `Supabase`. `TabMoodboard` z-index `999999` → `z-50`.

- [ ] **Step 5: Lint + build + commit**

Run: `npm run lint; npm run build`
Commit: `feat: konfirmasi hapus, aria-label, toast feedback, z-index rapi`

### Task 8: Responsif

**Files:**
- Modify: `src/components/TopNav.tsx` (akses Home di mobile)
- Modify: `src/components/workspace/TabMoodboard.tsx` (tinggi board responsif, kolom mobile)
- Modify: `src/components/ExportPdfModal.tsx` (ringkasan budget `grid-cols-1 sm:grid-cols-3`)
- Modify: `src/components/TopNav.tsx` (dropdown `max-w-[90vw]`)

- [ ] **Step 1: Home di nav mobile**

`TopNav`: pastikan item `Home` muncul di menu mobile (ikon + label) dan navigasi `Dashboard` jalan.

- [ ] **Step 2: Moodboard responsif**

`TabMoodboard`: ganti `h-[600px] md:h-[800px]` dengan `min-h`; grid papan di layar kecil jadi 1 kolom / scroll; node rnd tetap `min-w` agar tidak hancur.

- [ ] **Step 3: ExportPdfModal grid budget**

Ringkasan budget: `grid grid-cols-1 sm:grid-cols-3 gap-3`.

- [ ] **Step 4: Dropdown TopNav max-width**

Dropdown menu profil/trip: tambah `max-w-[90vw]`.

- [ ] **Step 5: Lint + build + commit**

Run: `npm run lint; npm run build`
Commit: `feat: perbaikan responsif (Home mobile, moodboard, budget export, dropdown)`

### Task 9: Animasi & micro-interaksi

**Files:**
- Modify: `src/components/TripWorkspaceView.tsx` (transisi tab via `motion.div key={activeTab}`)
- Modify: `src/App.tsx` (`AnimatePresence` transisi halaman)
- Modify: `src/components/ui/Modal.tsx` (sudah motion di Task 3 — pastikan dipakai semua modal)
- Modify: `src/components/DashboardView.tsx` (Skeleton saat loading data)
- Modify: tombol aksi (pastikan `active:scale-95` konsisten)

**Interfaces:**
- Consumes: `Skeleton` (Task 3), `Modal` motion (Task 3).

- [ ] **Step 1: Transisi tab**

`TripWorkspaceView`: bungkus konten tab dengan `motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}`.

- [ ] **Step 2: Transisi halaman**

`App`: bungkus view utama dengan `<AnimatePresence mode="wait">` + `motion.div key={currentView}` fade.

- [ ] **Step 3: Skeleton dashboard**

`DashboardView`: saat `loading`, render `Skeleton` kartu grid (6 buah) di tiap seksi.

- [ ] **Step 4: Micro-interaksi**

Grep tombol aksi utama → pastikan `active:scale-95`; hover konsisten (primer `/90`, sekunder `bg-gray-50`).

- [ ] **Step 5: Lint + build + commit**

Run: `npm run lint; npm run build`
Commit: `feat: animasi transisi tab & halaman, skeleton loading, micro-interaksi`

### Task 10: Verifikasi akhir & push

- [ ] **Step 1: Verifikasi penuh**

Run: `npm run lint; npm run build` → keduanya lulus tanpa error.

- [ ] **Step 2: Review diff singkat**

`git status` + `git log --oneline -12` → pastikan 10 task ter-commit rapi.

- [ ] **Step 3: Push & cek deploy**

Run: `git push origin main` → tunggu auto-deploy Vercel → cek live `https://treker-rust.vercel.app` (bundle berisi penanda baru, mis. `Penyesuaian Warna Kustom`).