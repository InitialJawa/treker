# Mode Gelap per Preset — Design Spec

**Tanggal:** 2026-08-17
**Status:** Disetujui user (desain)
**Fitur:** Setiap preset warna punya varian terang & gelap, dipilih via toggle global di pengaturan tema.

## 1. Konteks & Masalah

Sistem tema Treker saat ini (hasil UI/UX Overhaul) memakai 9 token warna (`ThemeColors`) yang diset sebagai CSS var oleh `ThemeContext.applyColorsToDOM`. Ada 6 preset, salah satunya "Midnight Dark" (`id: 'dark'`) — tetapi tema gelap tidak benar-benar berfungsi karena mayoritas komponen memakai class netral hardcode yang tidak ikut token:

- `bg-white` (142 kemunculan), `bg-gray-50/100/200/300` (127), `bg-offwhite` (30)
- `text-gray-400/500/600/700` (155)
- `border-gray-100/200/300` (134)
- `hover:bg-gray-50/100/200` (51)

Akibatnya di mode gelap: kartu tetap putih, teks abu-abu tetap gelap, dsb.

## 2. Keputusan Desain (hasil tanya-jawab)

1. **Pola UI:** toggle global **Terang / Gelap**. Preset tetap ditampilkan sebagai kartu; tiap preset punya 2 palet (`light` + `dark`).
2. **Nasib "Midnight Dark":** **dihapus**. Aksen sky-blue-nya tidak dipertahankan. Data lama dengan `presetId: 'dark'` di-migrasi ke `rose` + mode `dark`.
3. **Scope:** migrasi penuh hardcode netral ke token (pendekatan konsisten dengan constraint "sumber warna tunggal = token").

## 3. Token & Palet

### 3.1 Token baru

Tambah **satu key** ke `ThemeColors`:

| Key | CSS var | Fungsi | Light (default) | Dark |
|-----|---------|--------|-----------------|------|
| `surfaceMuted` | `--color-surface-muted` | Input, chip, hover, pengganti `bg-gray-*` & `bg-offwhite` | `#F1F5F9` | per-preset (~`#26232E`) |

Teks samar (`text-gray-400`) memakai token existing dengan opacity: `text-gray-custom/70`. **Tidak** ada token teks baru.

**Penting:** key baru tidak di-expose sebagai picker di "Penyesuaian Warna Kustom" (grid picker tetap 9 key lama). `updateColor` tetap bertipe `(key: keyof ThemeColors, value)` sehingga aman dipanggil hanya untuk key lama.

### 3.2 Palet terang (light) — sama dengan nilai saat ini

| Preset | primary | primarySoft | bgApp | bgCard | textMain | textMuted | border | surfaceMuted |
|--------|---------|-------------|-------|--------|----------|-----------|--------|--------------|
| rose | `#E11D48` | `#FFF1F2` | `#F7F8FA` | `#FFFFFF` | `#20263D` | `#64748B` | `#E8EBEF` | `#F1F5F9` |
| ocean | `#0284C7` | `#F0F9FF` | `#F8FAFC` | `#FFFFFF` | `#0F172A` | `#64748B` | `#E2E8F0` | `#F1F5F9` |
| emerald | `#059669` | `#ECFDF5` | `#F4FBF7` | `#FFFFFF` | `#064E3B` | `#475569` | `#D1FAE5` | `#F1F5F9` |
| sunset | `#D97706` | `#FFFBEB` | `#FAFAF9` | `#FFFFFF` | `#292524` | `#78716C` | `#FEF3C7` | `#F1F5F9` |
| purple | `#7C3AED` | `#F5F3FF` | `#FAF5FF` | `#FFFFFF` | `#1E1B4B` | `#6B7280` | `#EDE9FE` | `#F1F5F9` |

`selection` = `${primary}33`, `selectionText` = `primary` (tetap dihitung otomatis).

### 3.3 Palet gelap (dark)

