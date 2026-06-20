'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { VehicleType, ExposureSide } from '@/types';

interface SeatDiagramProps {
  vehicleType: VehicleType;
  recommendedSide: ExposureSide;
  sunSide: ExposureSide;
  vehicleHeading?: number;
  className?: string;
}

const RECOMMENDED = '#22C55E';
const AVOID       = '#EF4444';
const NEUTRAL     = 'rgba(0,0,0,0.18)';
const BODY_FILL   = '#F1F5F9';
const BODY_STROKE = 'rgba(0,0,0,0.12)';
const WINDOW_FILL = 'rgba(147,197,253,0.28)';
const WINDOW_STK  = 'rgba(96,165,250,0.45)';
const LABEL_COLOR = 'rgba(0,0,0,0.38)';

function SunArc({ sunSide }: { sunSide: ExposureSide }) {
  const angleMap: Record<ExposureSide, number> = {
    left: -70, right: 70, front: 0, rear: 170, minimal: 0,
  };
  const angle = angleMap[sunSide];
  const rad = (angle * Math.PI) / 180;
  const rx = 60; const ry = 30;
  const cx = 100; const cy = 30;
  const dotX = cx + rx * Math.sin(rad);
  const dotY = cy - ry * Math.cos(rad);

  const dirLabel: Record<ExposureSide, string> = {
    left:    'Sun coming from the LEFT',
    right:   'Sun coming from the RIGHT',
    front:   'Sun coming from the FRONT',
    rear:    'Sun coming from the REAR',
    minimal: 'Minimal direct sun exposure',
  };

  return (
    <div className="w-full flex flex-col items-center gap-1.5 mb-2">
      <svg viewBox="0 0 200 60" className="w-full max-w-[240px]" aria-hidden>
        <defs>
          <clipPath id="topHalfClip">
            <rect x="0" y="0" width="200" height={cy} />
          </clipPath>
          <filter id="sunGlowFilter" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="60%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>
        </defs>

        {/* Dashed arc track */}
        <ellipse
          cx={cx} cy={cy} rx={rx} ry={ry}
          fill="none"
          stroke="rgba(0,0,0,0.10)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          clipPath="url(#topHalfClip)"
        />

        {/* Forward arrow */}
        <line x1={cx} y1={cy + 4} x2={cx} y2={cy + 20} stroke="rgba(0,0,0,0.22)" strokeWidth={1.5} strokeLinecap="round" />
        <polygon
          points={`${cx},${cy + 24} ${cx - 4},${cy + 16} ${cx + 4},${cy + 16}`}
          fill="rgba(0,0,0,0.22)"
        />
        <text x={cx} y={cy + 36} textAnchor="middle" fill="rgba(0,0,0,0.32)" fontSize={7.5} fontWeight={600} letterSpacing={1}>
          FWD
        </text>

        {/* Sun dot */}
        <motion.circle
          cx={dotX} cy={dotY} r={7}
          fill="url(#sunGrad)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 300 }}
          filter="url(#sunGlowFilter)"
        />
        {/* Sun rays */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i * 60 * Math.PI) / 180;
          return (
            <motion.line
              key={i}
              x1={dotX + Math.cos(a) * 9}
              y1={dotY + Math.sin(a) * 9}
              x2={dotX + Math.cos(a) * 13}
              y2={dotY + Math.sin(a) * 13}
              stroke="#F59E0B"
              strokeWidth={1.5}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ delay: 0.5 + i * 0.05, duration: 1.5, repeat: Infinity }}
            />
          );
        })}
      </svg>

      <p
        className="text-[11px] font-bold uppercase tracking-wider text-center"
        style={{ color: 'rgba(0,0,0,0.50)' }}
      >
        {dirLabel[sunSide]}
      </p>
    </div>
  );
}

