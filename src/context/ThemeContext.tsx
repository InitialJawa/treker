import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeColors, THEME_PRESETS, DEFAULT_THEME } from '../types/theme';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { isFirestoreQuotaExhausted, handleFirestoreError } from '../services/firestoreService';

interface ThemeContextType {
  presetId: string;
  colors: ThemeColors;
  setPreset: (id: string) => Promise<void>;
  updateColor: (key: keyof ThemeColors, value: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
  isSaving: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'treker_user_theme';

const applyColorsToDOM = (colors: ThemeColors) => {
  const root = document.documentElement;
  root.style.setProperty('--color-primary-pink', colors.primary);
  root.style.setProperty('--color-primary-gradient', colors.primary);
  root.style.setProperty('--color-soft-pink', colors.primarySoft);
  root.style.setProperty('--color-screen-pink', colors.bgApp);
  root.style.setProperty('--color-card-pink', colors.bgCard);
  root.style.setProperty('--color-dark', colors.textMain);
  root.style.setProperty('--color-gray-custom', colors.textMuted);
  root.style.setProperty('--color-selection', colors.selection || `${colors.primary}33`);
  root.style.setProperty('--color-selection-text', colors.selectionText || colors.primary);
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [presetId, setPresetId] = useState<string>('rose');
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_THEME);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 1. Initial load from LocalStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.colors) {
          setColors(parsed.colors);
          setPresetId(parsed.presetId || 'custom');
          applyColorsToDOM(parsed.colors);
        }
      } else {
        applyColorsToDOM(DEFAULT_THEME);
      }
    } catch (e) {
      console.warn('Failed to load theme from localStorage:', e);
      applyColorsToDOM(DEFAULT_THEME);
    }
  }, []);

  // 2. Load theme settings from Firestore when user changes
  useEffect(() => {
    if (!user) return;

    const fetchUserTheme = async () => {
      try {
        const userDocRef = doc(db, 'userSettings', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists() && docSnap.data().theme) {
          const userTheme = docSnap.data().theme;
          const mergedColors: ThemeColors = {
            ...DEFAULT_THEME,
            ...(userTheme.colors || {})
          };
          const loadedPreset = userTheme.presetId || 'custom';

          setColors(mergedColors);
          setPresetId(loadedPreset);
          applyColorsToDOM(mergedColors);

          // Update cache
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
            presetId: loadedPreset,
            colors: mergedColors
          }));
        }
      } catch (error) {
        console.warn('Notice fetching user theme settings from Firestore:', error);
      }
    };

    fetchUserTheme();
  }, [user]);

  // Save helper to Firestore + LocalStorage
  const saveThemeSettings = async (newPresetId: string, newColors: ThemeColors) => {
    setIsSaving(true);
    setColors(newColors);
    setPresetId(newPresetId);
    applyColorsToDOM(newColors);

    // Save to LocalStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        presetId: newPresetId,
        colors: newColors
      }));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }

    // Save to Firestore if logged in and quota is available
    if (user && !isFirestoreQuotaExhausted()) {
      try {
        const userDocRef = doc(db, 'userSettings', user.uid);
        await setDoc(userDocRef, {
          updatedAt: new Date().toISOString(),
          userEmail: user.email,
          userId: user.uid,
          theme: {
            presetId: newPresetId,
            colors: newColors
          }
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, 'saveThemeSettings');
      }
    }

    setIsSaving(false);
  };

  const setPreset = async (id: string) => {
    const foundPreset = THEME_PRESETS.find(p => p.id === id);
    if (foundPreset) {
      await saveThemeSettings(id, foundPreset.colors);
    }
  };

  const updateColor = async (key: keyof ThemeColors, value: string) => {
    const updatedColors = {
      ...colors,
      [key]: value,
      // Automatically derive selection colors if primary is changed
      ...(key === 'primary' ? {
        selection: `${value}33`,
        selectionText: value
      } : {})
    };
    await saveThemeSettings('custom', updatedColors);
  };

  const resetToDefault = async () => {
    await saveThemeSettings('rose', DEFAULT_THEME);
  };

  return (
    <ThemeContext.Provider
      value={{
        presetId,
        colors,
        setPreset,
        updateColor,
        resetToDefault,
        isSaving
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
