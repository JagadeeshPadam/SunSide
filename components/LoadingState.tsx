'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'route',   label: 'Fetching route geometry…',      durationMs: 0    },
  { id: 'solar',   label: 'Calculating solar angles…',     durationMs: 1400 },
  { id: 'weather', label: 'Analyzing weather impact…',     durationMs: 2800 },
  { id: 'recs',    label: 'Optimizing seat position…',     durationMs: 4200 },
] as const;

// Earth + orbiting Sun SVG animation
function SolarOrbit() {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Orbit ring */}
      <div
        className="absolute w-36 h-36 rounded-full"
        style={{ border: '1px dashed rgba(0,0,0,0.06)' }}
      />

      {/* Earth */}
      <motion.div
        className="relative w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #1d4ed8, #1e3a8a, #0f172a)',
          boxShadow: '0 0 30px rgba(29,78,216,0.4), 0 0 8px rgba(29,78,216,0.2)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {/* Continent blobs */}
        <div className="absolute w-5 h-4 rounded-full" style={{ background: 'rgba(16,185,129,0.6)', top: '18%', left: '22%' }} />
        <div className="absolute w-3 h-5 rounded-full" style={{ background: 'rgba(16,185,129,0.5)', top: '38%', right: '18%' }} />
        <div className="absolute w-4 h-3 rounded-full" style={{ background: 'rgba(16,185,129,0.5)', bottom: '22%', left: '28%' }} />
        {/* Atmosphere glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle at 30% 30%, rgba(56,189,248,0.12) 0%, transparent 65%)' }}
        />
      </motion.div>

      {/* Orbiting sun */}
      <motion.div
        className="absolute w-8 h-8"
        style={{ top: '50%', left: '50%', marginTop: '-16px', marginLeft: '-16px' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-54px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '20px',
            height: '20px',
          }}
        >
          {/* Sun glow rings */}
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(0,0,0,0.07)', margin: `-${(i + 1) * 4}px` }}
              animate={{ opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
            />
          ))}
          <div
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #3F3F46 0%, #09090B 60%, #09090B 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.18) inset',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

interface StepItemProps {
  index: number;
  label: string;
  state: 'done' | 'active' | 'pending';
}

function StepItem({ index, label, state }: StepItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="flex items-center gap-3"
    >
      {/* Number / status circle */}
      <div className="relative h-7 w-7 shrink-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {state === 'done' && (
            <motion.div
              key="done"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              <Check size={13} strokeWidth={2.5} style={{ color: '#09090B' }} />
            </motion.div>
          )}
          {state === 'active' && (
            <motion.div
              key="active"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.10)' }}
            >
              <motion.div
                className="w-4 h-4 rounded-full"
                style={{ border: '2px solid rgba(0,0,0,0.06)', borderTop: '2px solid #09090B' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
          {state === 'pending' && (
            <motion.div
              key="pending"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}
            >
              <span className="text-[10px] font-bold" style={{ color: 'rgba(100,116,139,0.6)' }}>
                {index + 1}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <span
        className={cn(
          'text-sm transition-colors duration-300',
          state === 'done'    && 'font-medium',
          state === 'active'  && 'font-semibold',
          state === 'pending' && 'opacity-40',
        )}
        style={{
          color: state === 'done' ? '#09090B' : state === 'active' ? '#09090B' : 'var(--text-secondary)',
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}

export function LoadingState() {
  const [activeStepIdx, setActiveStepIdx] = React.useState(0);

  React.useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((step, idx) => {
      if (idx === 0) return;
      const timer = setTimeout(() => setActiveStepIdx(idx), step.durationMs);
      timers.push(timer);
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const progressPct = Math.round(((activeStepIdx + 0.6) / STEPS.length) * 100);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8 w-full max-w-sm"
      >
        {/* Solar orbit animation */}
        <SolarOrbit />

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Analyzing Your Journey
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Calculating sun exposure for every segment
          </p>
        </div>

        {/* Step list */}
        <div className="flex flex-col gap-2.5 w-full">
          {STEPS.map((step, idx) => {
            const state =
              idx < activeStepIdx  ? 'done' :
              idx === activeStepIdx ? 'active' :
              'pending';
            return <StepItem key={step.id} index={idx} label={step.label} state={state} />;
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full flex flex-col gap-2">
          <div className="h-0.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #09090B, #3F3F46)',
                boxShadow: 'none',
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-center text-[10px]" style={{ color: 'rgba(100,116,139,0.6)' }}>
            Powered by SunCalc · OpenRouteService · OpenWeatherMap
          </p>
        </div>
      </motion.div>
    </div>
  );
}