| Preset | primary | primarySoft | bgApp | bgCard | textMain | textMuted | border | surfaceMuted |
|--------|---------|-------------|-------|--------|----------|-----------|--------|--------------|
| rose | `#FB7185` | `#33131F` | `#100F14` | `#1B1921` | `#F3F4F6` | `#9CA3AF` | `#2E2B36` | `#26232E` |
| ocean | `#38BDF8` | `#0C1F2E` | `#0F172A` | `#1E293B` | `#F1F5F9` | `#94A3B8` | `#334155` | `#293548` |
| emerald | `#34D399` | `#0B231C` | `#0B1412` | `#15211E` | `#ECFDF5` | `#94A3B8` | `#24403A` | `#1E2E2A` |
| sunset | `#FBBF24` | `#2A1E10` | `#16110C` | `#221B14` | `#FAF9F7` | `#A8A29E` | `#3B3229` | `#2E261D` |
| purple | `#A78BFA` | `#1D1633` | `#131022` | `#1E1A33` | `#F5F3FF` | `#9CA3AF` | `#332D52` | `#282245` |

`selection` = `${primary}44`, `selectionText` = `primary`.

### 3.4 Struktur data baru

```ts
export type ThemeMode = 'light' | 'dark';

export interface ThemePreset {
  id: string;            // 'rose' | 'ocean' | 'emerald' | 'sunset' | 'purple'
  name: string;
  icon: string;
  description: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
}
```

`DEFAULT_THEME` → ganti `DEFAULT_LIGHT_THEME` (rose light) + `DEFAULT_DARK_THEME` (rose dark). Preset `dark` (Midnight) dihapus dari `THEME_PRESETS`.

## 4. UI Pengaturan (AccountView)

- **Toggle Terang/Gelap** di atas grid preset: segmented control 2 tombol (`☀️ Terang` / `🌙 Gelap`), aktif sesuai `mode` saat ini. `onClick` memanggil `setMode('light'|'dark')`.
- **Kartu preset:** 5 kartu (rose, ocean, emerald, sunset, purple). Titik warna kartu mengambil `p.colors[mode]`. Label singkat tetap `p.name.split(' ')[0]`.
- **Penyesuaian Warna Kustom:** tetap 9 picker (key lama). Mengedit = `updateColor(key, value)` → simpan sebagai `custom` pada mode aktif.
- **Atur Ulang Warna:** `resetToDefault()` → `rose` + mode `light`.
- Label & teks di section tema dalam Bahasa Indonesia.

## 5. Persistensi & Migrasi Data

### 5.1 Payload tersimpan

```ts
{
  presetId: string;   // 'rose' | ... | 'custom'
  mode: ThemeMode;    // 'light' | 'dark' (baru; default 'light')
  colors: ThemeColors;
}
```

Tersimpan di `localStorage['treker_user_theme']` dan Supabase `user_settings.theme` (upsert, struktur sama).

### 5.2 Aturan muat (backward-compat)

1. Payload tanpa field `mode` → anggap `light`.
2. Payload `presetId: 'dark'` (preset lama) → ganti jadi `rose` + `mode: 'dark'`; `colors` lama **tetap dipakai** sebagai override (menghormati kemungkinan custom).
3. Bila payload punya `mode` dan `presetId` preset valid → warna = palet `[preset][mode]` yang digabung `...colors` dari payload (override custom).

### 5.3 Perilaku setPreset / setMode / updateColor / reset

- `setPreset(id)`: simpan `{ presetId: id, mode, colors: palet[id][mode] }`.
- `setMode(mode)`: 
  - preset valid → `colors = palet[presetId][mode]`;
  - `presetId === 'custom'` → warna dipertahankan apa adanya (mode hanya disimpan).
- `updateColor(key, value)`: gabung ke `colors` aktif, simpan sebagai `{ presetId: 'custom', mode, colors }`; `primary` tetap auto-set `selection`+`selectionText`.
- `resetToDefault()`: `{ presetId: 'rose', mode: 'light', colors: DEFAULT_LIGHT_THEME }`.

`saveThemeSettings(newPresetId, newMode, newColors)` menerapkan ke DOM, LocalStorage, dan Supabase (sama seperti sekarang, plus field `mode`).

## 6. Migrasi Hardcode → Token

Ganti di **seluruh `src/components`, `src/App.tsx`, `src/components/ui/*`** (kecuali yang dicatat "dibiarkan"):

