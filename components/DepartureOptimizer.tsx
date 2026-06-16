'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipContentProps,
} from 'recharts';
import { Crown, Clock, TrendingDown, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, formatTime, getExposureColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DepartureOptimization, OptimizationResult } from '@/types';

interface DepartureOptimizerProps {
  optimization: DepartureOptimization;
  onApply: (time: string) => void;
  currentDepartureTime: string;
  className?: string;
}

function fmtIso(iso: string): string {
  try {
    return formatTime(new Date(iso));
  } catch {
    return iso;
  }
}

function fmtReduction(pct: number): string {
  return `${Math.round(pct)}%`;
}

const BarTooltip = ({ active, payload }: Partial<TooltipContentProps<number, string>>) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as OptimizationResult & { isBest: boolean };
  const color = getExposureColor(d.exposureScore);

  return (
    <div className="rounded-xl border border-slate-200/60 bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/95 text-xs space-y-1 min-w-[130px]">
      <p className="font-semibold text-slate-800 dark:text-slate-200">
        {fmtIso(d.departureTime)}
        {d.isBest && (
          <span className="ml-1.5 text-amber-500">★ Best</span>
        )}
      </p>
      <div className="flex justify-between gap-3">
        <span className="text-slate-500 dark:text-slate-400">Exposure</span>
        <span className="font-bold" style={{ color }}>{Math.round(d.exposureScore)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-slate-500 dark:text-slate-400">Reduction</span>
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          {fmtReduction(d.exposureReduction)}
        </span>
      </div>
    </div>
  );
};

export function DepartureOptimizer({
  optimization,
  onApply,
  currentDepartureTime,
  className,
}: DepartureOptimizerProps) {
  const [showAll, setShowAll] = React.useState(false);
  const [applied, setApplied] = React.useState(false);

  const bestTime = optimization.bestTime;
  const currentScore =
    optimization.options.find((o) => o.departureTime === currentDepartureTime)?.exposureScore
    ?? optimization.options[Math.floor(optimization.options.length / 2)]?.exposureScore
    ?? 80;
  const bestScore = optimization.bestScore;
  const savingsPct = Math.max(0, Math.round(((currentScore - bestScore) / currentScore) * 100));

  const chartData = optimization.options.map((opt) => ({
    ...opt,
    isBest: opt.departureTime === bestTime,
    label: fmtIso(opt.departureTime),
  }));

  const visibleOptions = showAll ? optimization.options : optimization.options.slice(0, 5);

  const handleApply = () => {
    setApplied(true);
    onApply(bestTime);
  };

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {/* Hero: current vs best */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={13} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Current
            </span>
          </div>
          <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
            {fmtIso(currentDepartureTime)}
          </p>
          <p
            className="text-sm font-semibold mt-1 tabular-nums"
            style={{ color: getExposureColor(currentScore) }}
          >
            Score: {Math.round(currentScore)}
          </p>
        </div>

        {/* Best */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-500/10 p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Crown size={13} className="text-amber-500" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
              Optimal
            </span>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {fmtIso(bestTime)}
          </p>
          <p
            className="text-sm font-semibold mt-1 tabular-nums"
            style={{ color: getExposureColor(bestScore) }}
          >
            Score: {Math.round(bestScore)}
          </p>
        </div>
      </div>

      {/* Savings callout */}
      {savingsPct > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <TrendingDown size={20} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {savingsPct}% less
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              exposure by leaving at {fmtIso(bestTime)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Bar chart */}
      {optimization.options.length > 1 && (
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
            Exposure by departure time
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
                tickCount={4}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
              <Bar dataKey="exposureScore" radius={[5, 5, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.isBest ? '#F59E0B' : getExposureColor(entry.exposureScore)}
                    fillOpacity={entry.isBest ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Options list */}
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
          All tested times
        </p>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/50 overflow-hidden">
          <AnimatePresence initial={false}>
            {visibleOptions.map((opt, i) => {
              const isBest = opt.departureTime === bestTime;
              const isCurrent = opt.departureTime === currentDepartureTime;
              const color = getExposureColor(opt.exposureScore);

              return (
                <motion.div
                  key={opt.departureTime}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3',
                    isBest && 'bg-amber-50/70 dark:bg-amber-500/10',
                    isCurrent && !isBest && 'bg-slate-50 dark:bg-slate-700/30',
                  )}
                >
                  {/* Icon */}
                  <div className="w-5 shrink-0">
                    {isBest ? (
                      <Crown size={14} className="text-amber-500" />
                    ) : isCurrent ? (
                      <Clock size={14} className="text-slate-400" />
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto" />
                    )}
                  </div>

                  {/* Time */}
                  <span className={cn(
                    'text-sm font-medium w-16 shrink-0',
                    isBest ? 'text-amber-700 dark:text-amber-300' : 'text-slate-700 dark:text-slate-300',
                  )}>
                    {fmtIso(opt.departureTime)}
                  </span>

                  {/* Bar */}
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${opt.exposureScore}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>

                  {/* Score */}
                  <span
                    className="text-xs font-bold tabular-nums w-7 text-right shrink-0"
                    style={{ color }}
                  >
                    {Math.round(opt.exposureScore)}
                  </span>

                  {/* Reduction badge */}
                  {opt.exposureReduction > 0 && (
                    <Badge variant="success" className="text-xs shrink-0">
                      -{fmtReduction(opt.exposureReduction)}
                    </Badge>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Show more/less */}
        {optimization.options.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors py-1"
          >
            {showAll ? (
              <>Show less <ChevronUp size={12} /></>
            ) : (
              <>Show all {optimization.options.length} times <ChevronDown size={12} /></>
            )}
          </button>
        )}
      </div>

      {/* Apply button */}
      <Button
        size="lg"
        onClick={handleApply}
        disabled={applied}
        className={cn(
          'w-full font-semibold',
          applied && 'bg-emerald-500 hover:bg-emerald-500',
        )}
      >
        {applied ? (
          <>
            <Check size={16} />
            Applied — Leaving at {fmtIso(bestTime)}
          </>
        ) : (
          <>
            <Crown size={16} className="text-amber-300" />
            Apply Optimal Time ({fmtIso(bestTime)})
          </>
        )}
      </Button>
    </div>
  );
}
