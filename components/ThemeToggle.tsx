'use client';

import * as React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={cn(
        'relative w-9 h-9 rounded-full flex items-center justify-center',
        'border border-slate-200 dark:border-slate-700',
        'bg-white dark:bg-slate-800',
        'hover:bg-slate-50 dark:hover:bg-slate-700',
        'transition-colors duration-200 shadow-sm',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0,   opacity: 1 }}
            exit={{   rotate: 90,   opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={15} className="text-sky-400" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90,  opacity: 0 }}
            animate={{ rotate: 0,   opacity: 1 }}
            exit={{   rotate: -90,  opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={15} className="text-amber-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
