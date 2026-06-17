'use client';

import * as React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Car, Bus, Train, Bike, Clock, MapPin, TrendingDown, Route } from 'lucide-react';
import { cn, formatTime, getExposureColor, getVehicleIcon } from '@/lib/utils';
import type { JourneySummary as JourneySummaryType, VehicleType } from '@/types';

interface JourneySummaryProps {
  summary: JourneySummaryType;
  vehicleType: VehicleType;
  className?: string;
}

function VehicleIconComp({ type, size = 16 }: { type: VehicleType; size?: number }) {
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

function AnimatedCounter({
  to,
  duration = 1.2,
  decimals = 0,
  suffix = '',
  style,
  className,
}: {
  to: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => v.toFixed(decimals) + suffix);

  React.useEffect(() => {
    const controls = animate(count, to, { duration, ease: 'easeOut' });
    return controls.stop;
  }, [to, duration, count]);

  return <motion.span style={style} className={className}>{rounded}</motion.span>;
}

interface CircularRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  gradientId: string;
  gradientColors: [string, string];
  label: string;
  sublabel: string;
}

function CircularRing({
  value,
  size = 88,
  strokeWidth = 7,
  gradientId,
  gradientColors,
  label,
  sublabel,
}: CircularRingProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="rgba(0,0,0,0.05)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedCounter
            to={value}
            className="text-xl font-black tabular-nums"
            style={{ color: gradientColors[1] }}
          />
          <span className="text-[9px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            /100
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{sublabel}</p>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  isTime = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isTime?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-3.5 flex flex-col gap-2"
      style={{
        background: 'rgba(0,0,0,0.02)',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <div className="flex items-center gap-2">
        <div style={{ color: 'var(--text-secondary)' }}>{icon}</div>
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
      </div>
      <p
        className="text-base font-bold tabular-nums"
        style={{ color: isTime ? '#09090B' : 'var(--text-primary)' }}
      >
        {value}
      </p>
    </div>
  );
}

export function JourneySummary({ summary, vehicleType, className }: JourneySummaryProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Hero stat */}
      {summary.exposureReductionPercentage > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex items-center gap-4 rounded-2xl p-4"
          style={{
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.18)',
          }}
        >
          <div
            className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.15)' }}
          >
            <TrendingDown size={20} style={{ color: '#09090B' }} />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <AnimatedCounter
                to={summary.exposureReductionPercentage}
                className="text-3xl font-black tabular-nums gradient-amber"
              />
              <span className="text-xl font-black" style={{ color: '#09090B' }}>% less</span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              exposure vs worst-case seating
            </p>
          </div>
        </motion.div>
      )}

      {/* 2×2 metric grid */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          icon={<Route size={14} />}
          label="Distance"
          value={`${summary.distance.toFixed(1)} km`}
        />
        <MetricCard
          icon={<Clock size={14} />}
          label="Duration"
          value={formatDuration(summary.duration)}
        />
        <MetricCard
          icon={<MapPin size={14} />}
          label="Departs"
          value={formatTime(new Date(summary.departureTime))}
          isTime
        />
        <MetricCard
          icon={<MapPin size={14} />}
          label="Arrives"
          value={formatTime(new Date(summary.arrivalTime))}
          isTime
        />
      </div>

      {/* Circular progress rings */}
      <div
        className="flex items-center justify-around py-4 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <CircularRing
          value={summary.totalExposureScore}
          gradientId="exposure-ring"
          gradientColors={['#EF4444', '#09090B']}
          label="Exposure"
          sublabel="Lower is better"
        />
        <div className="w-px self-stretch" style={{ background: 'rgba(0,0,0,0.05)' }} />
        <CircularRing
          value={summary.comfortScore}
          gradientId="comfort-ring"
          gradientColors={['#09090B', '#34D399']}
          label="Comfort"
          sublabel="Higher is better"
        />
      </div>
    </div>
  );
}
