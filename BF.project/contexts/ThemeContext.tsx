import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  background: string;
  window: string;
  text: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  colors: ThemeColors;
}

export const themePresets: ThemePreset[] = [
  {
    id: 'default',
    name: 'Default Dark',
    colors: {
      background: '#0c0c0c',
      window: '#1a1a1a',
      text: '#fbfbfb',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    colors: {
      background: '#0a0e1a',
      window: '#141b2d',
      text: '#e6e9f0',
    },
  },
  {
    id: 'forest',
    name: 'Deep Forest',
    colors: {
      background: '#0a1410',
      window: '#162820',
      text: '#e8f4ee',
    },
  },
  {
    id: 'crimson',
    name: 'Crimson Night',
    colors: {
      background: '#14080a',
      window: '#250d12',
      text: '#fde9ec',
    },
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    colors: {
      background: '#051923',
      window: '#0a2a3d',
      text: '#e0f2ff',
    },
  },
];

const THEME_STORAGE_KEY = '@theme_colors';
const CUSTOM_THEMES_STORAGE_KEY = '@custom_themes';

const defaultThemeColors = themePresets[0].colors;

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [currentColors, setCurrentColors] = useState<ThemeColors>(defaultThemeColors);
  const [customThemes, setCustomThemes] = useState<ThemePreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const [savedColors, savedCustomThemes] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(CUSTOM_THEMES_STORAGE_KEY),
      ]);

      if (savedColors) {
        setCurrentColors(JSON.parse(savedColors));
      }

      if (savedCustomThemes) {
        setCustomThemes(JSON.parse(savedCustomThemes));
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = useCallback(async (colors: ThemeColors) => {
    try {
      setCurrentColors(colors);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(colors));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  const addCustomTheme = useCallback(async (name: string, colors: ThemeColors) => {
    try {
      const newTheme: ThemePreset = {
        id: `custom_${Date.now()}`,
        name,
        colors,
      };

      setCustomThemes((prev) => {
        const updated = [...prev, newTheme];
        AsyncStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      
      return newTheme;
    } catch (error) {
      console.error('Error adding custom theme:', error);
      return null;
    }
  }, []);

  const deleteCustomTheme = useCallback(async (themeId: string) => {
    try {
      setCustomThemes((prev) => {
        const updated = prev.filter(theme => theme.id !== themeId);
        AsyncStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error deleting custom theme:', error);
    }
  }, []);

  const allThemes = useMemo(() => [...themePresets, ...customThemes], [customThemes]);

  return useMemo(() => ({
    colors: currentColors,
    setTheme,
    addCustomTheme,
    deleteCustomTheme,
    allThemes,
    customThemes,
    isLoading,
  }), [currentColors, setTheme, addCustomTheme, deleteCustomTheme, allThemes, customThemes, isLoading]);
});