'use client';

import * as React from 'react';
import { Cloud, Wind, Thermometer, Sun, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { WeatherData } from '@/types';

interface WeatherSummaryProps {
  weather: WeatherData;
  className?: string;
}

function WeatherIcon({ icon, alt }: { icon: string; alt: string }) {
  return (
    <img
      src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
      alt={alt}
      width={64}
      height={64}
      className="object-contain"
    />
  );
}

function MetricRow({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-4 py-2.5', className)}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
          {icon}
        </div>
        <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}

function CloudBar({ coverage }: { coverage: number }) {
  const color =
    coverage < 25 ? '#10B981' :
    coverage < 60 ? '#F59E0B' :
    '#6B7280';

  return (
    <div className="mt-1 flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${coverage}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color }}>
        {coverage}%
      </span>
    </div>
  );
}

function uvLabel(uv: number): { text: string; variant: 'success' | 'warning' | 'danger' | 'info' } {
  if (uv <= 2)  return { text: 'Low',       variant: 'success' };
  if (uv <= 5)  return { text: 'Moderate',  variant: 'warning' };
  if (uv <= 7)  return { text: 'High',      variant: 'danger'  };
  if (uv <= 10) return { text: 'Very High', variant: 'danger'  };
  return         { text: 'Extreme',          variant: 'danger'  };
}

function exposureImpact(weather: WeatherData): string {
  const { cloudCoverage, uvIndex } = weather;

  if (cloudCoverage > 75) {
    return 'Heavy cloud cover significantly reduces UV exposure — good conditions for any seat.';
  }
  if (cloudCoverage > 40) {
    return 'Partial clouds provide some relief, but direct exposure is still possible.';
  }
  if (uvIndex !== undefined && uvIndex > 7) {
    return 'Clear sky with very high UV — seat selection is critical today.';
  }
  if (uvIndex !== undefined && uvIndex > 4) {
    return 'Moderate-to-high UV. Choosing the right seat will meaningfully reduce exposure.';
  }
  return 'Clear conditions — sun exposure is a factor. Follow the seat recommendation.';
}

export function WeatherSummary({ weather, className }: WeatherSummaryProps) {
  const uv = weather.uvIndex !== undefined ? uvLabel(weather.uvIndex) : null;

  return (
    <div className={cn('flex flex-col gap-0', className)}>
      {/* Header row */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/50">
        <div className="relative">
          <WeatherIcon icon={weather.icon} alt={weather.description} />
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {Math.round(weather.temperature)}&deg;C
          </p>
          <p className="text-sm capitalize text-slate-500 dark:text-slate-400 mt-0.5">
            {weather.description}
          </p>
          {uv && (
            <Badge variant={uv.variant} dot className="mt-2">
              UV {weather.uvIndex} — {uv.text}
            </Badge>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
        {/* Cloud coverage with visual bar */}
        <div className="py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                <Cloud size={14} />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Cloud Coverage</span>
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {weather.cloudCoverage}%
            </span>
          </div>
          <div className="pl-9">
            <CloudBar coverage={weather.cloudCoverage} />
          </div>
        </div>

        <MetricRow
          icon={<Wind size={14} />}
          label="Wind Speed"
          value={`${Math.round(weather.windSpeed)} m/s`}
        />

        <MetricRow
          icon={<Thermometer size={14} />}
          label="Temperature"
          value={`${Math.round(weather.temperature)}°C`}
        />

        {weather.uvIndex !== undefined && (
          <MetricRow
            icon={<Sun size={14} />}
            label="UV Index"
            value={`${weather.uvIndex} (${uv?.text ?? '—'})`}
          />
        )}
      </div>

      {/* Exposure impact note */}
      <div className="mt-4 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 p-3 flex gap-2.5">
        <Eye size={14} className="text-sky-500 shrink-0 mt-0.5" />
        <p className="text-xs text-sky-700 dark:text-sky-300 leading-relaxed">
          {exposureImpact(weather)}
        </p>
      </div>
    </div>
  );
}
