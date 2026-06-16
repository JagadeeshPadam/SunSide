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
      className={cn(
        'rounded-xl border border-slate-200/50 bg-white/95 p-3 shadow-xl backdrop-blur-sm',
        'dark:border-slate-700/50 dark:bg-slate-800/95',
        'min-w-[160px]',
      )}
    >
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
        {label}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-600 dark:text-slate-400">Exposure</span>
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color }}
          >
            {Math.round(score)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-600 dark:text-slate-400">Sun side</span>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">
            {data.side}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-600 dark:text-slate-400">Clouds</span>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {data.cloudCoverage}%
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// Gradient stops for fill
function GradientDef({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
        <stop offset="40%" stopColor="#EAB308" stopOpacity={0.2} />
        <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
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

  const gradientId = 'exposure-gradient';

  return (
    <div className={cn('w-full', className)}>
      {/* Legend */}
      <div className="mb-4 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-500 dark:text-slate-400">Low (0–33)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <span className="text-slate-500 dark:text-slate-400">Medium (34–66)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-slate-500 dark:text-slate-400">High (67–100)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 16, bottom: 0, left: 0 }}
        >
          <GradientDef id={gradientId} />

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
            className="dark:[&>line]:stroke-slate-700"
          />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />

          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickLine={false}
            axisLine={false}
            width={30}
            tickCount={5}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Reference lines */}
          <ReferenceLine
            y={33}
            stroke="#10B981"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            strokeOpacity={0.7}
            label={{ value: 'Low', position: 'right', fontSize: 10, fill: '#10B981' }}
          />
          <ReferenceLine
            y={66}
            stroke="#F59E0B"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            strokeOpacity={0.7}
            label={{ value: 'Mid', position: 'right', fontSize: 10, fill: '#F59E0B' }}
          />

          <Area
            type="monotone"
            dataKey="score"
            stroke="#0EA5E9"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 5,
              fill: '#0EA5E9',
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
