# Mode Gelap per Preset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan mode gelap pada sistem tema Treker — tiap preset (rose, ocean, emerald, sunset, purple) punya palet `light` + `dark`, dipilih lewat toggle Terang/Gelap di pengaturan, plus migrasi penuh class netral hardcode ke token agar mode gelap benar-benar gelap.

**Architecture:** 5 fase bertahap yang tiap task-nya menjaga proyek tetap compile-hijau. (1) `types/theme.ts` + `index.css` menambah token `surfaceMuted` + palet gelap (transisi `colors` + `darkColors`). (2) `ThemeContext` jadi mode-aware (`mode` + `setMode`, migrasi legacy `presetId:'dark'`). (3) `AccountView` menambah toggle & kartu baca palet mode aktif. (4) migrasi bulk ~830 class netral hardcode → token via script regex + kasus manual. (5) verifikasi, commit rapi, push + auto-deploy.

**Tech Stack:** React 19, TypeScript, Vite 6, Tailwind 4, Supabase, PowerShell (regex migrasi).

## Global Constraints

- Bahasa kode & UI: Indonesia.
- Sumber warna tunggal = token tema (CSS var). DILARANG hex/class netral hardcode baru yang tidak pakai token.
- Token `--color-dark` (`textMain`) adalah WARN: dipakai juga sebagai background di 3 tempat — di mode gelap nilainya terbalik (terang) → wajib diganti (Task 4).
- Cetak PDF (`@media print body { background: white }`) tetap paksa terang — jangan ubah.
- `text-white` (126x) dan `bg-black/*` (51x) sengaja DIBIARKAN (aman di dua mode).
- Repo pakai npm. Jangan sentuh `bun.lock`.
- Verifikasi: `npm run lint` (tsc --noEmit) + `npm run build` harus lulus tiap task.
- Data tema tersimpan `{ presetId, mode, colors }` di localStorage `treker_user_theme` + Supabase `user_settings.theme` (jsonb, tanpa perubahan skema).
- Referensi palet lengkap: `docs/superpowers/specs/2026-08-17-mode-gelap-per-preset-design.md` §3.

---

### Task 1: Palet & tipe baru (transitional, tetap hijau)

**Files:**
- Modify: `src/types/theme.ts` (seluruh isi diganti)
- Modify: `src/index.css` (tambah token `--color-surface-muted`)

**Interfaces:**
- Produces:
  - `export type ThemeMode = 'light' | 'dark';`
  - `ThemeColors` + key `surfaceMuted: string;`
  - `ThemePreset` + `darkColors: ThemeColors` (palet gelap; `colors` tetap = palet terang).
  - `DEFAULT_THEME` (rose light) + `DEFAULT_DARK_THEME` (rose dark).
  - `THEME_PRESETS`: 5 preset (rose, ocean, emerald, sunset, purple); preset `dark` DIHAPUS.
  - CSS var `--color-surface-muted`.

- [ ] **Step 1: Tulis ulang `src/types/theme.ts`**

