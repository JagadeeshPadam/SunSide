'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Car, Bus, Train, Bike, Clock, MapPin, TrendingDown } from 'lucide-react';
import { cn, formatTime, getExposureColor, getVehicleIcon } from '@/lib/utils';
import type { JourneySummary as JourneySummaryType, VehicleType } from '@/types';

interface JourneySummaryProps {
  summary: JourneySummaryType;
  vehicleType: VehicleType;
  className?: string;
}

function VehicleIconComp({ type, size = 18 }: { type: VehicleType; size?: number }) {
  const props = { size, strokeWidth: 1.75 };
  switch (type) {
    case 'car':   return <Car {...props} />;
    case 'bus':   return <Bus {...props} />;
    case 'train': return <Train {...props} />;
    case 'bike':  return <Bike {...props} />;
  }
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

interface CircularProgressProps {
  value: number;       // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  sublabel?: string;
}

function CircularProgress({
  value,
  size = 100,
  strokeWidth = 8,
  color,
  label,
  sublabel,
}: CircularProgressProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const resolvedColor = color ?? getExposureColor(value);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          aria-hidden
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-700"
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-bold tabular-nums"
            style={{ color: resolvedColor }}
          >
            {Math.round(value)}
          </motion.span>
          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
            / 100
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</p>
        {sublabel && (
          <p className="text-xs text-slate-400 dark:text-slate-500">{sublabel}</p>
        )}
      </div>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 p-3.5">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <div className="text-sky-500">{icon}</div>
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-base font-bold text-slate-900 dark:text-slate-100">{value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  );
}

export function JourneySummary({ summary, vehicleType, className }: JourneySummaryProps) {
  const comfortColor = '#10B981'; // Always show comfort in green

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {/* Circular progress rings */}
      <div className="flex items-start justify-around gap-4">
        <CircularProgress
          value={summary.totalExposureScore}
          label="Exposure Score"
          sublabel="Lower is better"
          size={110}
          strokeWidth={9}
        />

        <div className="w-px self-stretch bg-slate-100 dark:bg-slate-700" />

        <CircularProgress
          value={summary.comfortScore}
          label="Comfort Score"
          sublabel="Higher is better"
          color={comfortColor}
          size={110}
          strokeWidth={9}
        />
      </div>

      {/* Exposure reduction callout */}
      {summary.exposureReductionPercentage > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <TrendingDown size={20} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {Math.round(summary.exposureReductionPercentage)}%
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
              less sun exposure vs worst-case seating
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatBox
          icon={<VehicleIconComp type={vehicleType} />}
          label="Distance"
          value={`${summary.distance.toFixed(1)} km`}
          sub={`via ${getVehicleIcon(vehicleType)} ${vehicleType}`}
        />

        <StatBox
          icon={<Clock size={15} />}
          label="Duration"
          value={formatDuration(summary.duration)}
        />

        <StatBox
          icon={<MapPin size={15} />}
          label="Departs"
          value={formatTime(new Date(summary.departureTime))}
        />

        <StatBox
          icon={<MapPin size={15} />}
          label="Arrives"
          value={formatTime(new Date(summary.arrivalTime))}
        />
      </div>
    </div>
  );
}
