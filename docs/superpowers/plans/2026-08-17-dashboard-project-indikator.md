# Dashboard Project + Indikator Jenis Project — Implementation Plan

> **Untuk agentic workers:** REQUIRED SUB-SKILL: gunakan superpowers:executing-plans untuk implementasi plan ini task per task. Steps memakai checkbox (`- [ ]`).

**Goal:** Menambah halaman Dashboard/Home (halaman awal setelah login) berisi grid project yang dikelompokkan per seksi, dengan kartu yang menampilkan badge jenis project (Pribadi/Shared/Template), status read-only, jumlah kolaborator, status waktu, dan tombol favorit; logika badge dipusatkan agar konsisten di dashboard, dropdown TopNav, dan hero banner workspace.

**Architecture:** Helper murni `tripBadges.ts` menjadi satu sumber kebenaran penentuan badge. `TripCard.tsx` = kartu presentasional yang dipakai `DashboardView.tsx`. `App.tsx` merutekan view Dashboard sebagai default. `TopNav` dan `TripWorkspaceView` memakai helper yang sama.

**Tech Stack:** React 19, TypeScript, Tailwind 4, lucide-react.

## Global Constraints

- Bahasa UI: Indonesia (kecuali label yang memang sudah English di codebase, mis. "Template", "Shared").
- Tidak ada perubahan schema Supabase. Semua data dari state `TripContext` yang sudah ada.
- Status waktu dihitung dari `startDate`/`endDate`, TIDAK memakai field `status` (sering basi).
- Verifikasi per task: `npm run lint` (tsc --noEmit) + `npm run build`.
- Repo pakai npm (bukan bun). Jangan sentuh bun.lock.

---

### Task 1: Helper badge `src/utils/tripBadges.ts`

**Files:**
- Create: `src/utils/tripBadges.ts`

**Interfaces:**
- Produces (dipakai Task 2–6):
  - `type TripType = 'pribadi' | 'shared' | 'template'`
  - `type TripTimeStatus = 'upcoming' | 'current' | 'past'`
  - `interface TripUserLike { uid?: string; email?: string | null }`
  - `getTripType(trip: Trip, user: TripUserLike | null): TripType`
  - `isTemplateReadOnly(trip: Trip, user: TripUserLike | null): boolean`
  - `getTripTimeStatus(trip: Trip): TripTimeStatus`
  - `getTripStatusLabel(status: TripTimeStatus): string`
  - `interface TripBadgeData { type: TripType; label: string; textClass: string; bgClass: string }`
  - `getBadgeData(trip: Trip, user: TripUserLike | null): TripBadgeData`

- [ ] **Step 1: Buat file helper**

```ts
import { Trip } from '../types/travel';

export type TripType = 'pribadi' | 'shared' | 'template';
export type TripTimeStatus = 'upcoming' | 'current' | 'past';

export interface TripUserLike {
  uid?: string;
  email?: string | null;
}

export function getTripType(trip: Trip, user: TripUserLike | null): TripType {
  const isOwned = !trip.userId || (user && trip.userId === user.uid);
  if (trip.isTemplate) return 'template';
  if (isOwned) return 'pribadi';
  return 'shared';
}

export function isTemplateReadOnly(trip: Trip, user: TripUserLike | null): boolean {
  const isOwner = !!user && trip.userId === user.uid;
  const isCollaborator = (trip.collaborators || []).includes(user?.email || '');
  return !isOwner && !isCollaborator && trip.isTemplate;
}

export function getTripTimeStatus(trip: Trip): TripTimeStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = trip.startDate ? new Date(`${trip.startDate}T00:00:00`) : null;
  const end = trip.endDate ? new Date(`${trip.endDate}T00:00:00`) : null;
  if (!start) return 'upcoming';
  if (end && end.getTime() < today.getTime()) return 'past';
  if (start.getTime() > today.getTime()) return 'upcoming';
  return 'current';
}

export function getTripStatusLabel(status: TripTimeStatus): string {
  if (status === 'current') return 'Sedang Berlangsung';
  if (status === 'past') return 'Selesai';
  return 'Akan Datang';
}

export interface TripBadgeData {
  type: TripType;
  label: string;
  textClass: string;
  bgClass: string;
}

export function getBadgeData(trip: Trip, user: TripUserLike | null): TripBadgeData {
  const type = getTripType(trip, user);
  if (type === 'template') {
    return { type, label: 'Template', textClass: 'text-amber-700', bgClass: 'bg-amber-100 border-amber-200' };
  }
  if (type === 'shared') {
    return { type, label: 'Shared', textClass: 'text-purple-700', bgClass: 'bg-purple-100 border-purple-200' };
  }
  return { type, label: 'Pribadi', textClass: 'text-primary-pink', bgClass: 'bg-soft-pink border-primary-pink/20' };
}
```

