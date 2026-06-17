'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpDown,
  Calendar,
  Clock,
  Sliders,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VehicleSelector } from '@/components/VehicleSelector';
import { LocationInput } from '@/components/LocationInput';
import type { Location, VehicleType, AnalysisRequest } from '@/types';

/* ─── Props ──────────────────────────────────────────────────────────────────── */

interface JourneyFormProps {
  onSubmit: (request: AnalysisRequest) => void;
  loading?: boolean;
  className?: string;
  /** Mobile multi-step wizard current step (0=route, 1=vehicle, 2=schedule) */
  mobileStep?: number;
  onMobileStepChange?: (step: number) => void;
}

interface FormErrors {
  source?: string;
  destination?: string;
  date?: string;
  time?: string;
}

/* ─── Section label ──────────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: 'var(--text-secondary)' }}
      >
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
    </div>
  );
}

/* ─── iOS-style toggle ───────────────────────────────────────────────────────── */

function AmberToggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className="relative shrink-0 w-11 h-6 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 focus-visible:ring-offset-2"
        style={{
          background: checked
            ? 'linear-gradient(135deg, #09090B, #3F3F46)'
            : 'var(--surface-3)',
          border: checked ? 'none' : '1px solid var(--border-hover)',
          transition: 'background 0.2s ease',
          boxShadow: checked ? '0 0 12px rgba(0,0,0,0.10)' : 'none',
        }}
      >
        <motion.span
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-[3px] inline-block w-[18px] h-[18px] rounded-full shadow-lg"
          style={{ background: 'white' }}
        />
      </button>
    </div>
  );
}

/* ─── Dark date/time input ───────────────────────────────────────────────────── */

interface DarkInputProps {
  type: 'date' | 'time';
  value: string;
  min?: string;
  onChange: (val: string) => void;
  label: string;
  icon: React.ReactNode;
  error?: string;
}

function DarkInput({ type, value, min, onChange, label, icon, error }: DarkInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--text-secondary)' }}
      >
        {icon}
        {label}
      </label>
      <input
        type={type}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className={cn('w-full px-3 py-3 text-sm rounded-xl outline-none', error ? 'animate-shake' : '')}
        style={{
          background: 'var(--surface-2)',
          border: error
            ? '1px solid var(--red-err)'
            : '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
          colorScheme: 'light',
          boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.12)' : 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--amber)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--amber-glow)';
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--red-err)' : 'var(--border-subtle)';
          e.currentTarget.style.boxShadow = error ? '0 0 0 3px rgba(239,68,68,0.12)' : 'none';
        }}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs"
          style={{ color: 'var(--red-err)' }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

/* ─── Analyze button ─────────────────────────────────────────────────────────── */

function AnalyzeButton({ loading }: { loading: boolean }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <motion.button
      type="submit"
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="btn-shimmer relative w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-bold text-white outline-none overflow-hidden cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, #09090B 0%, #3F3F46 100%)',
        backgroundSize: '200% 200%',
        animation: hovered ? 'gradient-shift 2s ease infinite' : 'none',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.2s ease, transform 0.15s ease',
      }}
    >
      {loading ? (
        <>
          {/* Solar spinner */}
          <div className="relative w-5 h-5">
            <div
              className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white animate-spin"
            />
          </div>
          <span>Analyzing route…</span>
        </>
      ) : (
        <>
          <span>Analyze Journey</span>
          <motion.div
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <ArrowRight size={18} strokeWidth={2.5} />
          </motion.div>
        </>
      )}
    </motion.button>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */

