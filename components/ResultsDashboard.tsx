'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Share2, Download, RotateCcw, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { JourneySummary } from '@/components/JourneySummary';
import { WeatherSummary } from '@/components/WeatherSummary';
import { SeatDiagram } from '@/components/SeatDiagram';
import { SeatingTimeline } from '@/components/SeatingTimeline';
import { ExposureChart } from '@/components/ExposureChart';
import { DepartureOptimizer } from '@/components/DepartureOptimizer';
import type {
  AnalysisResult,
  VehicleType,
  DepartureOptimization,
  ExposureSide,
} from '@/types';

// Dynamic import with ssr:false — RouteMap uses mapbox-gl which needs the browser
const RouteMap = dynamic(
  () => import('@/components/RouteMap').then((m) => m.RouteMap),
  { ssr: false, loading: () => <div className="h-[420px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-b-2xl" /> }
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
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

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
  const departureDateIso = typeof result.journey.departureTime === 'string'
    ? result.journey.departureTime
    : result.journey.departureTime.toISOString();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn('space-y-6', className)}
    >
      {/* ── Header ── */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Journey Analysis</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Solar exposure optimized for your route
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            onClick={() => window.print()}
          >
            <Download size={14} />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
          >
            <Share2 size={14} />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-500 dark:text-slate-400"
            onClick={onReset}
          >
            <RotateCcw size={14} />
            New
          </Button>
        </div>
      </motion.div>

      {/* ── Row 1: Summary + Weather ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <JourneySummary summary={result.journey} vehicleType={vehicleType} />
        <WeatherSummary weather={result.weatherSummary} />
      </motion.div>

      {/* ── Row 2: Seat Diagram + Seating Timeline ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <SeatDiagram
            vehicleType={vehicleType}
            recommendedSide={recommendedSide}
            sunSide={sunSide}
          />
        </div>
        <div className="lg:col-span-3">
          <SeatingTimeline
            recommendations={result.recommendations}
            departureTime={departureDate}
          />
        </div>
      </motion.div>

      {/* ── Row 3: Route Map ── */}
      <motion.div variants={fadeUp}>
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Route Map — Exposure Overlay
            </span>
            <span className="ml-auto text-xs text-slate-400">
              Green = low · Yellow = medium · Red = high
            </span>
          </div>
          <RouteMap
            mapSegments={result.mapData}
            source={undefined}
            destination={undefined}
            className="h-[420px] w-full"
          />
        </div>
      </motion.div>

      {/* ── Row 4: Exposure Chart ── */}
      <motion.div variants={fadeUp}>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Exposure Over Time
            </span>
          </div>
          <ExposureChart segmentAnalyses={result.segmentAnalyses} className="p-4" />
        </div>
      </motion.div>

      {/* ── Row 5: Departure Optimizer ── */}
      <motion.div variants={fadeUp}>
        {optimization ? (
          <DepartureOptimizer
            optimization={optimization}
            currentDepartureTime={departureDateIso}
            onApply={onApplyOptimizedTime}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-sky-300 dark:border-sky-700 bg-sky-50/50 dark:bg-sky-950/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Sparkles size={16} className="text-sky-500" />
                <span className="text-sm font-semibold text-sky-700 dark:text-sky-400">
                  Departure Optimizer
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md">
                Find the best departure time to minimize sun exposure. We&apos;ll test times
                within a 2-hour window and return the optimal slot.
              </p>
            </div>
            <Button
              onClick={onOptimizeDeparture}
              disabled={optimizationLoading}
              className="shrink-0 bg-sky-500 hover:bg-sky-600 text-white gap-2 px-6"
            >
              {optimizationLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Optimizing…
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Find Better Time
                </>
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
