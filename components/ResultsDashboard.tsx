'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, RotateCcw, Sparkles, Loader2, Sun, Copy, Check } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { JourneySummary } from '@/components/JourneySummary';
import { WeatherSummary } from '@/components/WeatherSummary';
import { SeatDiagram } from '@/components/SeatDiagram';
import { SeatingTimeline } from '@/components/SeatingTimeline';
import { ExposureChart } from '@/components/ExposureChart';
import { DepartureOptimizer } from '@/components/DepartureOptimizer';
import { SunPathArc } from '@/components/SunPathArc';
import { GlobeTracker } from '@/components/GlobeTracker';
import type {
  AnalysisResult,
  VehicleType,
  DepartureOptimization,
  ExposureSide,
} from '@/types';

const RouteMap = dynamic(
  () => import('@/components/RouteMap').then((m) => m.RouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] w-full rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
    ),
  }
);

interface ResultsDashboardProps {
  result: AnalysisResult;
  vehicleType: VehicleType;
  onOptimizeDeparture: () => void;
  optimization?: DepartureOptimization;
  optimizationLoading?: boolean;
  onApplyOptimizedTime: (time: string) => void;
  onReset: () => void;
  className?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function SectionDivider() {
  return (
    <div className="w-full h-px" style={{
      background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.07), transparent)',
    }} />
  );
}

function BestSeatHero({
  recommendedSide,
  exposureReduction,
  comfortScore,
}: {
  recommendedSide: ExposureSide;
  exposureReduction: number;
  comfortScore: number;
}) {
  const sideLabel = recommendedSide === 'left' ? 'LEFT SIDE' : recommendedSide === 'right' ? 'RIGHT SIDE' : recommendedSide.toUpperCase();

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(0,0,0,0.02)',
        border: '1px solid rgba(0,0,0,0.05)',
        borderLeft: '3px solid rgba(0,0,0,0.40)',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)',
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 80% at 0% 50%, rgba(0,0,0,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="relative p-5 flex items-center gap-4">
        {/* Pulsing sun */}
        <div className="relative shrink-0">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(0,0,0,0.07)' }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.6 + i * 0.4, opacity: 0 }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
            />
          ))}
          <motion.div
            className="relative w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #09090B, #3F3F46)', boxShadow: '0 0 20px rgba(0,0,0,0.09)' }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sun size={22} className="text-white" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            Best Seat
          </p>
          <motion.h3
            className="text-3xl font-black leading-none mt-0.5 gradient-amber"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            {sideLabel}
          </motion.h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Avoids{' '}
            <span style={{ color: '#09090B' }} className="font-semibold">
              {Math.round(exposureReduction)}%
            </span>{' '}
            of direct sunlight
          </p>
        </div>

        {/* Comfort badge */}
        <div className="shrink-0 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
            }}
          >
            <span className="text-xl font-black" style={{ color: '#09090B' }}>
              {Math.round(comfortScore)}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              Score
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBar({
  onReset,
}: {
  onReset: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="sticky bottom-0 z-10 pt-3 pb-4 no-print"
      style={{
        background: 'linear-gradient(to top, var(--bg-base) 70%, transparent)',
      }}
    >
      <div className="flex gap-2">
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'rgba(0,0,0,0.02)',
            border: '1px solid rgba(0,0,0,0.06)',
            color: 'var(--text-secondary)',
          }}
        >
          <RotateCcw size={14} />
          New Journey
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'rgba(0,0,0,0.02)',
            border: '1px solid rgba(0,0,0,0.06)',
            color: 'var(--text-secondary)',
          }}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Check size={14} style={{ color: '#09090B' }} />
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Copy size={14} />
              </motion.span>
            )}
          </AnimatePresence>
          Share
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'rgba(0,0,0,0.02)',
            border: '1px solid rgba(0,0,0,0.06)',
            color: 'var(--text-secondary)',
          }}
        >
          <Download size={14} />
          Export
        </button>
      </div>
    </div>
  );
}

