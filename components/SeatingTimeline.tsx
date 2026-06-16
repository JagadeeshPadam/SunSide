'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Minus,
  ChevronRight,
} from 'lucide-react';
import { cn, formatTime, getExposureColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { SeatingRecommendation, ExposureSide } from '@/types';

interface SeatingTimelineProps {
  recommendations: SeatingRecommendation[];
  departureTime: Date;
  className?: string;
}

function SideIcon({ side, size = 16 }: { side: ExposureSide; size?: number }) {
  const props = { size, strokeWidth: 2 };
  switch (side) {
    case 'left':    return <ArrowLeft {...props} />;
    case 'right':   return <ArrowRight {...props} />;
    case 'front':   return <ArrowUp {...props} />;
    case 'rear':    return <ArrowDown {...props} />;
    case 'minimal': return <Minus {...props} />;
  }
}

function sideBadgeVariant(side: ExposureSide): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  switch (side) {
    case 'left':
    case 'right':   return 'info';
    case 'minimal': return 'success';
    case 'front':
    case 'rear':    return 'warning';
  }
}

function exposureBadgeVariant(score: number): 'success' | 'warning' | 'danger' {
  if (score <= 33) return 'success';
  if (score <= 66) return 'warning';
  return 'danger';
}

function formatDuration(startTime: Date, endTime: Date): string {
  const mins = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function SeatingTimeline({
  recommendations,
  departureTime,
  className,
}: SeatingTimelineProps) {
  if (!recommendations.length) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-slate-400', className)}>
        <p className="text-sm">No seating recommendations available</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {recommendations.map((rec, index) => {
        const barColor = getExposureColor(rec.exposureScore);
        const isFirst = index === 0;
        const isLast = index === recommendations.length - 1;

        return (
          <React.Fragment key={index}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
              className={cn(
                'relative rounded-2xl border bg-white dark:bg-slate-800/60',
                'border-slate-200 dark:border-slate-700/60',
                'overflow-hidden',
              )}
            >
              {/* Exposure bar accent at top */}
              <div
                className="h-1 w-full"
                style={{
                  background: `linear-gradient(to right, ${barColor}40, ${barColor})`,
                }}
              />

              <div className="flex items-start gap-4 p-4">
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center shrink-0 mt-1">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: `${barColor}20`, border: `2px solid ${barColor}` }}
                  >
                    <SideIcon side={rec.side} size={14} />
                  </div>
                  {!isLast && (
                    <div className="mt-2 w-0.5 flex-1 min-h-[16px] bg-slate-200 dark:bg-slate-700" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {rec.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatTime(new Date(rec.startTime))} – {formatTime(new Date(rec.endTime))}
                        {' · '}
                        <span className="font-medium">{formatDuration(new Date(rec.startTime), new Date(rec.endTime))}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={sideBadgeVariant(rec.side)} dot>
                        {rec.side}
                      </Badge>
                      <Badge variant={exposureBadgeVariant(rec.exposureScore)}>
                        {Math.round(rec.exposureScore)} / 100
                      </Badge>
                    </div>
                  </div>

                  {/* Progress bar for this segment */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rec.percentage}%` }}
                        transition={{ duration: 0.6, delay: index * 0.08 + 0.2, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: barColor }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                      {Math.round(rec.percentage)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Arrow connector between segments */}
            {!isLast && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.08 + 0.1 }}
                className="flex justify-center"
              >
                <ChevronRight
                  size={16}
                  className="text-slate-300 dark:text-slate-600 rotate-90"
                />
              </motion.div>
            )}
          </React.Fragment>
        );
      })}

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: recommendations.length * 0.08 + 0.1 }}
        className="text-center text-xs text-slate-400 dark:text-slate-500 pt-1"
      >
        Recommendations update as your journey progresses
      </motion.p>
    </div>
  );
}