```ts
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primarySoft: string;
  bgApp: string;
  bgCard: string;
  textMain: string;
  textMuted: string;
  border: string;
  selection: string;
  selectionText: string;
  surfaceMuted: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  colors: ThemeColors;       // palet terang
  darkColors: ThemeColors;   // palet gelap
}

export const DEFAULT_THEME: ThemeColors = {
  primary: '#E11D48',
  primarySoft: '#FFF1F2',
  bgApp: '#F7F8FA',
  bgCard: '#FFFFFF',
  textMain: '#20263D',
  textMuted: '#64748B',
  border: '#E8EBEF',
  selection: '#E11D4833',
  selectionText: '#E11D48',
  surfaceMuted: '#F1F5F9',
};

export const DEFAULT_DARK_THEME: ThemeColors = {
  primary: '#FB7185',
  primarySoft: '#33131F',
  bgApp: '#100F14',
  bgCard: '#1B1921',
  textMain: '#F3F4F6',
  textMuted: '#9CA3AF',
  border: '#2E2B36',
  selection: '#FB718544',
  selectionText: '#FB7185',
  surfaceMuted: '#26232E',
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'rose',
    name: 'Rose Pink (Default)',
    icon: '🌹',
    description: 'Tampilan klasik yang elegan dan cerah',
    colors: DEFAULT_THEME,
    darkColors: DEFAULT_DARK_THEME,
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    icon: '🌊',
    description: 'Warna biru laut yang tenang dan fresh',
    colors: {
      primary: '#0284C7', primarySoft: '#F0F9FF', bgApp: '#F8FAFC', bgCard: '#FFFFFF',
      textMain: '#0F172A', textMuted: '#64748B', border: '#E2E8F0',
      selection: '#0284C733', selectionText: '#0284C7', surfaceMuted: '#F1F5F9',
    },
    darkColors: {
      primary: '#38BDF8', primarySoft: '#0C1F2E', bgApp: '#0F172A', bgCard: '#1E293B',
      textMain: '#F1F5F9', textMuted: '#94A3B8', border: '#334155',
      selection: '#38BDF844', selectionText: '#38BDF8', surfaceMuted: '#293548',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    icon: '🌿',
    description: 'Hijau tropis bernuansa alam',
    colors: {
      primary: '#059669', primarySoft: '#ECFDF5', bgApp: '#F4FBF7', bgCard: '#FFFFFF',
      textMain: '#064E3B', textMuted: '#475569', border: '#D1FAE5',
      selection: '#05966933', selectionText: '#059669', surfaceMuted: '#F1F5F9',
    },
    darkColors: {
      primary: '#34D399', primarySoft: '#0B231C', bgApp: '#0B1412', bgCard: '#15211E',
      textMain: '#ECFDF5', textMuted: '#94A3B8', border: '#24403A',
      selection: '#34D39944', selectionText: '#34D399', surfaceMuted: '#1E2E2A',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Amber',
    icon: '🌅',
    description: 'Kehangatan warna senja dan jingga',
    colors: {
      primary: '#D97706', primarySoft: '#FFFBEB', bgApp: '#FAFAF9', bgCard: '#FFFFFF',
      textMain: '#292524', textMuted: '#78716C', border: '#FEF3C7',
      selection: '#D9770633', selectionText: '#D97706', surfaceMuted: '#F1F5F9',
    },
    darkColors: {
      primary: '#FBBF24', primarySoft: '#2A1E10', bgApp: '#16110C', bgCard: '#221B14',
      textMain: '#FAF9F7', textMuted: '#A8A29E', border: '#3B3229',
      selection: '#FBBF2444', selectionText: '#FBBF24', surfaceMuted: '#2E261D',
    },
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    icon: '🔮',
    description: 'Ungu mewah bernuansa modern',
    colors: {
      primary: '#7C3AED', primarySoft: '#F5F3FF', bgApp: '#FAF5FF', bgCard: '#FFFFFF',
      textMain: '#1E1B4B', textMuted: '#6B7280', border: '#EDE9FE',
      selection: '#7C3AED33', selectionText: '#7C3AED', surfaceMuted: '#F1F5F9',
    },
    darkColors: {
      primary: '#A78BFA', primarySoft: '#1D1633', bgApp: '#131022', bgCard: '#1E1A33',
      textMain: '#F5F3FF', textMuted: '#9CA3AF', border: '#332D52',
      selection: '#A78BFA44', selectionText: '#A78BFA', surfaceMuted: '#282245',
    },
  },
];
```

- [ ] **Step 2: Tambah token di `src/index.css`**

Di blok `@theme` DAN blok `:root` tambahkan baris `--color-surface-muted: #F1F5F9;` setelah `--color-border-soft`.

```css
@theme {
  /* ...baris existing... */
  --color-surface-muted: #F1F5F9;
}

@layer base {
  :root {
    /* ...baris existing... */
    --color-surface-muted: #F1F5F9;
  }
}
```

- [ ] **Step 3: Lint + build**

Run: `npm run lint; npm run build`
Expected: lulus (Task 1 additive — consumer lama `p.colors` dan `DEFAULT_THEME` masih valid).

- [ ] **Step 4: Commit**

```bash
git add src/types/theme.ts src/index.css
git commit -m "feat: palet gelap per preset + token surface-muted (tipe ThemeMode)"
```

---

### Task 2: ThemeContext mode-aware + migrasi legacy

