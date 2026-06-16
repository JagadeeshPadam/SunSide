'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, MapPin, Key, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  className?: string;
}

// ─── Error classification ─────────────────────────────────────────────────────

interface ErrorMeta {
  icon: React.ReactNode;
  title: string;
  suggestion: string;
}

function classifyError(error: string): ErrorMeta {
  const lower = error.toLowerCase();

  if (lower.includes('location not found') || lower.includes('not found') || lower.includes('geocod')) {
    return {
      icon: <MapPin size={20} className="text-amber-500" />,
      title: 'Location Not Found',
      suggestion:
        'Try a different spelling, add a city or country name, or use a well-known landmark.',
    };
  }

  if (
    lower.includes('api') ||
    lower.includes('key') ||
    lower.includes('token') ||
    lower.includes('401') ||
    lower.includes('403') ||
    lower.includes('unauthorized')
  ) {
    return {
      icon: <Key size={20} className="text-violet-500" />,
      title: 'API Configuration Error',
      suggestion:
        'Check that your API keys in .env.local are correct and have the required permissions.',
    };
  }

  if (
    lower.includes('network') ||
    lower.includes('fetch') ||
    lower.includes('timeout') ||
    lower.includes('econnrefused') ||
    lower.includes('failed to fetch')
  ) {
    return {
      icon: <Wifi size={20} className="text-sky-500" />,
      title: 'Network Error',
      suggestion:
        'Check your internet connection and try again. The service may be temporarily unavailable.',
    };
  }

  return {
    icon: <AlertTriangle size={20} className="text-red-500" />,
    title: 'Something Went Wrong',
    suggestion: 'An unexpected error occurred. Try again or refresh the page.',
  };
}

// ─── ErrorState ───────────────────────────────────────────────────────────────

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const { icon, title, suggestion } = classifyError(error);
  const [retrying, setRetrying] = React.useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await Promise.resolve(onRetry());
    } finally {
      // Brief delay so the spinner is visible even on fast retries
      setTimeout(() => setRetrying(false), 600);
    }
  };

  return (
    <div className={cn('flex min-h-[40vh] items-center justify-center px-4', className)}>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 w-full max-w-md text-center"
      >
        {/* Icon cluster */}
        <div className="relative flex items-center justify-center">
          {/* Background glow */}
          <div className="absolute inset-0 rounded-full bg-red-500/10 blur-2xl scale-150" />

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
            className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 shadow-lg"
          >
            <AlertTriangle size={40} className="text-red-500" strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5">
            {error}
          </p>
        </div>

        {/* Suggestion card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 text-left w-full"
        >
          <div className="mt-0.5 shrink-0">{icon}</div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {suggestion}
          </p>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <Button
            onClick={handleRetry}
            loading={retrying}
            className="flex-1"
            size="lg"
          >
            {!retrying && <RefreshCw size={16} />}
            {retrying ? 'Retrying...' : 'Try Again'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.reload()}
            className="shrink-0"
          >
            Reload Page
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
