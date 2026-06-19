'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getSettings, updateSettings } from '@/lib/db';

interface ThemeVars {
  '--bg-base': string;
  '--bg-surface': string;
  '--bg-raised': string;
  '--bg-hover': string;
  '--text-primary': string;
  '--text-secondary': string;
  '--text-placeholder': string;
  '--accent-blue': string;
  '--accent-green': string;
  '--accent-red': string;
  '--accent-yellow': string;
  '--accent-purple': string;
}

function hexToRgb(hex: string): string {
  const v = parseInt(hex.slice(1), 16);
  return `${(v >> 16) & 255} ${(v >> 8) & 255} ${v & 255}`;
}

const themeConfigs: Record<string, ThemeVars> = {
  ocean: {
    '--bg-base': hexToRgb('#0d0f14'),
    '--bg-surface': hexToRgb('#13161d'),
    '--bg-raised': hexToRgb('#1a1e28'),
    '--bg-hover': hexToRgb('#222736'),
    '--text-primary': hexToRgb('#f0f2f7'),
    '--text-secondary': hexToRgb('#9aa0b4'),
    '--text-placeholder': hexToRgb('#5c6278'),
    '--accent-blue': hexToRgb('#6c8fff'),
    '--accent-green': hexToRgb('#3ecf8e'),
    '--accent-red': hexToRgb('#f87171'),
    '--accent-yellow': hexToRgb('#fbbf24'),
    '--accent-purple': hexToRgb('#a78bfa'),
  },
  solar: {
    '--bg-base': hexToRgb('#1a0a00'),
    '--bg-surface': hexToRgb('#221205'),
    '--bg-raised': hexToRgb('#2e1a0a'),
    '--bg-hover': hexToRgb('#3d2612'),
    '--text-primary': hexToRgb('#fef3c7'),
    '--text-secondary': hexToRgb('#d4a574'),
    '--text-placeholder': hexToRgb('#8a6a3c'),
    '--accent-blue': hexToRgb('#fbbf24'),
    '--accent-green': hexToRgb('#f87171'),
    '--accent-red': hexToRgb('#fb923c'),
    '--accent-yellow': hexToRgb('#fbbf24'),
    '--accent-purple': hexToRgb('#fbbf24'),
  },
  amethyst: {
    '--bg-base': hexToRgb('#0a0514'),
    '--bg-surface': hexToRgb('#100a1e'),
    '--bg-raised': hexToRgb('#1a122e'),
    '--bg-hover': hexToRgb('#261a3e'),
    '--text-primary': hexToRgb('#f0eef7'),
    '--text-secondary': hexToRgb('#b8a8d4'),
    '--text-placeholder': hexToRgb('#7a6a94'),
    '--accent-blue': hexToRgb('#a78bfa'),
    '--accent-green': hexToRgb('#c084fc'),
    '--accent-red': hexToRgb('#e879f9'),
    '--accent-yellow': hexToRgb('#a78bfa'),
    '--accent-purple': hexToRgb('#c084fc'),
  },
  emerald: {
    '--bg-base': hexToRgb('#021a0f'),
    '--bg-surface': hexToRgb('#052314'),
    '--bg-raised': hexToRgb('#0a2e1b'),
    '--bg-hover': hexToRgb('#123d26'),
    '--text-primary': hexToRgb('#e6f7ee'),
    '--text-secondary': hexToRgb('#8ac4a4'),
    '--text-placeholder': hexToRgb('#4a7a5c'),
    '--accent-blue': hexToRgb('#3ecf8e'),
    '--accent-green': hexToRgb('#6ee7b7'),
    '--accent-red': hexToRgb('#34d399'),
    '--accent-yellow': hexToRgb('#3ecf8e'),
    '--accent-purple': hexToRgb('#6ee7b7'),
  },
};

const THEME_CACHE_KEY = 'todo-theme-id';

function getCachedTheme(): string {
  if (typeof window === 'undefined') return 'ocean';
  try {
    return localStorage.getItem(THEME_CACHE_KEY) || 'ocean';
  } catch {
    return 'ocean';
  }
}

function setCachedTheme(id: string) {
  try {
    localStorage.setItem(THEME_CACHE_KEY, id);
  } catch {}
}

function applyThemeVars(themeId: string) {
  const vars = themeConfigs[themeId] || themeConfigs.ocean;
  const root = document.documentElement;
  for (const [key, val] of Object.entries(vars)) {
    root.style.setProperty(key, val);
  }
}

interface ThemeContextType {
  themeId: string;
  setTheme: (id: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState('ocean');
  const { user } = useAuth();

  // Load theme on mount: localStorage immediately, then server
  useEffect(() => {
    const cached = getCachedTheme();
    setThemeId(cached);
    applyThemeVars(cached);
  }, []);

  // Fetch from server once user is available
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const s = await getSettings(user.csrfToken);
        const serverTheme = s.selected_theme || 'ocean';
        setThemeId(serverTheme);
        setCachedTheme(serverTheme);
        applyThemeVars(serverTheme);
      } catch {
        // local cache already applied
      }
    })();
  }, [user]);

  const setTheme = useCallback(async (id: string) => {
    setThemeId(id);
    setCachedTheme(id);
    applyThemeVars(id);
    if (user) {
      try {
        await updateSettings({ selected_theme: id }, user.csrfToken);
      } catch {}
    }
  }, [user]);

  return (
    <ThemeContext.Provider value={{ themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
