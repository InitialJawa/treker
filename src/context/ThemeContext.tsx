import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeColors, ThemeMode, THEME_PRESETS, DEFAULT_THEME, DEFAULT_DARK_THEME } from '../types/theme';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';

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

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'treker_user_theme';

const getPalette = (presetId: string, mode: ThemeMode): ThemeColors => {
  const preset = THEME_PRESETS.find((p) => p.id === presetId);
  if (!preset) return mode === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_THEME;
  return mode === 'dark' ? preset.darkColors : preset.colors;
};

const resolveMode = (storedMode: unknown): ThemeMode => (storedMode === 'dark' ? 'dark' : 'light');
const resolvePreset = (storedPreset: unknown): string =>
  storedPreset === 'dark' ? 'rose' : typeof storedPreset === 'string' ? storedPreset : 'custom';

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

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [presetId, setPresetId] = useState<string>('rose');
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_THEME);
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 1. Initial load from LocalStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.colors) {
          const loadedMode = resolveMode(parsed.mode);
          const loadedPreset = resolvePreset(parsed.presetId);
          const mergedColors: ThemeColors = {
            ...getPalette(loadedPreset, loadedMode),
            ...(parsed.colors || {}),
          };
          setModeState(loadedMode);
          setPresetId(loadedPreset);
          setColors(mergedColors);
          applyColorsToDOM(mergedColors);
        }
      } else {
        applyColorsToDOM(DEFAULT_THEME);
      }
    } catch (e) {
      console.warn('Failed to load theme from localStorage:', e);
      applyColorsToDOM(DEFAULT_THEME);
    }
  }, []);

  // 2. Load theme settings from Supabase when user changes
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;

    const fetchUserTheme = async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('theme')
          .eq('user_id', user.uid)
          .single();

        if (!error && data?.theme) {
          const userTheme = data.theme;
          const loadedMode = resolveMode(userTheme.mode);
          const loadedPreset = resolvePreset(userTheme.presetId);
          const mergedColors: ThemeColors = {
            ...getPalette(loadedPreset, loadedMode),
            ...(userTheme.colors || {}),
          };

          setModeState(loadedMode);
          setPresetId(loadedPreset);
          setColors(mergedColors);
          applyColorsToDOM(mergedColors);

          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
            presetId: loadedPreset,
            mode: loadedMode,
            colors: mergedColors,
          }));
        }
      } catch (error) {
        console.warn('Notice fetching user theme settings from Supabase:', error);
      }
    };

    fetchUserTheme();
  }, [user]);

  // Save helper to Supabase + LocalStorage
  const saveThemeSettings = async (newPresetId: string, newMode: ThemeMode, newColors: ThemeColors) => {
    setIsSaving(true);
    setColors(newColors);
    setPresetId(newPresetId);
    setModeState(newMode);
    applyColorsToDOM(newColors);

    // Save to LocalStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        presetId: newPresetId,
        mode: newMode,
        colors: newColors,
      }));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }

    // Save to Supabase if logged in & configured
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
      } : {})
    };
    await saveThemeSettings('custom', mode, updatedColors);
  };

  const resetToDefault = async () => {
    await saveThemeSettings('rose', 'light', DEFAULT_THEME);
  };

  return (
    <ThemeContext.Provider
      value={{
        presetId,
        mode,
        colors,
        setPreset,
        setMode,
        updateColor,
        resetToDefault,
        isSaving,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
