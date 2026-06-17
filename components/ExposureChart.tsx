'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  type TooltipContentProps,
} from 'recharts';
import { cn, formatTime, getExposureColor } from '@/lib/utils';
import type { SegmentAnalysis } from '@/types';

interface ExposureChartProps {
  segmentAnalyses: SegmentAnalysis[];
  className?: string;
}

interface ChartDataPoint {
  time: string;
  timeMs: number;
  score: number;
  side: string;
  cloudCoverage: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: Partial<TooltipContentProps<number, string>>) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload as ChartDataPoint;
  const score = data.score;
  const color = getExposureColor(score);

  return (
    <div
      style={{
        background: 'rgba(10,15,30,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '12px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
        backdropFilter: 'blur(16px)',
        minWidth: '160px',
      }}
    >
      <p className="text-xs font-medium mb-2.5" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Exposure</span>
          <span className="text-sm font-bold tabular-nums" style={{ color }}>{Math.round(score)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Sun side</span>
          <span className="text-xs font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{data.side}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Clouds</span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{data.cloudCoverage}%</span>
        </div>
      </div>
      <div className="mt-2.5 h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

function GradientDef({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4} />
        <stop offset="45%" stopColor="#09090B" stopOpacity={0.25} />
        <stop offset="100%" stopColor="#09090B" stopOpacity={0.04} />
      </linearGradient>
    </defs>
  );
}

export function ExposureChart({ segmentAnalyses, className }: ExposureChartProps) {
  const data: ChartDataPoint[] = React.useMemo(
    () =>
      segmentAnalyses.map((sa) => ({
        time: formatTime(new Date(sa.segment.startTime)),
        timeMs: new Date(sa.segment.startTime).getTime(),
        score: sa.exposureScore,
        side: sa.exposureSide,
        cloudCoverage: sa.weatherData.cloudCoverage,
      })),
    [segmentAnalyses],
  );

  const gradientId = 'exposure-area-gradient';

  return (
    <div className={cn('w-full', className)}>
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: '#09090B', boxShadow: '0 0 6px rgba(0,0,0,0.13)' }}
        />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          Exposure Timeline
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] mb-3">
        {[
          { color: '#09090B', label: 'Low 0–33' },
          { color: '#09090B', label: 'Med 34–66' },
          { color: '#EF4444', label: 'High 67–100' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <GradientDef id={gradientId} />

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0,0,0,0.02)"
            horizontal
            vertical={false}
          />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'rgba(100,116,139,0.8)' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: 'rgba(100,116,139,0.8)' }}
            tickLine={false}
            axisLine={false}
            width={28}
            tickCount={5}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.07)', strokeWidth: 1, strokeDasharray: '3 3' }} />

          <ReferenceLine
            y={33}
            stroke="#09090B"
            strokeDasharray="4 3"
            strokeWidth={1}
            strokeOpacity={0.5}
            label={{ value: 'Low/Med', position: 'right', fontSize: 9, fill: 'rgba(16,185,129,0.7)' }}
          />
          <ReferenceLine
            y={66}
            stroke="#09090B"
            strokeDasharray="4 3"
            strokeWidth={1}
            strokeOpacity={0.5}
            label={{ value: 'Med/High', position: 'right', fontSize: 9, fill: 'rgba(0,0,0,0.40)' }}
          />

          <Area
            type="monotone"
            dataKey="score"
            stroke="#09090B"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 5,
              fill: '#09090B',
              stroke: 'rgba(10,15,30,0.9)',
              strokeWidth: 2,
            }}
            isAnimationActive
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