function AnimatedSeat({
  x, y, w, h, color, label, delay,
}: {
  x: number; y: number; w: number; h: number; color: string; label?: string; delay: number;
}) {
  const isRecommended = color === RECOMMENDED;
  const isAvoid = color === AVOID;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.35, type: 'spring', stiffness: 300, damping: 24 }}
      style={{ transformOrigin: `${x + w / 2}px ${y + h / 2}px` }}
    >
      {isRecommended && (
        <motion.rect
          x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx={8}
          fill="none"
          stroke={RECOMMENDED}
          strokeWidth={1.5}
          opacity={0}
          animate={{ opacity: [0, 0.55, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay }}
        />
      )}
      <rect
        x={x} y={y} width={w} height={h} rx={5}
        fill={
          isRecommended ? 'rgba(34,197,94,0.32)'
          : isAvoid     ? 'rgba(239,68,68,0.22)'
          : 'rgba(0,0,0,0.04)'
        }
        stroke={color}
        strokeWidth={isRecommended ? 2 : isAvoid ? 1.5 : 0.8}
        strokeOpacity={isRecommended ? 1 : isAvoid ? 0.85 : 0.4}
      />
      {label && (
        <text
          x={x + w / 2} y={y + h / 2 + 3.5}
          textAnchor="middle"
          fill={isRecommended ? '#15803D' : isAvoid ? '#B91C1C' : 'rgba(0,0,0,0.28)'}
          fontSize={7.5}
          fontWeight={700}
        >
          {label}
        </text>
      )}
    </motion.g>
  );
}

function ColumnHeader({ x, w, y, color, label }: { x: number; w: number; y: number; color: string; label: string }) {
  return (
    <g>
      <rect x={x - 2} y={y - 14} width={w + 4} height={13} rx={4}
        fill={color === RECOMMENDED ? 'rgba(34,197,94,0.18)' : color === AVOID ? 'rgba(239,68,68,0.13)' : 'rgba(0,0,0,0.05)'}
        stroke={color === RECOMMENDED ? 'rgba(34,197,94,0.35)' : color === AVOID ? 'rgba(239,68,68,0.30)' : 'rgba(0,0,0,0.10)'}
        strokeWidth={1}
      />
      <text x={x + w / 2} y={y - 5.5} textAnchor="middle"
        fill={color === RECOMMENDED ? '#16A34A' : color === AVOID ? '#DC2626' : 'rgba(0,0,0,0.40)'}
        fontSize={7} fontWeight={700} letterSpacing={0.5}
      >
        {label}
      </text>
    </g>
  );
}

function CarDiagram({ recommendedSide, sunSide }: { recommendedSide: ExposureSide; sunSide: ExposureSide }) {
  const W = 200; const H = 320; const cx = W / 2;
  const leftColor  = recommendedSide === 'left'  ? RECOMMENDED : sunSide === 'left'  ? AVOID : NEUTRAL;
  const rightColor = recommendedSide === 'right' ? RECOMMENDED : sunSide === 'right' ? AVOID : NEUTRAL;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[190px]" aria-label="Car seat diagram">
      {/* Column headers */}
      <ColumnHeader x={54} w={40} y={100} color={leftColor} label={leftColor === RECOMMENDED ? '✓ SIT' : leftColor === AVOID ? 'AVOID' : 'LEFT'} />
      <ColumnHeader x={106} w={40} y={100} color={rightColor} label={rightColor === RECOMMENDED ? '✓ SIT' : rightColor === AVOID ? 'AVOID' : 'RIGHT'} />

      {/* Body */}
      <rect x={48} y={30} width={104} height={260} rx={24} fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth={1.5} />
      {/* Windshield */}
      <rect x={63} y={48} width={74} height={48} rx={9} fill={WINDOW_FILL} stroke={WINDOW_STK} strokeWidth={1} />
      {/* Rear window */}
      <rect x={63} y={224} width={74} height={40} rx={7} fill={WINDOW_FILL} stroke={WINDOW_STK} strokeWidth={1} />
      {/* Door lines */}
      <line x1={48} y1={165} x2={152} y2={165} stroke="rgba(0,0,0,0.06)" strokeWidth={1} strokeDasharray="3 3" />

      {/* Front seats */}
      <AnimatedSeat x={54} y={108} w={40} h={46} color={leftColor}  label="FL" delay={0.10} />
      <AnimatedSeat x={106} y={108} w={40} h={46} color={rightColor} label="FR" delay={0.15} />
      {/* Rear seats */}
      <AnimatedSeat x={54} y={168} w={40} h={46} color={leftColor}  label="RL" delay={0.20} />
      <AnimatedSeat x={106} y={168} w={40} h={46} color={rightColor} label="RR" delay={0.25} />

      {/* Orientation labels */}
      <text x={cx} y={24} textAnchor="middle" fill={LABEL_COLOR} fontSize={8.5} fontWeight={600}>FRONT</text>
      <text x={cx} y={308} textAnchor="middle" fill={LABEL_COLOR} fontSize={8.5} fontWeight={600}>REAR</text>
      <text x={14} y={H / 2 + 3} textAnchor="middle" fill={LABEL_COLOR} fontSize={8} fontWeight={600}
        transform={`rotate(-90,14,${H / 2})`}>LEFT</text>
      <text x={W - 14} y={H / 2 + 3} textAnchor="middle" fill={LABEL_COLOR} fontSize={8} fontWeight={600}
        transform={`rotate(90,${W - 14},${H / 2})`}>RIGHT</text>
    </svg>
  );
}

