'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpDown, Calendar, Clock, Sliders, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { VehicleSelector } from '@/components/VehicleSelector';
import { LocationInput } from '@/components/LocationInput';
import type { Location, VehicleType, AnalysisRequest } from '@/types';

interface JourneyFormProps {
  onSubmit: (request: AnalysisRequest) => void;
  loading?: boolean;
  className?: string;
}

interface FormErrors {
  source?: string;
  destination?: string;
  date?: string;
  time?: string;
}

export function JourneyForm({ onSubmit, loading = false, className }: JourneyFormProps) {
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

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!source) newErrors.source = 'Please select a starting location';
    if (!destination) newErrors.destination = 'Please select a destination';
    if (!date) newErrors.date = 'Please select a date';
    if (!time) newErrors.time = 'Please select a departure time';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-violet-500">
            <Zap size={16} className="text-white" />
          </div>
          <CardTitle>Plan Your Journey</CardTitle>
        </div>
        <CardDescription>
          Find the best seat and departure time to minimize sun exposure.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Source / Destination */}
          <div className="relative flex flex-col gap-3">
            <LocationInput
              label="From"
              placeholder="Starting point..."
              value={source}
              onChange={setSource}
              icon={
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
              }
            />

            {errors.source && (
              <p className="text-xs text-red-500 -mt-2">{errors.source}</p>
            )}

            {/* Swap button */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
              <motion.button
                type="button"
                onClick={handleSwap}
                animate={swapping ? { rotate: 180 } : { rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  'border border-slate-200 bg-white shadow-sm',
                  'dark:border-slate-700 dark:bg-slate-800',
                  'hover:border-sky-300 hover:text-sky-500 dark:hover:border-sky-600',
                  'transition-colors duration-200',
                )}
                aria-label="Swap origin and destination"
              >
                <ArrowUpDown size={14} className="text-slate-500" />
              </motion.button>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
            </div>

            <LocationInput
              label="To"
              placeholder="Destination..."
              value={destination}
              onChange={setDestination}
              icon={
                <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-violet-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                </div>
              }
            />

            {errors.destination && (
              <p className="text-xs text-red-500 -mt-2">{errors.destination}</p>
            )}
          </div>

          {/* Date + Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                Date
              </label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setDate(e.target.value);
                  setErrors((prev) => ({ ...prev, date: undefined }));
                }}
                className={cn(
                  'rounded-xl border bg-white/80 px-3 py-2.5 text-sm outline-none',
                  'transition-all duration-200 backdrop-blur-sm w-full',
                  'dark:bg-slate-800/80 dark:text-slate-100',
                  errors.date
                    ? 'border-red-400 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
                )}
              />
              {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock size={14} className="text-slate-400" />
                Departure Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  setErrors((prev) => ({ ...prev, time: undefined }));
                }}
                className={cn(
                  'rounded-xl border bg-white/80 px-3 py-2.5 text-sm outline-none',
                  'transition-all duration-200 backdrop-blur-sm w-full',
                  'dark:bg-slate-800/80 dark:text-slate-100',
                  errors.time
                    ? 'border-red-400 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
                )}
              />
              {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}
            </div>
          </div>

          {/* Vehicle selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Vehicle Type
            </label>
            <VehicleSelector value={vehicleType} onChange={setVehicleType} />
          </div>

          {/* Departure optimization toggle */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Find Better Departure Time
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Analyze nearby departure times to reduce sun exposure
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={optimizeDeparture}
                onClick={() => setOptimizeDeparture((v) => !v)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
                  'transition-colors duration-200 ease-in-out',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
                  optimizeDeparture ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600',
                )}
              >
                <motion.span
                  animate={{ x: optimizeDeparture ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0"
                />
              </button>
            </div>

            <AnimatePresence>
              {optimizeDeparture && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Sliders size={12} />
                        Optimization Window
                      </label>
                      <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                        ±{optimizationWindow} min
                      </span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={240}
                      step={30}
                      value={optimizationWindow}
                      onChange={(e) => setOptimizationWindow(Number(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
                      <span>60 min</span>
                      <span>240 min</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA */}
          <Button
            type="submit"
            size="lg"
            className="w-full text-base font-semibold"
          >
            Analyze Journey
            <ArrowRight size={18} className="ml-1" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