export function JourneyForm({
  onSubmit,
  loading = false,
  className,
  mobileStep,
  onMobileStepChange: _onMobileStepChange,
}: JourneyFormProps) {
  const [source, setSource] = React.useState<Location | null>(null);
  const [destination, setDestination] = React.useState<Location | null>(null);
  const [date, setDate] = React.useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = React.useState(() => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  });
  const [vehicleType, setVehicleType] = React.useState<VehicleType>('car');
  const [optimizeDeparture, setOptimizeDeparture] = React.useState(false);
  const [optimizationWindow, setOptimizationWindow] = React.useState(120);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [swapping, setSwapping] = React.useState(false);

  /* ── Validation ── */
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!source) newErrors.source = 'Please select a starting location';
    if (!destination) newErrors.destination = 'Please select a destination';
    if (!date) newErrors.date = 'Please select a date';
    if (!time) newErrors.time = 'Please select a departure time';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Swap ── */
  const handleSwap = () => {
    if (!source && !destination) return;
    setSwapping(true);
    setTimeout(() => {
      const tmp = source;
      setSource(destination);
      setDestination(tmp);
      setSwapping(false);
    }, 150);
  };

  /* ── Submit ── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const departureTime = new Date(`${date}T${time}:00`).toISOString();
    onSubmit({
      source: source!,
      destination: destination!,
      departureTime,
      vehicleType,
      optimizeDeparture,
      optimizationWindowMinutes: optimizationWindow,
    });
  };

  /* ── Decide what to show in mobile wizard steps ── */
  const isMobile = mobileStep !== undefined;

  // In mobile mode, show specific sections per step
  const showRoute    = !isMobile || mobileStep === 0;
  const showVehicle  = !isMobile || mobileStep === 1;
  const showSchedule = !isMobile || mobileStep === 2;
  const showSubmit   = !isMobile || mobileStep === 2; // CTA appears on last form step

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn('flex flex-col gap-6', className)}
    >
      {/* ── SECTION: Route ── */}
      <AnimatePresence mode="wait">
        {showRoute && (
          <motion.div
            key="route-section"
            initial={isMobile ? { opacity: 0, x: 30 } : false}
            animate={{ opacity: 1, x: 0 }}
            exit={isMobile ? { opacity: 0, x: -30 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <SectionLabel>Route</SectionLabel>

            <div className="relative flex flex-col gap-3">
              {/* Origin */}
              <LocationInput
                label="From"
                placeholder="Starting point…"
                value={source}
                onChange={(loc) => {
                  setSource(loc);
                  setErrors((p) => ({ ...p, source: undefined }));
                }}
                icon={
                  <div
                    className="flex h-4 w-4 items-center justify-center rounded-full"
                    style={{ background: '#09090B' }}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                }
                hasError={!!errors.source}
              />
              {errors.source && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs -mt-1"
                  style={{ color: 'var(--red-err)' }}
                >
                  {errors.source}
                </motion.p>
              )}

              {/* Swap button */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
                <motion.button
                  type="button"
                  onClick={handleSwap}
                  animate={swapping ? { rotate: 180 } : { rotate: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex h-9 w-9 items-center justify-center rounded-full cursor-pointer outline-none"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--amber)';
                    e.currentTarget.style.color = 'var(--amber)';
                    e.currentTarget.style.boxShadow = '0 0 12px var(--amber-glow)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  aria-label="Swap origin and destination"
                >
                  <ArrowUpDown size={15} />
                </motion.button>
                <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
              </div>

              {/* Destination */}
              <LocationInput
                label="To"
                placeholder="Destination…"
                value={destination}
                onChange={(loc) => {
                  setDestination(loc);
                  setErrors((p) => ({ ...p, destination: undefined }));
                }}
                icon={
                  <div
                    className="flex h-4 w-4 items-center justify-center rounded-full"
                    style={{ border: '2px solid var(--amber)' }}
                  >
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--amber)' }} />
                  </div>
                }
                hasError={!!errors.destination}
              />
              {errors.destination && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs -mt-1"
                  style={{ color: 'var(--red-err)' }}
                >
                  {errors.destination}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SECTION: Vehicle ── */}
      <AnimatePresence mode="wait">
        {showVehicle && (
          <motion.div
            key="vehicle-section"
            initial={isMobile ? { opacity: 0, x: 30 } : false}
            animate={{ opacity: 1, x: 0 }}
            exit={isMobile ? { opacity: 0, x: -30 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <SectionLabel>Vehicle</SectionLabel>
            <VehicleSelector value={vehicleType} onChange={setVehicleType} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SECTION: Schedule ── */}
      <AnimatePresence mode="wait">
        {showSchedule && (
          <motion.div
            key="schedule-section"
            initial={isMobile ? { opacity: 0, x: 30 } : false}
            animate={{ opacity: 1, x: 0 }}
            exit={isMobile ? { opacity: 0, x: -30 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="flex flex-col gap-4"
          >
            <SectionLabel>Schedule</SectionLabel>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <DarkInput
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(v) => {
                  setDate(v);
                  setErrors((p) => ({ ...p, date: undefined }));
                }}
                label="Date"
                icon={<Calendar size={12} />}
                error={errors.date}
              />
              <DarkInput
                type="time"
                value={time}
                onChange={(v) => {
                  setTime(v);
                  setErrors((p) => ({ ...p, time: undefined }));
                }}
                label="Departure"
                icon={<Clock size={12} />}
                error={errors.time}
              />
            </div>

            {/* Find Better Time toggle */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <AmberToggle
                checked={optimizeDeparture}
                onChange={() => setOptimizeDeparture((v) => !v)}
                label="Find Better Departure Time"
                description="Analyze nearby times to reduce sun exposure"
              />

              <AnimatePresence>
                {optimizeDeparture && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pt-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <label
                          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <Sliders size={11} />
                          Optimization Window
                        </label>
                        <span
                          className="text-xs font-bold tabular-nums"
                          style={{ color: 'var(--amber)' }}
                        >
                          ±{optimizationWindow} min
                        </span>
                      </div>

                      {/* Custom styled range slider */}
                      <div className="relative">
                        <input
                          type="range"
                          min={60}
                          max={240}
                          step={30}
                          value={optimizationWindow}
                          onChange={(e) => setOptimizationWindow(Number(e.target.value))}
                          className="w-full h-1.5 rounded-full outline-none cursor-pointer appearance-none"
                          style={{
                            background: `linear-gradient(to right, #09090B ${((optimizationWindow - 60) / 180) * 100}%, var(--surface-3) ${((optimizationWindow - 60) / 180) * 100}%)`,
                            accentColor: '#09090B',
                          }}
                        />
                        <div className="flex justify-between mt-1.5">
                          {[60, 120, 180, 240].map((v) => (
                            <span
                              key={v}
                              className="text-[10px]"
                              style={{
                                color: v === optimizationWindow ? 'var(--amber)' : 'var(--text-secondary)',
                                fontWeight: v === optimizationWindow ? 700 : 400,
                              }}
                            >
                              {v}m
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CTA ── */}
      {showSubmit && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AnalyzeButton loading={loading} />
        </motion.div>
      )}
    </form>
  );
}