| Class lama | Pengganti |
|-----------|-----------|
| `bg-white` | `bg-card-pink` |
| `bg-gray-50`, `bg-gray-100`, `bg-gray-200`, `bg-gray-300` | `bg-surface-muted` |
| `bg-offwhite` | `bg-surface-muted` |
| `hover:bg-gray-50`, `hover:bg-gray-100`, `hover:bg-gray-200` | `hover:bg-surface-muted` |
| `focus:bg-white` | `focus:bg-card-pink` |
| `text-gray-500`, `text-gray-600`, `text-gray-700` | `text-gray-custom` |
| `text-gray-400` | `text-gray-custom/70` |
| `border-gray-100`, `border-gray-200`, `border-gray-300` | `border-card-pink` |
| `bg-white/90` (tombol aksi moodboard/places) | `bg-card-pink/90` |

### Dibiarkan apa adanya (aman di dua mode)

- `text-white` (126): dipakai di atas latar aksen/gradasi; di mode gelap latar gelap + teks terang tetap kontras.
- `bg-black/60` & `bg-black/*` (51): overlay/backdrop — netral.
- Warna aksen semantik: `bg-emerald-600`, `bg-amber-*`, `text-purple-600`, dsb — bukan netral, tetap kontras.
- `shadow-*` (207): bayangan berbasis hitam — subtil di latar gelap, tidak merusak.
- Peta leaflet (InteractiveMap): tile map tetap terang — wajar.
- Gradasi hero / `from-[#1E293B]` dengan teks putih: tetap.

### Kasus khusus manual (bukan mekanis)

- `bg-dark` (3) + `border-dark` (1): token `--color-dark` = `textMain` yang **terbalik** di mode gelap (jadi terang). Ganti per-konteks:
  - `LoginView.tsx:290` (tombol login) → `bg-primary-pink hover:bg-primary-pink/90 text-white` (aksi utama).
  - `TabOverview.tsx:1357` (tombol generate AI) → `bg-primary-pink hover:bg-primary-pink/90 text-white` (aksi utama).
  - `TabMoodboard.tsx:118` (state "Board Terkunci") → `bg-gray-800 text-white border-gray-700` (tetap gelap di dua mode).
- `bg-gray-800` (1, TabOverview, di atas): hardcode gelap — biarkan.
- `bg-white/10`, `bg-white/20`, `border-white/*` (hero AccountView): overlay di atas gradasi — biarkan.
- Tombol toggle switch `bg-gray-300` (off state, AccountView): ganti `bg-surface-muted`.

### index.css

- Tambah `--color-surface-muted: #F1F5F9` di `@theme` **dan** `:root` (Tailwind 4: utility hanya di-generate dari `@theme`).
- Scrollbar thumb (`::-webkit-scrollbar-thumb`) → pakai var: `var(--color-border-soft)` agar ikut mode (opsional, minor).
- Cetak (`@media print body { background: white }`) **tetap** — PDF selalu terang.

## 7. Persistensi Data Supabase

Tidak ada perubahan skema DB. `user_settings.theme` tetap jsonb `{ presetId, mode, colors }`.

## 8. Verifikasi

1. `npm run lint` + `npm run build` lulus.
2. Manual (browser): 5 preset × 2 mode — Dashboard, TopNav, semua tab Workspace, modal CRUD, CreateTripModal, ExportPdf (pastikan print tetap terang), AccountView, LoginView.
3. Reload halaman → mode & preset tetap (localStorage/Supabase).
4. `git push origin main` → auto-deploy Vercel → cek bundle baru live.

## 9. File yang Disentuh

- `src/types/theme.ts` — `ThemeMode`, `ThemePreset` (2 palet), hapus preset `dark`, `DEFAULT_LIGHT_THEME`/`DEFAULT_DARK_THEME`, + `surfaceMuted`.
- `src/context/ThemeContext.tsx` — state `mode`, `setMode`, migrasi legacy, `saveThemeSettings` + mode.
- `src/components/AccountView.tsx` — toggle Terang/Gelap, kartu preset baca `colors[mode]`.
- `src/index.css` — token `--color-surface-muted`.
- Seluruh komponen (`src/components/**`, `src/App.tsx`) — migrasi kelas netral sesuai tabel §6.