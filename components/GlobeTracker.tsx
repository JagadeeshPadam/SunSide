'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { SegmentAnalysis } from '@/types';

interface GlobeTrackerProps {
  segmentAnalyses: SegmentAnalysis[];
  className?: string;
}

function toSVGCoords(lat: number, lng: number, cx: number, cy: number, r: number) {
  const x = cx + r * Math.cos((lat * Math.PI) / 180) * Math.sin((lng * Math.PI) / 180);
  const y = cy - r * Math.sin((lat * Math.PI) / 180);
  return { x, y };
}

export function GlobeTracker({ segmentAnalyses, className }: GlobeTrackerProps) {
  const SIZE = 180; const cx = SIZE / 2; const cy = SIZE / 2; const R = 72;
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % Math.max(segmentAnalyses.length, 1)), 1200);
    return () => clearInterval(id);
  }, [segmentAnalyses.length]);

  const routePoints = segmentAnalyses.map(sa => {
    const { lat, lng } = sa.segment.startCoords;
    return toSVGCoords(lat - 10, lng, cx, cy, R);
  });

  const sunAz = segmentAnalyses[tick]?.solarPosition.azimuth ?? 0;
  const sunAlt = segmentAnalyses[tick]?.solarPosition.altitude ?? 0;
  const sunVisible = sunAlt > 0;
  const sunAngle = (sunAz - 90) * (Math.PI / 180);
  const sunR = R * 1.35;
  const sunX = cx + sunR * Math.cos(sunAngle);
  const sunY = cy + sunR * Math.sin(sunAngle);

  const currentPos = routePoints[tick] ?? { x: cx, y: cy };

  const routePathD = routePoints.length > 1
    ? routePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    : '';

  return (
    <div className={cn('rounded-2xl p-4 flex flex-col items-center gap-2', className)}
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
      <span className="text-xs font-semibold tracking-widest uppercase self-start"
        style={{ color: 'var(--text-secondary)' }}>Sun Tracker</span>

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <defs>
          <radialGradient id="globeGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#1e3a8a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
          </radialGradient>
          <filter id="globeGlow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="sunGlowG">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="globeClip"><circle cx={cx} cy={cy} r={R} /></clipPath>
        </defs>

        {/* Globe */}
        <circle cx={cx} cy={cy} r={R} fill="url(#globeGrad)" />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />

        {/* Latitude lines */}
        {[-40,-20,0,20,40].map(lat => {
          const ry = R * Math.cos((lat * Math.PI) / 180);
          const yOff = -R * Math.sin((lat * Math.PI) / 180);
          return <ellipse key={lat} cx={cx} cy={cy + yOff} rx={ry} ry={ry * 0.25}
            fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="0.8" clipPath="url(#globeClip)" />;
        })}
        {/* Longitude lines */}
        {[0,45,90,135].map(lng => {
          const a = (lng * Math.PI) / 180;
          return <line key={lng}
            x1={cx + R * Math.cos(a)} y1={cy + R * 0.25 * Math.sin(a)}
            x2={cx - R * Math.cos(a)} y2={cy - R * 0.25 * Math.sin(a)}
            stroke="rgba(0,0,0,0.02)" strokeWidth="0.8" />;
        })}

        {/* Atmosphere rim */}
        <circle cx={cx} cy={cy} r={R + 4} fill="none"
          stroke="rgba(56,189,248,0.15)" strokeWidth="4" />

        {/* Route path */}
        {routePathD && (
          <motion.path d={routePathD} fill="none" stroke="#09090B"
            strokeWidth="2" strokeLinecap="round" opacity="0.8"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }} />
        )}

        {/* Route dots */}
        {routePoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5"
            fill={i === tick ? '#09090B' : 'rgba(0,0,0,0.07)'} />
        ))}

        {/* Moving position dot */}
        <motion.circle cx={currentPos.x} cy={currentPos.y} r="5"
          fill="#09090B" filter="url(#globeGlow)"
          animate={{ cx: currentPos.x, cy: currentPos.y }}
          transition={{ duration: 0.8, ease: 'easeInOut' }} />
        <motion.circle cx={currentPos.x} cy={currentPos.y} r="10"
          fill="rgba(0,0,0,0.06)" stroke="#09090B" strokeWidth="1"
          animate={{ cx: currentPos.x, cy: currentPos.y, r: [8, 14, 8] }}
          transition={{ r: { duration: 1.5, repeat: Infinity }, cx: { duration: 0.8 }, cy: { duration: 0.8 } }} />

        {/* Sun (outside globe) */}
        {sunVisible && (
          <motion.g filter="url(#sunGlowG)"
            animate={{ x: sunX - cx, y: sunY - cy }}
            transition={{ duration: 1, ease: 'easeInOut' }}>
            <circle cx={cx} cy={cy} r="8" fill="#09090B" />
            {[0,60,120,180,240,300].map(deg => {
              const a = (deg * Math.PI) / 180;
              return <line key={deg}
                x1={cx + 10 * Math.cos(a)} y1={cy + 10 * Math.sin(a)}
                x2={cx + 15 * Math.cos(a)} y2={cy + 15 * Math.sin(a)}
                stroke="#09090B" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />;
            })}
          </motion.g>
        )}

        {/* Night indicator */}
        {!sunVisible && (
          <text x={cx} y={cy + R + 16} textAnchor="middle"
            fill="rgba(148,163,184,0.6)" fontSize="9">Night segment</text>
        )}
      </svg>

      {/* Live stats */}
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span>Az <strong style={{ color: 'var(--text-primary)' }}>
          {Math.round(segmentAnalyses[tick]?.solarPosition.azimuth ?? 0)}°
        </strong></span>
        <span>Alt <strong style={{ color: sunVisible ? '#09090B' : 'var(--text-secondary)' }}>
          {Math.round(segmentAnalyses[tick]?.solarPosition.altitude ?? 0)}°
        </strong></span>
        <span>Seg <strong style={{ color: 'var(--text-primary)' }}>{tick + 1}/{segmentAnalyses.length}</strong></span>
      </div>
    </div>
  );
}