- [ ] **Step 2: Verifikasi typecheck**

Run: `npm run lint`
Expected: exit 0, tidak ada error.

- [ ] **Step 3: Commit**

```bash
git add src/utils/tripBadges.ts
git commit -m "feat: helper badge jenis project (pribadi/shared/template) & status waktu"
```

---

### Task 2: Komponen kartu `src/components/TripCard.tsx`

**Files:**
- Create: `src/components/TripCard.tsx`

**Interfaces:**
- Consumes: `getBadgeData`, `getTripTimeStatus`, `getTripStatusLabel`, `isTemplateReadOnly`, `TripUserLike` dari `../utils/tripBadges`; `formatDateRange` dari `../utils/formatters`; `Trip` dari `../types/travel`.
- Produces (dipakai Task 3):
  - `interface TripCardProps { trip: Trip; user: TripUserLike | null; onOpen: (tripId: string) => void; onToggleFavorite: (tripId: string) => void; }`
  - `export const TripCard: React.FC<TripCardProps>`

- [ ] **Step 1: Buat komponen kartu**

```tsx
import React from 'react';
import { MapPin, Calendar, Users, Lock, Heart, Copy } from 'lucide-react';
import { Trip } from '../types/travel';
import { getBadgeData, getTripTimeStatus, getTripStatusLabel, isTemplateReadOnly, TripUserLike } from '../utils/tripBadges';
import { formatDateRange } from '../utils/formatters';

interface TripCardProps {
  trip: Trip;
  user: TripUserLike | null;
  onOpen: (tripId: string) => void;
  onToggleFavorite: (tripId: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, user, onOpen, onToggleFavorite }) => {
  const badge = getBadgeData(trip, user);
  const status = getTripTimeStatus(trip);
  const readOnly = isTemplateReadOnly(trip, user);
  const collabCount = trip.collaborators?.length || 0;

  return (
    <div
      onClick={() => onOpen(trip.id)}
      className="group bg-white rounded-3xl border border-card-pink overflow-hidden shadow-sm hover:shadow-lg hover:border-primary-pink transition-all cursor-pointer active:scale-[0.99] flex flex-col"
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={trip.coverImage}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bgClass} ${badge.textClass}`}>
            {badge.label}
          </span>
          {readOnly && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold">
              <Lock className="w-3 h-3" /> Hanya Bisa Dikopi
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(trip.id); }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 shadow-sm transition-all hover:scale-110 active:scale-95 ${trip.isFavorite ? 'text-primary-pink' : 'text-gray-400 hover:text-primary-pink'}`}
          title="Sukai project ini"
        >
          <Heart className={`w-4 h-4 ${trip.isFavorite ? 'fill-primary-pink' : ''}`} />
        </button>
      </div>

      <div className="p-3.5 flex-1 flex flex-col gap-1.5">
        <h3 className="font-extrabold text-sm text-dark leading-snug line-clamp-2">{trip.name}</h3>
        <p className="text-[11px] text-gray-custom flex items-center gap-1">
          <MapPin className="w-3 h-3 text-primary-pink shrink-0" />
          <span className="truncate">{trip.destination}</span>
        </p>
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <Calendar className="w-3 h-3 shrink-0" />
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-gray-500">
            {status === 'current' && <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">{getTripStatusLabel(status)}</span>}
            {status === 'upcoming' && <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">{getTripStatusLabel(status)}</span>}
            {status === 'past' && <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">{getTripStatusLabel(status)}</span>}
          </span>
          <div className="flex items-center gap-1.5">
            {collabCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                <Users className="w-3 h-3" /> {collabCount}
              </span>
            )}
            {trip.isTemplate && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                <Copy className="w-3 h-3" /> Kopi
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verifikasi typecheck + build**

Run: `npm run lint; npm run build`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/TripCard.tsx
git commit -m "feat: komponen kartu project dengan badge jenis, read-only, status waktu & favorit"
```