export function ResultsDashboard({
  result,
  vehicleType,
  onOptimizeDeparture,
  optimization,
  optimizationLoading,
  onApplyOptimizedTime,
  onReset,
  className,
}: ResultsDashboardProps) {
  const firstRec = result.recommendations[0];
  const recommendedSide: ExposureSide = firstRec?.side ?? 'left';
  const sunSide: ExposureSide = firstRec
    ? firstRec.side === 'left'  ? 'right'
    : firstRec.side === 'right' ? 'left'
    : firstRec.side
    : 'right';

  const departureDate = new Date(result.journey.departureTime);
  const departureDateIso =
    typeof result.journey.departureTime === 'string'
      ? result.journey.departureTime
      : result.journey.departureTime.toISOString();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn('flex flex-col gap-0', className)}
    >
      {/* ── Best Seat Hero ── */}
      <motion.div variants={fadeUp} className="px-1 pt-1 pb-4">
        <BestSeatHero
          recommendedSide={recommendedSide}
          exposureReduction={result.journey.exposureReductionPercentage}
          comfortScore={result.journey.comfortScore}
        />
      </motion.div>

      <motion.div variants={fadeUp}><SectionDivider /></motion.div>

      {/* ── Journey Metrics ── */}
      <motion.div variants={fadeUp} className="py-5 px-1">
        <JourneySummary summary={result.journey} vehicleType={vehicleType} />
      </motion.div>

      <motion.div variants={fadeUp}><SectionDivider /></motion.div>

      {/* ── Weather Strip ── */}
      <motion.div variants={fadeUp} className="py-5 px-1">
        <WeatherSummary weather={result.weatherSummary} />
      </motion.div>

      <motion.div variants={fadeUp}><SectionDivider /></motion.div>

      {/* ── Seating Timeline ── */}
      <motion.div variants={fadeUp} className="py-5 px-1">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
          Seating Timeline
        </p>
        <SeatingTimeline
          recommendations={result.recommendations}
          departureTime={departureDate}
        />
      </motion.div>

      <motion.div variants={fadeUp}><SectionDivider /></motion.div>

      {/* ── Seat Diagram ── */}
      <motion.div variants={fadeUp} className="py-5 px-1">
        <SeatDiagram
          vehicleType={vehicleType}
          recommendedSide={recommendedSide}
          sunSide={sunSide}
        />
      </motion.div>

      <motion.div variants={fadeUp}><SectionDivider /></motion.div>

      {/* ── Exposure Chart ── */}
      <motion.div variants={fadeUp} className="py-5 px-1">
        <ExposureChart segmentAnalyses={result.segmentAnalyses} />
      </motion.div>

      <motion.div variants={fadeUp}><SectionDivider /></motion.div>

      {/* ── Sun Path Arc + Globe Tracker ── */}
      <motion.div variants={fadeUp} className="py-5 px-1">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
          Solar Analysis
        </p>
        <div className="grid grid-cols-1 gap-4" id="sun-arc">
          <SunPathArc segmentAnalyses={result.segmentAnalyses} />
          <GlobeTracker segmentAnalyses={result.segmentAnalyses} />
        </div>
      </motion.div>

      <motion.div variants={fadeUp}><SectionDivider /></motion.div>

      {/* ── Route Map ── */}
      <motion.div variants={fadeUp} className="py-5 px-1">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
          Route Map — Exposure Overlay
        </p>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
          <RouteMap
            mapSegments={result.mapData}
            source={undefined}
            destination={undefined}
            className="h-[280px] w-full"
          />
        </div>
      </motion.div>

      <motion.div variants={fadeUp}><SectionDivider /></motion.div>

      {/* ── Departure Optimizer ── */}
      <motion.div variants={fadeUp} className="py-5 px-1">
        {optimization ? (
          <DepartureOptimizer
            optimization={optimization}
            currentDepartureTime={departureDateIso}
            onApply={onApplyOptimizedTime}
          />
        ) : (
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(0,0,0,0.03)',
              border: '1px dashed rgba(0,0,0,0.08)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={15} style={{ color: '#09090B' }} />
              <span className="text-sm font-semibold" style={{ color: '#09090B' }}>
                Find Better Time
              </span>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Test departure times within a 2-hour window to minimize your sun exposure.
            </p>
            <button
              onClick={onOptimizeDeparture}
              disabled={optimizationLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 btn-shimmer"
              style={{
                background: 'linear-gradient(135deg, #09090B, #3F3F46)',
                color: '#FFFFFF',
                boxShadow: '0 0 20px rgba(0,0,0,0.07)',
              }}
            >
              {optimizationLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Optimizing…
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  ✨ Find Better Time
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Action Bar ── */}
      <motion.div variants={fadeUp}>
        <ActionBar onReset={onReset} />
      </motion.div>
    </motion.div>
  );
}
