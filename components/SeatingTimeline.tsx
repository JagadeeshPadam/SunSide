'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Sun } from 'lucide-react';
import { cn, formatTime, getExposureColor } from '@/lib/utils';
import type { SeatingRecommendation, ExposureSide } from '@/types';

interface SeatingTimelineProps {
  recommendations: SeatingRecommendation[];
  departureTime: Date;
  className?: string;
}

const SIDE_COLORS: Record<ExposureSide, string> = {
  left:    '#09090B',
  right:   '#09090B',
  front:   '#3F3F46',
  rear:    '#38BDF8',
  minimal: '#64748B',
};

const SIDE_BG: Record<ExposureSide, string> = {
  left:    'rgba(16,185,129,0.12)',
  right:   'rgba(0,0,0,0.05)',
  front:   'rgba(249,115,22,0.12)',
  rear:    'rgba(56,189,248,0.12)',
  minimal: 'rgba(100,116,139,0.12)',
};

function SideIcon({ side, size = 14 }: { side: ExposureSide; size?: number }) {
  const props = { size, strokeWidth: 2.5 };
  switch (side) {
    case 'left':    return <ArrowLeft {...props} />;
    case 'right':   return <ArrowRight {...props} />;
    case 'front':   return <ArrowUp {...props} />;
    case 'rear':    return <ArrowDown {...props} />;
    case 'minimal': return <Sun {...props} />;
  }
}

function formatDuration(startTime: Date, endTime: Date): string {
  const mins = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface BlockTooltipProps {
  rec: SeatingRecommendation;
  visible: boolean;
}

function BlockTooltip({ rec, visible }: BlockTooltipProps) {
  const color = getExposureColor(rec.exposureScore);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-20 pointer-events-none w-40"
          style={{
            background: 'rgba(10,15,30,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '10px 12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: SIDE_COLORS[rec.side] }}>
            {rec.label}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {formatTime(new Date(rec.startTime))} – {formatTime(new Date(rec.endTime))}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {formatDuration(new Date(rec.startTime), new Date(rec.endTime))} · {Math.round(rec.percentage)}%
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${rec.exposureScore}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-[10px] font-bold tabular-nums" style={{ color }}>
              {Math.round(rec.exposureScore)}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SeatingTimeline({
  recommendations,
  departureTime,
  className,
}: SeatingTimelineProps) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  if (!recommendations.length) {
    return (
      <div className={cn('flex items-center justify-center py-8 text-sm', className)} style={{ color: 'var(--text-secondary)' }}>
        No seating recommendations available
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Horizontal scroll track */}
      <div
        ref={scrollRef}
        className="relative overflow-x-auto pb-2"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex gap-2 min-w-max">
          {recommendations.map((rec, index) => {
            const color = SIDE_COLORS[rec.side];
            const bg = SIDE_BG[rec.side];
            const minWidth = Math.max(120, rec.percentage * 2.2);
            const isHovered = hoveredIdx === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: index * 0.07, ease: 'easeOut' }}
                className="relative flex-shrink-0"
                style={{ width: `${minWidth}px`, scrollSnapAlign: 'start' }}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <BlockTooltip rec={rec} visible={isHovered} />

                <motion.div
                  animate={{ y: isHovered ? -4 : 0 }}
                  transition={{ duration: 0.15 }}
                  className="h-20 rounded-xl flex flex-col justify-between p-3 cursor-pointer"
                  style={{
                    background: isHovered ? bg : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${isHovered ? color : 'rgba(0,0,0,0.05)'}`,
                    borderTop: `3px solid ${color}`,
                    boxShadow: isHovered ? `0 4px 16px ${color}20` : 'none',
                  }}
                >
                  {/* Top: time + icon */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-medium tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      {formatTime(new Date(rec.startTime))}
                    </span>
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center"
                      style={{ background: bg, color }}
                    >
                      <SideIcon side={rec.side} size={11} />
                    </div>
                  </div>

                  {/* Bottom: label + score */}
                  <div>
                    <p className="text-xs font-semibold truncate" style={{ color }}>
                      {rec.side.charAt(0).toUpperCase() + rec.side.slice(1)}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: `${getExposureColor(rec.exposureScore)}20`, color: getExposureColor(rec.exposureScore) }}
                      >
                        {Math.round(rec.exposureScore)}
                      </span>
                      <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                        {Math.round(rec.percentage)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Progress track */}
      <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
        {recommendations.map((rec, index) => {
          const color = SIDE_COLORS[rec.side];
          const offset = recommendations.slice(0, index).reduce((sum, r) => sum + r.percentage, 0);
          return (
            <motion.div
              key={index}
              className="absolute top-0 h-full rounded-full"
              style={{
                left: `${offset}%`,
                backgroundColor: color,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${rec.percentage}%` }}
              transition={{ duration: 0.6, delay: index * 0.07 + 0.2, ease: 'easeOut' }}
            />
          );
        })}
      </div>

      {/* Time labels */}
      <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-secondary)' }}>
        <span>{formatTime(new Date(recommendations[0].startTime))}</span>
        <span>{formatTime(new Date(recommendations[recommendations.length - 1].endTime))}</span>
      </div>
    </div>
  );
}