---

### Task 3: Halaman `src/components/DashboardView.tsx`

**Files:**
- Create: `src/components/DashboardView.tsx`

**Interfaces:**
- Consumes: `TripCard` (Task 2), `useAuth` dari `../context/AuthContext`, `useTripContext` dari `../context/TripContext`, `INITIAL_TRIPS` dari `../data/mockData`, `Trip` dari `../types/travel`.
- Produces (dipakai Task 4):
  - `interface DashboardViewProps { onSelectTrip: (tripId: string) => void; onCreateTrip: () => void; onOpenTemplates: () => void; }`
  - `export const DashboardView: React.FC<DashboardViewProps>`

- [ ] **Step 1: Buat halaman dashboard**

```tsx
import React from 'react';
import { FolderKanban, Users, BookOpen, PlusCircle, Compass } from 'lucide-react';
import { TripCard } from './TripCard';
import { useAuth } from '../context/AuthContext';
import { useTripContext } from '../context/TripContext';
import { INITIAL_TRIPS } from '../data/mockData';
import { Trip } from '../types/travel';
import { AppUser } from '../services/supabase';

interface DashboardViewProps {
  onSelectTrip: (tripId: string) => void;
  onCreateTrip: () => void;
  onOpenTemplates: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectTrip, onCreateTrip, onOpenTemplates }) => {
  const { user } = useAuth();
  const { trips, toggleTripFavorite } = useTripContext();

  const myTrips = trips.filter(t => !t.userId || (user && t.userId === user.uid));
  const sharedTrips = trips.filter(t => user && t.userId && t.userId !== user.uid);
  const publicTemplates = INITIAL_TRIPS.filter(t => t.isTemplate && !trips.some(tr => tr.id === t.id));

  const renderSection = (
    icon: React.ReactNode,
    title: string,
    colorClass: string,
    list: Trip[]
  ) => {
    if (list.length === 0) return null;
    return (
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-xl ${colorClass}`}>{icon}</span>
          <h2 className="text-sm font-extrabold text-dark">{title}</h2>
          <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{list.length}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              user={user}
              onOpen={onSelectTrip}
              onToggleFavorite={toggleTripFavorite}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-dark">Dashboard Project</h1>
          <p className="text-xs text-gray-custom mt-1">Kelola semua project perjalananmu dalam satu tempat.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTemplates}
            className="bg-white border border-gray-200 hover:border-primary-pink text-primary-pink px-3 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <BookOpen className="w-4 h-4" /> Template Publik
          </button>
          <button
            onClick={onCreateTrip}
            className="bg-primary-pink hover:bg-opacity-90 text-white px-3 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Buat Project
          </button>
        </div>
      </div>

      {myTrips.length === 0 && sharedTrips.length === 0 && publicTemplates.length === 0 && (
        <div className="bg-white rounded-3xl border border-card-pink p-12 text-center shadow-sm">
          <Compass className="w-12 h-12 text-soft-pink mx-auto mb-3" />
          <h3 className="font-bold text-sm md:text-base text-dark">Belum ada project</h3>
          <p className="text-xs text-gray-custom mt-1 mb-4">Buat project baru atau gunakan template publik untuk memulai.</p>
          <button
            onClick={onCreateTrip}
            className="bg-primary-pink hover:bg-opacity-90 text-white px-4 py-2.5 rounded-full font-bold text-xs inline-flex items-center gap-2 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Buat Project Baru
          </button>
        </div>
      )}

      {renderSection(
        <FolderKanban className="w-4 h-4 text-primary-pink" />,
        'Project Saya',
        'bg-soft-pink text-primary-pink',
        myTrips
      )}

      {renderSection(
        <Users className="w-4 h-4 text-purple-600" />,
        'Di-share dengan Saya',
        'bg-purple-100 text-purple-700',
        sharedTrips
      )}

      {renderSection(
        <BookOpen className="w-4 h-4 text-amber-600" />,
        'Template Publik',
        'bg-amber-100 text-amber-700',
        publicTemplates
      )}
    </div>
  );
};
```

- [ ] **Step 2: Verifikasi typecheck + build**

Run: `npm run lint; npm run build`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/DashboardView.tsx
git commit -m "feat: halaman dashboard dengan grid project per seksi (saya/shared/template)"
```