function BusDiagram({ recommendedSide, sunSide }: { recommendedSide: ExposureSide; sunSide: ExposureSide }) {
  const W = 200; const H = 355; const cx = W / 2;
  const leftColor  = recommendedSide === 'left'  ? RECOMMENDED : sunSide === 'left'  ? AVOID : NEUTRAL;
  const rightColor = recommendedSide === 'right' ? RECOMMENDED : sunSide === 'right' ? AVOID : NEUTRAL;
  const rows = [92, 135, 178, 221, 264];
  const seatW = 56;
  const lx = 40; const rx = 104;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[190px]" aria-label="Bus seat diagram">
      {/* Column headers */}
      <ColumnHeader x={lx} w={seatW} y={82} color={leftColor}
        label={leftColor === RECOMMENDED ? '✓ SIT' : leftColor === AVOID ? 'AVOID' : 'LEFT'} />
      <ColumnHeader x={rx} w={seatW} y={82} color={rightColor}
        label={rightColor === RECOMMENDED ? '✓ SIT' : rightColor === AVOID ? 'AVOID' : 'RIGHT'} />

      {/* Body */}
      <rect x={33} y={28} width={134} height={310} rx={16} fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth={1.5} />
      {/* Windshield */}
      <rect x={46} y={38} width={108} height={30} rx={7} fill={WINDOW_FILL} stroke={WINDOW_STK} strokeWidth={1} />
      {/* Rear panel */}
      <rect x={46} y={308} width={108} height={18} rx={6} fill={WINDOW_FILL} stroke={WINDOW_STK} strokeWidth={1} />
      {/* Center aisle */}
      <line x1={cx} y1={74} x2={cx} y2={308} stroke="rgba(0,0,0,0.05)" strokeWidth={2} strokeDasharray="5 4" />

      {rows.map((rowY, i) => (
        <g key={i}>
          <AnimatedSeat x={lx} y={rowY} w={seatW} h={30} color={leftColor}  delay={0.10 + i * 0.06} />
          <AnimatedSeat x={rx} y={rowY} w={seatW} h={30} color={rightColor} delay={0.13 + i * 0.06} />
        </g>
      ))}

      {/* Orientation labels */}
      <text x={cx} y={22} textAnchor="middle" fill={LABEL_COLOR} fontSize={8.5} fontWeight={600}>FRONT</text>
      <text x={cx} y={346} textAnchor="middle" fill={LABEL_COLOR} fontSize={8.5} fontWeight={600}>REAR</text>
      <text x={10} y={H / 2 + 3} textAnchor="middle" fill={LABEL_COLOR} fontSize={8} fontWeight={600}
        transform={`rotate(-90,10,${H / 2})`}>LEFT</text>
      <text x={W - 10} y={H / 2 + 3} textAnchor="middle" fill={LABEL_COLOR} fontSize={8} fontWeight={600}
        transform={`rotate(90,${W - 10},${H / 2})`}>RIGHT</text>
    </svg>
  );
}

