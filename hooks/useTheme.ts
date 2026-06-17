'use client';

import { useEffect } from 'react';

// Light mode only — strips any stale 'dark' class left from older builds
export function useTheme() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('sunside-theme');
  }, []);

  return { theme: 'light' as const, toggleTheme: () => {} };
}