---

### Task 4: Routing dashboard di `src/App.tsx`

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `DashboardView` (Task 3); `handleSelectTrip`, `setIsCreateModalOpen`, `setIsPublicTemplatesModalOpen` yang sudah ada.
- Produces: view `'Dashboard'` sebagai default; tombol nav "Home" mengarah ke Dashboard.

- [ ] **Step 1: Ubah default view & render Dashboard**

Di `src/App.tsx`:

```tsx
const [currentView, setCurrentView] = useState<string>('Dashboard');
```

Tambahkan import:

```tsx
import { DashboardView } from './components/DashboardView';
```

Tambahkan blok render di dalam `<main>` (sebelum blok `currentView === 'Workspace'`):

```tsx
{currentView === 'Dashboard' && (
  <div className="p-4 md:p-8">
    <DashboardView
      onSelectTrip={handleSelectTrip}
      onCreateTrip={() => setIsCreateModalOpen(true)}
      onOpenTemplates={() => setIsPublicTemplatesModalOpen(true)}
    />
  </div>
)}
```

- [ ] **Step 2: Verifikasi typecheck + build**

Run: `npm run lint; npm run build`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: dashboard jadi halaman default & routing view"
```

---

### Task 5: Konsistensi badge di `src/components/TopNav.tsx`

**Files:**
- Modify: `src/components/TopNav.tsx`

**Interfaces:**
- Consumes: `getBadgeData`, `isTemplateReadOnly`, `TripUserLike` dari `../utils/tripBadges`; `AppUser` dari `../services/supabase` (atau cukup pakai `user` yang sudah ada — struktur `{uid, email}` kompatibel dengan `TripUserLike`).
- Produces: dropdown tetap, badge memakai helper; tombol "Katalog Template Publik" dihapus; nav "Home" ditambahkan (label 'Home', ikon `Home` dari lucide).

- [ ] **Step 1: Ganti hardcode badge di list item**

Di `src/components/TopNav.tsx`:

```tsx
import { getBadgeData, isTemplateReadOnly } from '../utils/tripBadges';
```

Ganti blok badge pada item "Project Saya" (yang sekarang menampilkan `trip.isTemplate && (...Template badge)`) menjadi:

```tsx
<div className="flex items-center gap-1.5">
  <span className={`text-xs font-extrabold truncate ${activeTripId === trip.id ? 'text-primary-pink' : 'text-dark group-hover:text-primary-pink'}`}>
    {trip.name}
  </span>
  {getBadgeData(trip, user).type !== 'pribadi' && (
    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md shrink-0 border ${getBadgeData(trip, user).bgClass} ${getBadgeData(trip, user).textClass}`}>
      {getBadgeData(trip, user).label}
    </span>
  )}
  {isTemplateReadOnly(trip, user) && (
    <Lock className="w-3 h-3 text-amber-600 shrink-0" />
  )}
</div>
```

Tambahkan `Lock` ke import lucide-react.

Ganti blok badge pada item "Di-share dengan Saya" (yang sekarang `Shared` hardcode) menjadi:

```tsx
{getBadgeData(trip, user).type === 'shared' && (
  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md shrink-0 border ${getBadgeData(trip, user).bgClass} ${getBadgeData(trip, user).textClass}`}>
    {getBadgeData(trip, user).label}
  </span>
)}
```

Ganti chip pada header active trip (yang sekarang `Shared` hardcode di baris ~71-75) menjadi:

```tsx
{activeTrip && getBadgeData(activeTrip, user).type !== 'pribadi' && (
  <span className={`${getBadgeData(activeTrip, user).bgClass} ${getBadgeData(activeTrip, user).textClass} text-[9px] font-extrabold px-1.5 py-0.2 rounded-md shrink-0 flex items-center gap-0.5`}>
    {getBadgeData(activeTrip, user).type === 'shared' ? <Users className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
    {getBadgeData(activeTrip, user).label}
  </span>
)}
```

- [ ] **Step 2: Hapus tombol "Katalog Template Publik" & tambah nav Home**

Hapus blok `{openPublicTemplatesModal && (...)}` di bagian bawah dropdown, dan hapus prop `openPublicTemplatesModal` dari interface + destructuring (serta dari pemanggilan di `App.tsx`).

Ubah array nav di baris ~195-198 menjadi:

```tsx
{[
  { id: 'Dashboard', label: 'Home', icon: Home },
  { id: 'Workspace', label: 'Tracker', icon: Compass },
  { id: 'Account', label: 'Account & Settings', icon: Settings }
].map(nav => (
```

Tambahkan `Home` ke import lucide-react.

- [ ] **Step 3: Sesuaikan pemanggilan TopNav di App.tsx**

Di `src/App.tsx`, hapus prop `openPublicTemplatesModal` dari elemen `<TopNav ... />`.

- [ ] **Step 4: Verifikasi typecheck + build**

Run: `npm run lint; npm run build`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/TopNav.tsx src/App.tsx
git commit -m "feat: badge konsisten di dropdown TopNav, hapus tombol template katalog, tambah nav Home"
```

---

### Task 6: Badge di hero banner `src/components/TripWorkspaceView.tsx`

**Files:**
- Modify: `src/components/TripWorkspaceView.tsx`

**Interfaces:**
- Consumes: `getBadgeData`, `getTripTimeStatus`, `getTripStatusLabel`, `isTemplateReadOnly` dari `../utils/tripBadges`; `Lock` dari lucide-react (tambahkan ke import yang sudah ada).
- Produces: hero banner menampilkan badge jenis + indikator read-only + chip status waktu.

- [ ] **Step 1: Tambah import helper**

```tsx
import { getBadgeData, getTripTimeStatus, getTripStatusLabel, isTemplateReadOnly } from '../utils/tripBadges';
```

Tambahkan `Lock` ke import `lucide-react` (baris 2).

- [ ] **Step 2: Render badge di hero banner**

Di dalam blok `.absolute.bottom-6.left-6.right-6.text-white.space-y-2` (sekitar baris 387), sebelum `<h1>`, tambahkan:

```tsx
<div className="flex items-center gap-2 flex-wrap">
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getBadgeData(trip, user).bgClass} ${getBadgeData(trip, user).textClass}`}>
    {getBadgeData(trip, user).type === 'shared' ? <Users className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
    {getBadgeData(trip, user).label}
  </span>
  {isTemplateReadOnly(trip, user) && (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold">
      <Lock className="w-3 h-3" /> Hanya Bisa Dikopi
    </span>
  )}
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold backdrop-blur-sm">
    {getTripStatusLabel(getTripTimeStatus(trip))}
  </span>
</div>
```

- [ ] **Step 3: Verifikasi typecheck + build**

Run: `npm run lint; npm run build`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/TripWorkspaceView.tsx
git commit -m "feat: badge jenis project, indikator read-only & status waktu di hero banner workspace"
```

---

### Task 7: Verifikasi akhir, push, dan auto-deploy

**Files:**
- None (hanya verifikasi + git).

- [ ] **Step 1: Verifikasi penuh**

Run: `npm run lint; npm run build`
Expected: keduanya exit 0 tanpa error.

- [ ] **Step 2: Cek status & push**

```bash
git status --short
git log --oneline -8
git push origin main
```

Expected: push sukses (`main -> main`), memicu auto-deploy Vercel.

- [ ] **Step 3: Verifikasi live setelah deploy (beberapa menit)**

Fetch https://treker-rust.vercel.app dan pastikan bundle JS mengandung teks `Dashboard Project` (penanda dashboard baru sudah live).

```bash
$site = (Invoke-WebRequest -Uri 'https://treker-rust.vercel.app' -UseBasicParsing).Content
$m = [regex]::Match($site, 'src="(/assets/[^"]+\.js)"')
if ($m.Success) { $bundle = (Invoke-WebRequest -Uri ('https://treker-rust.vercel.app' + $m.Groups[1].Value) -UseBasicParsing).Content; if ($bundle -match 'Dashboard Project') { 'DASHBOARD LIVE' } else { 'BELUM LIVE' } } else { 'JS TIDAK DITEMUKAN' }
```