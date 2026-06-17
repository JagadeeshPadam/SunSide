'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { SegmentAnalysis } from '@/types';

interface SunPathArcProps {
  segmentAnalyses: SegmentAnalysis[];
  className?: string;
}

export function SunPathArc({ segmentAnalyses, className }: SunPathArcProps) {
  const W = 480; const H = 180; const PAD = 40;
  const arcRx = (W - PAD * 2) / 2;
  const arcRy = H - PAD - 20;
  const cx = W / 2; const cy = H - PAD;

  const sunPoints = segmentAnalyses.map((sa, i) => {
    const t = i / Math.max(segmentAnalyses.length - 1, 1);
    const angle = Math.PI - t * Math.PI;
    const x = cx + arcRx * Math.cos(angle);
    const altFrac = Math.max(0, Math.min(1, sa.solarPosition.altitude / 90));
    const y = cy - arcRy * Math.sin(angle) * (0.5 + altFrac * 0.5);
    return { x, y, score: sa.exposureScore, alt: sa.solarPosition.altitude, t };
  }).filter(p => !isNaN(p.x) && !isNaN(p.y));

  const pathD = sunPoints.length > 1
    ? sunPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    : '';

  const now = sunPoints.length > 0 ? sunPoints[Math.floor(sunPoints.length / 2)] : null;

  const startTime = segmentAnalyses[0]?.segment.startTime;
  const endTime = segmentAnalyses[segmentAnalyses.length - 1]?.segment.endTime;

  return (
    <div className={cn('rounded-2xl overflow-hidden', className)}
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
          Sun Path Arc
        </span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {startTime instanceof Date ? startTime.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) : ''}
          {' → '}
          {endTime instanceof Date ? endTime.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) : ''}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
        {/* Horizon */}
        <line x1={PAD} y1={cy} x2={W - PAD} y2={cy} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
        <text x={PAD + 4} y={cy - 5} fill="rgba(255,255,255,0.2)" fontSize="9">HORIZON</text>

        {/* Cardinal labels */}
        <text x={PAD} y={cy + 14} fill="rgba(255,255,255,0.25)" fontSize="9" textAnchor="middle">E</text>
        <text x={W - PAD} y={cy + 14} fill="rgba(255,255,255,0.25)" fontSize="9" textAnchor="middle">W</text>
        <text x={cx} y={PAD - 6} fill="rgba(255,255,255,0.25)" fontSize="9" textAnchor="middle">ZENITH</text>

        {/* Dashed reference arc */}
        <ellipse cx={cx} cy={cy} rx={arcRx} ry={arcRy} fill="none"
          stroke="rgba(0,0,0,0.02)" strokeWidth="1" strokeDasharray="4 6"
          clipPath="url(#arcClip)" />
        <clipPath id="arcClip">
          <rect x="0" y="0" width={W} height={cy} />
        </clipPath>

        {/* Gradient def */}
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#09090B" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#09090B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.6" />
          </linearGradient>
          <filter id="sunGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Animated sun path */}
        {pathD && (
          <motion.path d={pathD} fill="none" stroke="url(#arcGrad)" strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          />
        )}

        {/* Score dots */}
        {sunPoints.filter((_, i) => i % 3 === 0).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3"
            fill={p.score > 66 ? '#EF4444' : p.score > 33 ? '#09090B' : '#09090B'}
            opacity="0.7" />
        ))}

        {/* Animated current sun */}
        {now && (
          <motion.g filter="url(#sunGlow)"
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.4, type: 'spring' }}>
            <circle cx={now.x} cy={now.y} r="10" fill="rgba(0,0,0,0.05)" />
            <circle cx={now.x} cy={now.y} r="6" fill="#09090B" />
            {[0,45,90,135,180,225,270,315].map(deg => {
              const r = Math.PI * deg / 180;
              return <line key={deg}
                x1={now.x + 8 * Math.cos(r)} y1={now.y + 8 * Math.sin(r)}
                x2={now.x + 13 * Math.cos(r)} y2={now.y + 13 * Math.sin(r)}
                stroke="#09090B" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />;
            })}
          </motion.g>
        )}
      </svg>

      {/* Legend */}
      <div className="px-4 pb-3 flex items-center gap-4">
        {[['#09090B','Low'],['#09090B','Medium'],['#EF4444','High']].map(([c,l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
