'use client';

import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'stock-theme';

type ThemeMode = 'light' | 'dark';

function resolveInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const initialTheme = resolveInitialTheme();
    document.documentElement.dataset.theme = initialTheme;
    setTheme(initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  }

  return (
    <button type="button" onClick={toggleTheme} className="theme-toggle rounded-full px-3 py-2 text-sm font-medium">
      <span>{theme === 'light' ? '深色模式' : '日間模式'}</span>
      <span className="theme-toggle-badge rounded-full px-2 py-1 text-xs font-semibold">{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
}