**Files:**
- Modify: `src/context/ThemeContext.tsx`

**Interfaces:**
- Consumes: `ThemeMode`, `ThemePreset`, `DEFAULT_THEME`, `DEFAULT_DARK_THEME`, `THEME_PRESETS` (Task 1).
- Produces:
  - `mode: ThemeMode` + `setMode(mode: ThemeMode): Promise<void>` di `ThemeContextType`.
  - `applyColorsToDOM` juga set `--color-surface-muted`.
  - Payload persist: `{ presetId, mode, colors }`.
  - Migrasi: payload tanpa `mode` → `light`; `presetId:'dark'` → `rose` + `dark`.

- [ ] **Step 1: Tambah helper resolusi palet**

Di `ThemeContext.tsx` (setelah konstanta `LOCAL_STORAGE_KEY`), tambah:

```ts
const getPalette = (presetId: string, mode: ThemeMode): ThemeColors => {
  const preset = THEME_PRESETS.find((p) => p.id === presetId);
  if (!preset) return mode === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_THEME;
  return mode === 'dark' ? preset.darkColors : preset.colors;
};

const resolveMode = (storedMode: unknown): ThemeMode => (storedMode === 'dark' ? 'dark' : 'light');
const resolvePreset = (storedPreset: unknown): string =>
  storedPreset === 'dark' ? 'rose' : typeof storedPreset === 'string' ? storedPreset : 'custom';
```

- [ ] **Step 2: `applyColorsToDOM` + interface + state `mode`**

```ts
const applyColorsToDOM = (colors: ThemeColors) => {
  const root = document.documentElement;
  root.style.setProperty('--color-primary-pink', colors.primary);
  root.style.setProperty('--color-primary-gradient', colors.primary);
  root.style.setProperty('--color-soft-pink', colors.primarySoft);
  root.style.setProperty('--color-screen-pink', colors.bgApp);
  root.style.setProperty('--color-card-pink', colors.bgCard);
  root.style.setProperty('--color-dark', colors.textMain);
  root.style.setProperty('--color-gray-custom', colors.textMuted);
  root.style.setProperty('--color-border-soft', colors.border);
  root.style.setProperty('--color-selection', colors.selection || `${colors.primary}33`);
  root.style.setProperty('--color-selection-text', colors.selectionText || colors.primary);
  root.style.setProperty('--color-surface-muted', colors.surfaceMuted);
};
```

Tambahkan di `ThemeContextType` (atas file):

```ts
interface ThemeContextType {
  presetId: string;
  mode: ThemeMode;
  colors: ThemeColors;
  setPreset: (id: string) => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
  updateColor: (key: keyof ThemeColors, value: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
  isSaving: boolean;
}
```

Tambah state (sebelum `isSaving`):

```ts
const [mode, setMode] = useState<ThemeMode>('light');
```

