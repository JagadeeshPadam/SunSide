'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Crown, TrendingDown, Check } from 'lucide-react';
import { cn, formatTime, getExposureColor } from '@/lib/utils';
import type { DepartureOptimization, OptimizationResult } from '@/types';

interface DepartureOptimizerProps {
  optimization: DepartureOptimization;
  onApply: (time: string) => void;
  currentDepartureTime: string;
  className?: string;
}

function fmtIso(iso: string): string {
  try { return formatTime(new Date(iso)); } catch { return iso; }
}

export function DepartureOptimizer({
  optimization,
  onApply,
  currentDepartureTime,
  className,
}: DepartureOptimizerProps) {
  const [applied, setApplied] = React.useState(false);

  const bestTime = optimization.bestTime;
  const currentScore =
    optimization.options.find((o) => o.departureTime === currentDepartureTime)?.exposureScore
    ?? optimization.options[Math.floor(optimization.options.length / 2)]?.exposureScore
    ?? 80;
  const bestScore = optimization.bestScore;
  const savingsPct = Math.max(0, Math.round(((currentScore - bestScore) / currentScore) * 100));

  const handleApply = () => {
    setApplied(true);
    onApply(bestTime);
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Clock size={14} style={{ color: '#09090B' }} />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          Optimal Departure
        </span>
        {savingsPct > 0 && (
          <span
            className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#09090B' }}
          >
            ↓{savingsPct}% exposure
          </span>
        )}
      </div>

      {/* Current vs Recommended cards */}
      <div className="grid grid-cols-2 gap-2">
        {/* Current */}
        <div
          className="rounded-xl p-3.5"
          style={{
            background: 'rgba(0,0,0,0.02)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={11} style={{ color: 'var(--text-secondary)' }} />
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Current
            </span>
          </div>
          <p className="text-xl font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {fmtIso(currentDepartureTime)}
          </p>
          <p className="text-xs font-semibold mt-1 tabular-nums" style={{ color: getExposureColor(currentScore) }}>
            Score: {Math.round(currentScore)}
          </p>
        </div>

        {/* Recommended */}
        <div
          className="rounded-xl p-3.5 relative overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.10)',
            boxShadow: '0 0 16px rgba(0,0,0,0.04)',
          }}
        >
          {/* BEST badge */}
          <div
            className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wide"
            style={{ background: 'rgba(0,0,0,0.06)', color: '#09090B' }}
          >
            BEST
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <Crown size={11} style={{ color: '#09090B' }} />
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#09090B' }}>
              Optimal
            </span>
          </div>
          <p className="text-xl font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {fmtIso(bestTime)}
          </p>
          <p className="text-xs font-semibold mt-1 tabular-nums" style={{ color: getExposureColor(bestScore) }}>
            Score: {Math.round(bestScore)}
          </p>
        </div>
      </div>

      {/* Reduction callout */}
      {savingsPct > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-xl p-3.5"
          style={{
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.18)',
          }}
        >
          <div
            className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.15)' }}
          >
            <TrendingDown size={16} style={{ color: '#09090B' }} />
          </div>
          <div>
            <p className="text-xl font-black" style={{ color: '#09090B' }}>
              ↓ {savingsPct}% less exposure
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              by leaving at {fmtIso(bestTime)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Options pill list */}
      {optimization.options.length > 1 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
            All tested times
          </p>
          <div className="flex flex-wrap gap-1.5">
            {optimization.options.map((opt, i) => {
              const isBest = opt.departureTime === bestTime;
              const isCurrent = opt.departureTime === currentDepartureTime;
              const color = getExposureColor(opt.exposureScore);
              return (
                <div
                  key={i}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={{
                    background: isBest
                      ? 'rgba(0,0,0,0.05)'
                      : isCurrent
                      ? 'rgba(0,0,0,0.05)'
                      : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${isBest ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.05)'}`,
                    color: isBest ? '#09090B' : 'var(--text-secondary)',
                  }}
                >
                  {isBest && <Crown size={9} style={{ color: '#09090B' }} />}
                  {fmtIso(opt.departureTime)}
                  <span style={{ color, opacity: 0.8 }}> · {Math.round(opt.exposureScore)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Apply button */}
      <motion.button
        onClick={handleApply}
        disabled={applied}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all btn-shimmer"
        style={{
          background: applied
            ? 'rgba(16,185,129,0.15)'
            : 'linear-gradient(135deg, #09090B, #3F3F46)',
          border: applied ? '1px solid rgba(16,185,129,0.3)' : 'none',
          color: applied ? '#09090B' : '#FFFFFF',
          boxShadow: applied ? 'none' : '0 0 20px rgba(0,0,0,0.07)',
          cursor: applied ? 'default' : 'pointer',
        }}
        whileTap={!applied ? { scale: 0.98 } : undefined}
      >
        <AnimatePresence mode="wait">
          {applied ? (
            <motion.span
              key="applied"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <Check size={15} />
              Applied — Leaving at {fmtIso(bestTime)}
            </motion.span>
          ) : (
            <motion.span
              key="apply"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Crown size={15} />
              Apply This Time
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