function TrainDiagram({ recommendedSide, sunSide }: { recommendedSide: ExposureSide; sunSide: ExposureSide }) {
  const W = 220; const H = 355; const cx = W / 2;
  const leftColor  = recommendedSide === 'left'  ? RECOMMENDED : sunSide === 'left'  ? AVOID : NEUTRAL;
  const rightColor = recommendedSide === 'right' ? RECOMMENDED : sunSide === 'right' ? AVOID : NEUTRAL;
  const rows = [86, 128, 186, 228, 278];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[210px]" aria-label="Train seat diagram">
      {/* Column headers */}
      <ColumnHeader x={60} w={50} y={76} color={leftColor}
        label={leftColor === RECOMMENDED ? '✓ SIT' : leftColor === AVOID ? 'AVOID' : 'LEFT'} />
      <ColumnHeader x={110} w={50} y={76} color={rightColor}
        label={rightColor === RECOMMENDED ? '✓ SIT' : rightColor === AVOID ? 'AVOID' : 'RIGHT'} />

      {/* Body */}
      <rect x={28} y={28} width={164} height={308} rx={14} fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth={1.5} />

      {/* Side windows */}
      {rows.map((wy, i) => (
        <g key={i}>
          <rect x={32} y={wy - 4} width={22} height={20} rx={4} fill={WINDOW_FILL} stroke={WINDOW_STK} strokeWidth={0.8} />
          <rect x={166} y={wy - 4} width={22} height={20} rx={4} fill={WINDOW_FILL} stroke={WINDOW_STK} strokeWidth={0.8} />
        </g>
      ))}

      {/* Center aisle */}
      <line x1={cx} y1={48} x2={cx} y2={330} stroke="rgba(0,0,0,0.06)" strokeWidth={2} strokeDasharray="6 4" />

      {rows.map((rowY, i) => (
        <g key={i}>
          <AnimatedSeat x={60}  y={rowY} w={24} h={28} color={leftColor}  delay={0.10 + i * 0.05} />
          <AnimatedSeat x={86}  y={rowY} w={24} h={28} color={leftColor}  delay={0.13 + i * 0.05} />
          <AnimatedSeat x={110} y={rowY} w={24} h={28} color={rightColor} delay={0.16 + i * 0.05} />
          <AnimatedSeat x={136} y={rowY} w={24} h={28} color={rightColor} delay={0.19 + i * 0.05} />
        </g>
      ))}

      {/* Orientation labels */}
      <text x={cx} y={22} textAnchor="middle" fill={LABEL_COLOR} fontSize={8.5} fontWeight={600}>FRONT</text>
      <text x={cx} y={348} textAnchor="middle" fill={LABEL_COLOR} fontSize={8.5} fontWeight={600}>REAR</text>
      <text x={12} y={H / 2 + 3} textAnchor="middle" fill={LABEL_COLOR} fontSize={8} fontWeight={600}
        transform={`rotate(-90,12,${H / 2})`}>LEFT</text>
      <text x={W - 12} y={H / 2 + 3} textAnchor="middle" fill={LABEL_COLOR} fontSize={8} fontWeight={600}
        transform={`rotate(90,${W - 12},${H / 2})`}>RIGHT</text>
    </svg>
  );
}