- [ ] **Step 3: Perbarui muat dari LocalStorage (useEffect #1)**

Ganti blok `if (cached) { ... } else { applyColorsToDOM(DEFAULT_THEME); }` menjadi:

```ts
if (cached) {
  const parsed = JSON.parse(cached);
  if (parsed.colors) {
    const loadedMode = resolveMode(parsed.mode);
    const loadedPreset = resolvePreset(parsed.presetId);
    const mergedColors: ThemeColors = {
      ...getPalette(loadedPreset, loadedMode),
      ...(parsed.colors || {}),
    };
    setMode(loadedMode);
    setPresetId(loadedPreset);
    setColors(mergedColors);
    applyColorsToDOM(mergedColors);
  }
} else {
  applyColorsToDOM(DEFAULT_THEME);
}
```

- [ ] **Step 4: Perbarui muat dari Supabase (useEffect #2)**

Di dalam `fetchUserTheme`, ganti blok `const userTheme = data.theme; ...` menjadi:

```ts
const userTheme = data.theme;
const loadedMode = resolveMode(userTheme.mode);
const loadedPreset = resolvePreset(userTheme.presetId);
const mergedColors: ThemeColors = {
  ...getPalette(loadedPreset, loadedMode),
  ...(userTheme.colors || {}),
};

setMode(loadedMode);
setPresetId(loadedPreset);
setColors(mergedColors);
applyColorsToDOM(mergedColors);

localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
  presetId: loadedPreset,
  mode: loadedMode,
  colors: mergedColors,
}));
```

- [ ] **Step 5: Perbarui `saveThemeSettings` + `setPreset` + `setMode` + `updateColor` + `resetToDefault`**

```ts
const saveThemeSettings = async (newPresetId: string, newMode: ThemeMode, newColors: ThemeColors) => {
  setIsSaving(true);
  setColors(newColors);
  setPresetId(newPresetId);
  setMode(newMode);
  applyColorsToDOM(newColors);

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      presetId: newPresetId,
      mode: newMode,
      colors: newColors,
    }));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }

  if (user && isSupabaseConfigured) {
    try {
      await supabase.from('user_settings').upsert({
        user_id: user.uid,
        user_email: user.email,
        updated_at: new Date().toISOString(),
        theme: {
          presetId: newPresetId,
          mode: newMode,
          colors: newColors,
        },
      });
    } catch (err) {
      console.warn('Supabase theme save notice:', err);
    }
  }

  setIsSaving(false);
};

const setPreset = async (id: string) => {
  const foundPreset = THEME_PRESETS.find((p) => p.id === id);
  if (foundPreset) {
    const palette = mode === 'dark' ? foundPreset.darkColors : foundPreset.colors;
    await saveThemeSettings(id, mode, palette);
  }
};

const setMode = async (m: ThemeMode) => {
  const foundPreset = THEME_PRESETS.find((p) => p.id === presetId);
  if (foundPreset) {
    const palette = m === 'dark' ? foundPreset.darkColors : foundPreset.colors;
    await saveThemeSettings(presetId, m, palette);
  } else {
    await saveThemeSettings('custom', m, colors);
  }
};

const updateColor = async (key: keyof ThemeColors, value: string) => {
  const updatedColors = {
    ...colors,
    [key]: value,
    ...(key === 'primary' ? {
      selection: `${value}33`,
      selectionText: value,
    } : {}),
  };
  await saveThemeSettings('custom', mode, updatedColors);
};

const resetToDefault = async () => {
  await saveThemeSettings('rose', 'light', DEFAULT_THEME);
};
```

- [ ] **Step 6: Sertakan `mode` + `setMode` di provider value**

Tambahkan `mode,` dan `setMode,` pada objek `value` `ThemeContext.Provider`.

- [ ] **Step 7: Lint + build**

Run: `npm run lint; npm run build`
Expected: lulus (AccountView belum berubah, tetap pakai `p.colors` = palet terang — tidak error).

- [ ] **Step 8: Commit**

```bash
git add src/context/ThemeContext.tsx
git commit -m "feat: ThemeContext mode gelap (setMode, migrasi legacy dark preset, persist mode)"
```

---

### Task 3: UI AccountView — toggle Terang/Gelap + kartu preset mode-aware

**Files:**
- Modify: `src/components/AccountView.tsx`

**Interfaces:**
- Consumes: `useTheme()` → `{ presetId, mode, colors, setPreset, setMode, updateColor, resetToDefault, isSaving }`; `THEME_PRESETS`, `ThemeMode` (Task 1).

- [ ] **Step 1: Tambah import `ThemeMode`**

```ts
import { THEME_PRESETS, ThemeColors, ThemeMode } from '../types/theme';
```

- [ ] **Step 2: Ambil `mode` dari `useTheme` + buat handler**

Di dalam komponen, di bagian destructure `useTheme()`, pastikan ada `mode` dan `setMode`. Tambah handler:

```ts
const handleModeSelect = (m: ThemeMode) => {
  setMode(m);
};
```

- [ ] **Step 3: Toggle Terang/Gelap di atas grid preset**

Sisipkan tepat di atas label `Pilihan Preset Warna Instan` (di dalam `<div className="space-y-3">`):

```tsx
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
  <label className="text-xs font-extrabold text-dark uppercase tracking-wider flex items-center gap-1.5">
    <Palette className="w-3.5 h-3.5 text-primary-pink" /> Mode Tema
  </label>
  <div className="flex rounded-full border border-card-pink bg-screen-pink p-1 gap-1 w-fit">
    <button
      onClick={() => handleModeSelect('light')}
      aria-pressed={mode === 'light'}
      className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all active:scale-95 ${
        mode === 'light'
          ? 'bg-primary-pink text-white shadow-sm'
          : 'text-gray-custom hover:text-dark'
      }`}
    >
      ☀️ Terang
    </button>
    <button
      onClick={() => handleModeSelect('dark')}
      aria-pressed={mode === 'dark'}
      className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all active:scale-95 ${
        mode === 'dark'
          ? 'bg-primary-pink text-white shadow-sm'
          : 'text-gray-custom hover:text-dark'
      }`}
    >
      🌙 Gelap
    </button>
  </div>
</div>
```

- [ ] **Step 4: Kartu preset baca palet mode aktif**

Di map `THEME_PRESETS`, ubah tiga titik warna agar memakai palet mode aktif. Ganti blok:

```tsx
const palette = mode === 'dark' ? p.darkColors : p.colors;
```

lalu gunakan `palette.primary`, `palette.primarySoft`, `palette.bgApp` pada tiga `<span>` titik warna:

```tsx
<span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: palette.primary }} />
<span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: palette.primarySoft }} />
<span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: palette.bgApp }} />
```

- [ ] **Step 5: Lint + build**

Run: `npm run lint; npm run build`
Expected: lulus.

- [ ] **Step 6: Commit**

```bash
git add src/components/AccountView.tsx
git commit -m "feat: toggle Terang/Gelap & kartu preset ikut mode di pengaturan tema"
```

---

### Task 4: Migrasi bulk class netral → token + kasus manual

**Files:**
- Modify: semua `*.tsx` di `src/components/**` + `src/App.tsx` (mekanis)
- Modify manual: `src/components/LoginView.tsx:290`, `src/components/workspace/TabOverview.tsx:1357`, `src/components/workspace/TabMoodboard.tsx:118,119`, `src/components/workspace/TabOverview.tsx` (bg-gray-800 tetap)

**Interfaces:**
- Consumes: token `--color-card-pink`, `--color-surface-muted`, `--color-gray-custom`, `--color-border-soft` (Task 1-2).

- [ ] **Step 1: Jalankan script migrasi mekanis**

Run dari root repo (PowerShell). PENTING urutan: varian opacity `bg-white/NN` didahulukan sebelum `bg-white` polos; sisanya bebas urut karena pola saling eksklusif.

```powershell
$files = Get-ChildItem -Recurse src -Include *.tsx
$repl = @(
  @('bg-white/(\d+)', 'bg-card-pink/$1'),      # bg-white/90 -> bg-card-pink/90, dll
  @('hover:bg-white', 'hover:bg-card-pink'),
  @('focus:bg-white', 'focus:bg-card-pink'),
  @('bg-white(?!/)', 'bg-card-pink'),          # bg-white polos (bukan /NN)
  @('bg-offwhite', 'bg-surface-muted'),
  @('bg-gray-50', 'bg-surface-muted'),
  @('bg-gray-100', 'bg-surface-muted'),
  @('bg-gray-200', 'bg-surface-muted'),
  @('bg-gray-300', 'bg-surface-muted'),
  @('text-gray-400', 'text-gray-custom/70'),
  @('text-gray-500', 'text-gray-custom'),
  @('text-gray-600', 'text-gray-custom'),
  @('text-gray-700', 'text-gray-custom'),
  @('border-gray-100', 'border-card-pink'),
  @('border-gray-200', 'border-card-pink'),
  @('border-gray-300', 'border-card-pink')
)
foreach($f in $files){
  $c = [System.IO.File]::ReadAllText($f.FullName)
  $orig = $c
  foreach($r in $repl){ $c = [regex]::Replace($c, $r[0], $r[1]) }
  if($c -ne $orig){ [System.IO.File]::WriteAllText($f.FullName, $c, (New-Object System.Text.UTF8Encoding $false)); Write-Output "updated $($f.Name)" }
}
```

Catatan: pola `bg-gray-NN` juga menimpa `hover:bg-gray-NN`/`focus:bg-gray-NN` via substring — otomatis jadi `hover:bg-surface-muted`. `bg-gray-800` TIDAK tersentuh (bukan pola).

- [ ] **Step 2: Kasus manual — `bg-dark`/`border-dark` (token terbalik di mode gelap)**

`src/components/LoginView.tsx:290` — ganti `bg-dark hover:bg-black` → `bg-primary-pink hover:bg-primary-pink/90`:

```tsx
className="w-full py-2 bg-primary-pink hover:bg-primary-pink/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
```

`src/components/workspace/TabOverview.tsx:1357` — ganti `bg-dark ... hover:bg-gray-800` → `bg-primary-pink ... hover:bg-primary-pink/90`:

```tsx
className="px-6 py-2.5 rounded-full bg-primary-pink hover:bg-primary-pink/90 text-white text-xs font-extrabold transition-all shadow-xs"
```

`src/components/workspace/TabMoodboard.tsx:118` — ganti `'bg-dark text-white border-dark'` → `'bg-gray-800 text-white border-gray-700'`.

`src/components/workspace/TabMoodboard.tsx:119` — ganti `hover:border-gray-400` → `hover:border-gray-custom` (turunan `--color-gray-custom` auto-generate utility `border-gray-custom`).

- [ ] **Step 3: Audit sisa class netral hardcode**

Run (harusnya hanya menyisakan yang diizinkan):

```powershell
$files = Get-ChildItem -Recurse src -Include *.tsx
Select-String -Path $files.FullName -Pattern 'bg-white(?!\d|/)|bg-gray-[0-9]+|text-gray-[0-9]+|border-gray-[0-9]+|bg-offwhite' | ForEach-Object { "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" }
```

Yang BOLEH tersisa: `bg-gray-800`, `hover:bg-gray-800` (TabOverview, tombol generate AI sekunder di container modal — cek, bila memang masih ada), `border-gray-700` (TabMoodboard locked), `bg-gray-700`/`text-gray-800` jika ada yang memang netral khusus. Semua `bg-white`/`bg-gray-[0-3]`/`text-gray-[4-7]`/`border-gray-[1-3]` HARUS habis. Bila masih ada yang bukan izin → perbaiki manual.

- [ ] **Step 4: Lint + build**

Run: `npm run lint; npm run build`
Expected: lulus. Jika ada error TS (mis. class tidak dikenal) — class itu token utility dari `@theme`, sudah ter-generate.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components
git commit -m "feat: migrasi class netral hardcode ke token tema (bg-card-pink, surface-muted, border-soft, gray-custom)"
```

---

### Task 5: Verifikasi akhir & push

- [ ] **Step 1: Verifikasi penuh**

Run: `npm run lint; npm run build` → keduanya lulus tanpa error.

- [ ] **Step 2: Audit manual (browser) — 5 preset × 2 mode**

Buka `npm run dev` (port 3000), cek dengan akun test (login Google):
- Dashboard: kartu putih → gelap di mode gelap; teks abu-abu ikut terang.
- Workspace semua tab (Overview, Moodboard, Itinerary, Budget, Bookings, Places, Transport, Packing, Notes).
- Modal CRUD tiap tab + CreateTripModal + PublicTemplatesModal + ProjectMediaPickerModal.
- ExportPdfModal dalam mode gelap: isi kartu gelap, tapi **Print/Cetak PDF tetap terang**.
- AccountView: toggle Terang/Gelap berfungsi; kartu preset berubah titik warnanya; reload → mode & preset tersimpan (localStorage/Supabase).
- LoginView tombol login pink.
- Mode gelap untuk tiap preset: rose, ocean, emerald, sunset, purple — pastikan kontras teks terbaca.

- [ ] **Step 3: Review diff & log**

Run: `git status` + `git log --oneline -8` → pastikan 4-5 task ter-commit rapi, working tree bersih.

- [ ] **Step 4: Push & cek deploy**

Run: `git push origin main` → tunggu auto-deploy Vercel. Verifikasi live via `npx vercel ls treker` (deploy baru Ready) dan `npx vercel inspect <url-deploy>` + build log menampilkan bundle baru. Cek `https://treker-rust.vercel.app` memuat aplikasi baru.

- [ ] **Step 5: Update memory**

Catat HEAD baru, fitur mode gelap per preset, token `--color-surface-muted`, dan komit-nya.