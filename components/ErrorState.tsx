'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, MapPin, Key, Wifi, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  className?: string;
}

interface ErrorMeta {
  icon: React.ReactNode;
  title: string;
  suggestion: string;
}

function classifyError(error: string): ErrorMeta {
  const lower = error.toLowerCase();

  if (lower.includes('location') || lower.includes('not found') || lower.includes('geocod')) {
    return {
      icon: <MapPin size={18} style={{ color: '#09090B' }} />,
      title: 'Location Not Found',
      suggestion: 'Try a different spelling, add a city name, or use a well-known landmark.',
    };
  }

  if (lower.includes('api') || lower.includes('key') || lower.includes('token') || lower.includes('401') || lower.includes('403') || lower.includes('unauthorized')) {
    return {
      icon: <Key size={18} style={{ color: '#818CF8' }} />,
      title: 'API Configuration Error',
      suggestion: 'Check that your API keys in .env.local are correct and have the required permissions.',
    };
  }

  if (lower.includes('network') || lower.includes('fetch') || lower.includes('timeout') || lower.includes('econnrefused') || lower.includes('failed to fetch')) {
    return {
      icon: <Wifi size={18} style={{ color: '#38BDF8' }} />,
      title: 'Network Error',
      suggestion: 'Check your internet connection. The service may be temporarily unavailable.',
    };
  }

  return {
    icon: <AlertTriangle size={18} style={{ color: '#EF4444' }} />,
    title: 'Something Went Wrong',
    suggestion: 'An unexpected error occurred. Try again or refresh the page.',
  };
}

// Animated sun partially hidden behind cloud
function ErrorSunAnimation() {
  return (
    <div className="relative w-28 h-20 flex items-end justify-center">
      {/* Sun (partially visible) */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239,68,68,0.8), rgba(0,0,0,0.30))',
          boxShadow: '0 0 24px rgba(239,68,68,0.4), 0 0 8px rgba(239,68,68,0.2)',
          clipPath: 'inset(30% 0 0 0)',
        }}
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Glow from sun */}
      <motion.div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full blur-xl"
        style={{ background: 'rgba(239,68,68,0.2)' }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      {/* Cloud */}
      <motion.div
        className="absolute bottom-2 left-1/2 -translate-x-1/2"
        animate={{ x: [-4, 4, -4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="100" height="40" viewBox="0 0 100 40" aria-hidden>
          <ellipse cx="40" cy="30" rx="38" ry="14" fill="rgba(30,41,59,0.9)" />
          <ellipse cx="30" cy="24" rx="20" ry="14" fill="rgba(30,41,59,0.9)" />
          <ellipse cx="55" cy="22" rx="18" ry="14" fill="rgba(30,41,59,0.9)" />
          <ellipse cx="40" cy="30" rx="38" ry="14" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
        </svg>
      </motion.div>
    </div>
  );
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const { icon, title, suggestion } = classifyError(error);
  const [retrying, setRetrying] = React.useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await Promise.resolve(onRetry());
    } finally {
      setTimeout(() => setRetrying(false), 600);
    }
  };

  return (
    <div className={cn('flex min-h-[50vh] items-center justify-center px-4', className)}>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 w-full max-w-sm text-center"
      >
        {/* Animated error sun */}
        <ErrorSunAnimation />

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
        </div>

        {/* Error message */}
        <div
          className="w-full rounded-xl px-4 py-3 text-left"
          style={{
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}
        >
          <p className="text-xs font-mono leading-relaxed" style={{ color: 'rgba(239,68,68,0.8)' }}>
            {error}
          </p>
        </div>

        {/* Suggestion */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-3 rounded-xl p-4 text-left w-full"
          style={{
            background: 'rgba(0,0,0,0.02)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          <div className="mt-0.5 shrink-0">{icon}</div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {suggestion}
          </p>
        </motion.div>

        {/* Action buttons */}
        <div className="flex gap-2 w-full">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all btn-shimmer"
            style={{
              background: 'linear-gradient(135deg, #09090B, #3F3F46)',
              color: '#FFFFFF',
              boxShadow: retrying ? 'none' : '0 0 16px rgba(0,0,0,0.08)',
              opacity: retrying ? 0.7 : 1,
            }}
          >
            <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
            {retrying ? 'Retrying…' : 'Try Again'}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'rgba(0,0,0,0.02)',
              border: '1px solid rgba(0,0,0,0.06)',
              color: 'var(--text-secondary)',
            }}
          >
            <ArrowLeft size={14} />
            New Journey
          </button>
        </div>
      </motion.div>
    </div>
  );
}