function BikeDiagram({ sunSide }: { sunSide: ExposureSide }) {
  const W = 200; const H = 270; const cx = W / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[190px]" aria-label="Bicycle diagram">
      <circle cx={55} cy={205} r={38} fill="none" stroke={BODY_STROKE} strokeWidth={3} />
      <circle cx={55} cy={205} r={9} fill={BODY_STROKE} />
      <circle cx={145} cy={205} r={38} fill="none" stroke={BODY_STROKE} strokeWidth={3} />
      <circle cx={145} cy={205} r={9} fill={BODY_STROKE} />
      <polyline points="55,205 100,132 145,205" fill="none" stroke={BODY_STROKE} strokeWidth={3} strokeLinecap="round" />
      <line x1={100} y1={132} x2={116} y2={92} stroke={BODY_STROKE} strokeWidth={3} strokeLinecap="round" />
      <line x1={55} y1={205} x2={80} y2={132} stroke={BODY_STROKE} strokeWidth={3} strokeLinecap="round" />
      <line x1={80} y1={132} x2={100} y2={132} stroke={BODY_STROKE} strokeWidth={3} />
      <line x1={108} y1={90} x2={130} y2={87} stroke={BODY_STROKE} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={130} y1={87} x2={130} y2={99} stroke={BODY_STROKE} strokeWidth={2.5} strokeLinecap="round" />
      <rect x={72} y={128} width={22} height={7} rx={3.5} fill={RECOMMENDED} />
      <circle cx={100} cy={105} r={13} fill="rgba(100,116,139,0.55)" />
      <text x={cx} y={255} textAnchor="middle" fill={LABEL_COLOR} fontSize={9.5} fontWeight={500}>Top-down view</text>
    </svg>
  );
}

export function SeatDiagram({
  vehicleType,
  recommendedSide,
  sunSide,
  vehicleHeading,
  className,
}: SeatDiagramProps) {
  const isDefiniteSide = recommendedSide === 'left' || recommendedSide === 'right';

  return (
    <div
      className={cn('rounded-2xl overflow-hidden', className)}
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          background: 'rgba(0,0,0,0.01)',
        }}
      >
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--text-secondary)' }}
        >
          Recommended Seat
        </span>
        {vehicleHeading !== undefined && (
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
            Heading {Math.round(vehicleHeading)}°
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col items-center gap-4">
        {/* Sun position arc */}
        <SunArc sunSide={sunSide} />

        {/* Vehicle diagram */}
        <div className="flex justify-center w-full">
          {vehicleType === 'car'   && <CarDiagram   recommendedSide={recommendedSide} sunSide={sunSide} />}
          {vehicleType === 'bus'   && <BusDiagram   recommendedSide={recommendedSide} sunSide={sunSide} />}
          {vehicleType === 'train' && <TrainDiagram recommendedSide={recommendedSide} sunSide={sunSide} />}
          {vehicleType === 'bike'  && <BikeDiagram  sunSide={sunSide} />}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(34,197,94,0.30)', border: '1.5px solid #22C55E' }} />
            <span>Recommended</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(239,68,68,0.20)', border: '1.5px solid #EF4444' }} />
            <span>Avoid (sun side)</span>
          </div>
        </div>

        {/* Action badges */}
        {vehicleType !== 'bike' ? (
          <div className="w-full flex flex-col gap-2">
            {/* Primary: Sit here */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4, type: 'spring' }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #16A34A, #22C55E)',
                boxShadow: '0 4px 16px rgba(34,197,94,0.30)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="rgba(255,255,255,0.25)" />
                <path d="M5 8.5L7 10.5L11 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span
                className="text-sm font-bold tracking-wide"
                style={{ color: '#FFFFFF' }}
              >
                {isDefiniteSide
                  ? `Sit on the ${recommendedSide.toUpperCase()} side`
                  : `Minimal sun — any seat is fine`}
              </span>
            </motion.div>

            {/* Secondary: Avoid */}
            <div
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.20)',
                color: '#DC2626',
              }}
            >
              <span>⚠</span>
              <span>Avoid the {sunSide} side — direct sun</span>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #16A34A, #22C55E)',
              boxShadow: '0 4px 16px rgba(34,197,94,0.25)',
            }}
          >
            <span className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
              Shield yourself from the {sunSide} side
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
