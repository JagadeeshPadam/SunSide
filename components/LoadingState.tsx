'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'route',   label: 'Fetching route...',               durationMs: 800  },
  { id: 'solar',   label: 'Calculating solar positions...',  durationMs: 1400 },
  { id: 'weather', label: 'Analyzing weather...',            durationMs: 2000 },
  { id: 'recs',    label: 'Generating recommendations...',   durationMs: 3200 },
] as const;

type StepId = typeof STEPS[number]['id'];

// ─── Pulsing Sun ──────────────────────────────────────────────────────────────

function PulsingSun() {
  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      {/* Outer pulse rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-amber-400/30"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.8 + i * 0.4, opacity: 0 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.6,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Sun body */}
      <motion.div
        className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shadow-xl shadow-amber-500/40"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Rays */}
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-0.5 rounded-full bg-amber-200/70 origin-center"
            style={{
              rotate: `${i * 45}deg`,
              translateY: '-160%',
            }}
            animate={{ opacity: [0.4, 1, 0.4], scaleY: [0.8, 1.2, 0.8] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Inner glow */}
        <div className="h-8 w-8 rounded-full bg-white/30 blur-sm" />
      </motion.div>
    </div>
  );
}

// ─── Animated Route Path ──────────────────────────────────────────────────────

function AnimatedRoutePath() {
  return (
    <div className="w-full max-w-xs mx-auto">
      <svg
        viewBox="0 0 300 60"
        className="w-full"
        aria-hidden
      >
        {/* Track */}
        <path
          d="M 20 30 C 80 30, 100 10, 150 30 C 200 50, 220 30, 280 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Animated path */}
        <motion.path
          d="M 20 30 C 80 30, 100 10, 150 30 C 200 50, 220 30, 280 30"
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="280"
          initial={{ strokeDashoffset: 280 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.5 }}
        />
        {/* Gradient def */}
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        {/* Start dot */}
        <circle cx="20" cy="30" r="5" fill="#10B981" />
        {/* End dot */}
        <motion.circle
          cx="280"
          cy="30"
          r="5"
          fill="#EF4444"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.3 }}
        />
      </svg>
    </div>
  );
}

// ─── Step Item ────────────────────────────────────────────────────────────────

interface StepItemProps {
  label: string;
  state: 'done' | 'active' | 'pending';
}

function StepItem({ label, state }: StepItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3"
    >
      {/* Icon */}
      <div className="relative h-6 w-6 shrink-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {state === 'done' && (
            <motion.div
              key="done"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30"
            >
              <Check size={12} strokeWidth={3} className="text-white" />
            </motion.div>
          )}
          {state === 'active' && (
            <motion.div
              key="active"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex h-6 w-6 items-center justify-center"
            >
              <motion.div
                className="h-5 w-5 rounded-full border-2 border-sky-500 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
          {state === 'pending' && (
            <motion.div
              key="pending"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Label */}
      <span
        className={cn(
          'text-sm transition-colors duration-300',
          state === 'done' && 'text-emerald-600 dark:text-emerald-400 font-medium',
          state === 'active' && 'text-slate-800 dark:text-slate-100 font-semibold',
          state === 'pending' && 'text-slate-400 dark:text-slate-500',
        )}
      >
        {label}
      </span>
    </motion.div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-slate-400">Analyzing your route</span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          ~5 seconds
        </span>
      </div>
    </div>
  );
}

// ─── LoadingState ─────────────────────────────────────────────────────────────

export function LoadingState() {
  const [activeStepIdx, setActiveStepIdx] = React.useState(0);

  React.useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((step, idx) => {
      if (idx === 0) return; // step 0 is immediately active
      const timer = setTimeout(() => {
        setActiveStepIdx(idx);
      }, step.durationMs);
      timers.push(timer);
    });

    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const progress = Math.round(((activeStepIdx + 0.5) / STEPS.length) * 100);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8 w-full max-w-sm"
      >
        {/* Sun animation */}
        <PulsingSun />

        {/* Route path animation */}
        <AnimatedRoutePath />

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Analyzing Your Journey
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Calculating sun exposure for every segment
          </p>
        </div>

        {/* Step list */}
        <div className="flex flex-col gap-3 w-full">
          {STEPS.map((step, idx) => {
            const state =
              idx < activeStepIdx ? 'done' :
              idx === activeStepIdx ? 'active' :
              'pending';
            return (
              <StepItem key={step.id} label={step.label} state={state} />
            );
          })}
        </div>

        {/* Progress bar */}
        <ProgressBar progress={progress} />
      </motion.div>
    </div>
  );
}
