export interface ThemeColors {
  primary: string;         // E.g., #E11D48
  primarySoft: string;     // E.g., #FFF1F2
  bgApp: string;           // E.g., #F7F8FA
  bgCard: string;          // E.g., #FFFFFF
  textMain: string;        // E.g., #20263D
  textMuted: string;       // E.g., #64748B
  selection: string;       // E.g., rgba(225, 29, 72, 0.2)
  selectionText: string;   // E.g., #E11D48
}

export interface ThemePreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  colors: ThemeColors;
}

export const DEFAULT_THEME: ThemeColors = {
  primary: '#E11D48',
  primarySoft: '#FFF1F2',
  bgApp: '#F7F8FA',
  bgCard: '#FFFFFF',
  textMain: '#20263D',
  textMuted: '#64748B',
  selection: '#E11D4833',
  selectionText: '#E11D48',
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'rose',
    name: 'Rose Pink (Default)',
    icon: '🌹',
    description: 'Tampilan klasik yang elegan dan cerah',
    colors: DEFAULT_THEME,
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    icon: '🌊',
    description: 'Warna biru laut yang tenang dan fresh',
    colors: {
      primary: '#0284C7',
      primarySoft: '#F0F9FF',
      bgApp: '#F8FAFC',
      bgCard: '#FFFFFF',
      textMain: '#0F172A',
      textMuted: '#64748B',
      selection: '#0284C733',
      selectionText: '#0284C7',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    icon: '🌿',
    description: 'Hijau tropis bernuansa alam',
    colors: {
      primary: '#059669',
      primarySoft: '#ECFDF5',
      bgApp: '#F4FBF7',
      bgCard: '#FFFFFF',
      textMain: '#064E3B',
      textMuted: '#475569',
      selection: '#05966933',
      selectionText: '#059669',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Amber',
    icon: '🌅',
    description: 'Kehangatan warna senja dan jingga',
    colors: {
      primary: '#D97706',
      primarySoft: '#FFFBEB',
      bgApp: '#FAFAF9',
      bgCard: '#FFFFFF',
      textMain: '#292524',
      textMuted: '#78716C',
      selection: '#D9770633',
      selectionText: '#D97706',
    },
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    icon: '🔮',
    description: 'Ungu mewah bernuansa modern',
    colors: {
      primary: '#7C3AED',
      primarySoft: '#F5F3FF',
      bgApp: '#FAF5FF',
      bgCard: '#FFFFFF',
      textMain: '#1E1B4B',
      textMuted: '#6B7280',
      selection: '#7C3AED33',
      selectionText: '#7C3AED',
    },
  },
  {
    id: 'dark',
    name: 'Midnight Dark',
    icon: '🌙',
    description: 'Tema gelap yang nyaman di mata',
    colors: {
      primary: '#38BDF8',
      primarySoft: '#1E293B',
      bgApp: '#0F172A',
      bgCard: '#1E293B',
      textMain: '#F8FAFC',
      textMuted: '#94A3B8',
      selection: '#38BDF844',
      selectionText: '#38BDF8',
    },
  },
];
