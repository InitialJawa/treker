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