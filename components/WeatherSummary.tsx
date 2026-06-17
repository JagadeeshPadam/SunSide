'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Wind, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeatherData } from '@/types';

interface WeatherSummaryProps {
  weather: WeatherData;
  className?: string;
}

function tempColor(temp: number): string {
  if (temp <= 10) return '#38BDF8';
  if (temp <= 22) return '#09090B';
  return '#EF4444';
}

function cloudTip(coverage: number): string | null {
  if (coverage > 70) return 'Heavy clouds reduce UV ↓';
  if (coverage > 40) return 'Partial clouds — some relief';
  return null;
}

export function WeatherSummary({ weather, className }: WeatherSummaryProps) {
  const color = tempColor(weather.temperature);
  const tip = cloudTip(weather.cloudCoverage);

  const cloudBarColor =
    weather.cloudCoverage < 25 ? '#09090B' :
    weather.cloudCoverage < 60 ? '#09090B' :
    '#64748B';

  return (
    <div
      className={cn('rounded-2xl overflow-hidden', className)}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Weather icon with soft glow */}
        <div className="relative shrink-0">
          <div
            className="absolute inset-0 rounded-full blur-xl"
            style={{ background: `${color}20`, transform: 'scale(1.5)' }}
          />
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.description}
            width={52}
            height={52}
            className="relative object-contain"
          />
        </div>

        {/* Temp + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black tabular-nums" style={{ color }}>
              {Math.round(weather.temperature)}°
            </span>
            <span className="text-sm font-medium" style={{ color: 'rgba(100,116,139,0.8)' }}>C</span>
          </div>
          <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {weather.description}
          </p>
        </div>

        {/* Right: 3 mini stats */}
        <div className="flex flex-col gap-1.5 shrink-0">
          {/* Cloud */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium w-11 text-right tabular-nums" style={{ color: cloudBarColor }}>
              {weather.cloudCoverage}%
            </span>
            <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: cloudBarColor }}
                initial={{ width: 0 }}
                animate={{ width: `${weather.cloudCoverage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>

          {/* Wind */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 w-11 justify-end">
              <Wind size={10} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                {Math.round(weather.windSpeed)}m/s
              </span>
            </div>
            <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, weather.windSpeed * 6)}%`, background: 'rgba(56,189,248,0.5)' }} />
            </div>
          </div>

          {/* UV */}
          {weather.uvIndex !== undefined && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 w-11 justify-end">
                <Sun size={10} style={{ color: 'var(--text-secondary)' }} />
                <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                  UV {weather.uvIndex}
                </span>
              </div>
              <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, weather.uvIndex * 9)}%`,
                    background: weather.uvIndex > 6 ? '#EF4444' : weather.uvIndex > 3 ? '#09090B' : '#09090B',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tip banner */}
      {tip && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="px-4 py-2.5"
          style={{ borderTop: '1px solid rgba(0,0,0,0.02)', background: 'rgba(0,0,0,0.03)' }}
        >
          <p className="text-[11px]" style={{ color: 'rgba(0,0,0,0.13)' }}>
            {tip}
          </p>
        </motion.div>
      )}
    </div>
  );
}
