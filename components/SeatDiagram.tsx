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

const RECOMMENDED = '#09090B';
const AVOID       = '#EF4444';
const NEUTRAL     = '#334155';
const BODY_FILL   = '#FAFAFA';
const BODY_STROKE = 'rgba(0,0,0,0.06)';
const WINDOW_FILL = 'rgba(56,189,248,0.2)';
const WINDOW_STK  = 'rgba(56,189,248,0.35)';

// Animated sun dot that orbits a semicircle arc to show sun position
function SunArc({ sunSide }: { sunSide: ExposureSide }) {
  // Map side to angle on a 0-180° arc (left=-90, right=90, front=0, rear=0, minimal=0)
  const angleMap: Record<ExposureSide, number> = {
    left: -70, right: 70, front: 0, rear: 170, minimal: 0,
  };
  const angle = angleMap[sunSide];
  const rad = (angle * Math.PI) / 180;
  const rx = 60;
  const ry = 30;
  const cx = 100;
  const cy = 28;
  const dotX = cx + rx * Math.sin(rad);
  const dotY = cy - ry * Math.cos(rad);

  const dirLabel: Record<ExposureSide, string> = {
    left: 'Sun from the LEFT',
    right: 'Sun from the RIGHT',
    front: 'Sun from the FRONT',
    rear: 'Sun from the REAR',
    minimal: 'Minimal sun exposure',
  };

  return (
    <div className="w-full flex flex-col items-center gap-1 mb-3">
      <svg viewBox="0 0 200 50" className="w-full max-w-[220px]" aria-hidden>
        {/* Arc track */}
        <ellipse
          cx={cx} cy={cy} rx={rx} ry={ry}
          fill="none"
          stroke="rgba(0,0,0,0.05)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
          clipPath="url(#topHalf)"
        />
        <defs>
          <clipPath id="topHalf">
            <rect x="0" y="0" width="200" height={cy} />
          </clipPath>
        </defs>
        {/* Arrow indicating forward */}
        <line x1={cx} y1={cy + 2} x2={cx} y2={cy + 16} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeLinecap="round" />
        <polygon points={`${cx},${cy + 20} ${cx - 4},${cy + 12} ${cx + 4},${cy + 12}`} fill="rgba(255,255,255,0.2)" />
        <text x={cx} y={cy + 32} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={7} fontWeight={500}>FWD</text>
        {/* Animated sun dot */}
        <motion.circle
          cx={dotX}
          cy={dotY}
          r={6}
          fill="#09090B"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5, type: 'spring' }}
          filter="url(#sunGlow)"
        />
        <defs>
          <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.13)' }}>
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      {/* Glow for recommended seats */}
      {isRecommended && (
        <motion.rect
          x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx={7}
          fill="none"
          stroke={RECOMMENDED}
          strokeWidth={1.5}
          opacity={0}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay }}
        />
      )}
      <rect
        x={x} y={y} width={w} height={h} rx={4}
        fill={
          isRecommended ? 'rgba(16,185,129,0.2)'
          : isAvoid     ? 'rgba(239,68,68,0.15)'
          : 'rgba(0,0,0,0.02)'
        }
        stroke={color}
        strokeWidth={isRecommended || isAvoid ? 1.5 : 1}
        strokeOpacity={isRecommended || isAvoid ? 1 : 0.3}
      />
      {label && (
        <text
          x={x + w / 2} y={y + h / 2 + 3.5}
          textAnchor="middle"
          fill={isRecommended ? RECOMMENDED : isAvoid ? AVOID : 'rgba(255,255,255,0.25)'}
          fontSize={8}
          fontWeight={600}
        >
          {label}
        </text>
      )}
    </motion.g>
  );
}

function CarDiagram({ recommendedSide, sunSide }: { recommendedSide: ExposureSide; sunSide: ExposureSide }) {
  const W = 200; const H = 310; const cx = W / 2;
  const leftColor  = recommendedSide === 'left'  ? RECOMMENDED : sunSide === 'left'  ? AVOID : NEUTRAL;
  const rightColor = recommendedSide === 'right' ? RECOMMENDED : sunSide === 'right' ? AVOID : NEUTRAL;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[180px]" aria-label="Car seat diagram">
      {/* Body */}
      <rect x={50} y={30} width={100} height={250} rx={22} fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth={1.5} />
      {/* Windshield */}
      <rect x={63} y={46} width={74} height={46} rx={8} fill={WINDOW_FILL} stroke={WINDOW_STK} strokeWidth={1} />
      {/* Rear window */}
      <rect x={63} y={218} width={74} height={38} rx={6} fill={WINDOW_FILL} stroke={WINDOW_STK} strokeWidth={1} />
      {/* Door outlines */}
      <rect x={50} y={105} width={100} height={55} rx={0} fill="rgba(255,255,255,0.01)" stroke="rgba(0,0,0,0.02)" strokeWidth={1} />
      <rect x={50} y={162} width={100} height={55} rx={0} fill="rgba(255,255,255,0.01)" stroke="rgba(0,0,0,0.02)" strokeWidth={1} />

      {/* Front seats */}
      <AnimatedSeat x={57} y={108} w={36} h={44} color={leftColor} label="FL" delay={0.1} />
      <AnimatedSeat x={107} y={108} w={36} h={44} color={rightColor} label="FR" delay={0.15} />
      {/* Rear seats */}
      <AnimatedSeat x={57} y={165} w={36} h={44} color={leftColor} label="RL" delay={0.2} />
      <AnimatedSeat x={107} y={165} w={36} h={44} color={rightColor} label="RR" delay={0.25} />

      {/* Labels */}
      <text x={cx} y={22} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={8} fontWeight={500}>FRONT</text>
      <text x={cx} y={300} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={8} fontWeight={500}>REAR</text>
      <text x={12} y={H/2+3} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={8} fontWeight={500} transform={`rotate(-90,12,${H/2})`}>LEFT</text>
      <text x={W-12} y={H/2+3} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={8} fontWeight={500} transform={`rotate(90,${W-12},${H/2})`}>RIGHT</text>
    </svg>
  );
}

function BusDiagram({ recommendedSide, sunSide }: { recommendedSide: ExposureSide; sunSide: ExposureSide }) {
  const W = 200; const H = 340; const cx = W / 2;
  const leftColor  = recommendedSide === 'left'  ? RECOMMENDED : sunSide === 'left'  ? AVOID : NEUTRAL;
  const rightColor = recommendedSide === 'right' ? RECOMMENDED : sunSide === 'right' ? AVOID : NEUTRAL;
  const rows = [80, 120, 160, 200, 240];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[180px]" aria-label="Bus seat diagram">
      <rect x={35} y={25} width={130} height={295} rx={14} fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth={1.5} />
      <rect x={47} y={35} width={106} height={32} rx={6} fill={WINDOW_FILL} stroke={WINDOW_STK} strokeWidth={1} />
      <rect x={47} y={298} width={106} height={14} rx={5} fill={WINDOW_FILL} />
      <line x1={cx} y1={72} x2={cx} y2={296} stroke="rgba(0,0,0,0.03)" strokeWidth={1.5} strokeDasharray="4 3" />
      {rows.map((rowY, i) => (
        <g key={i}>
          <AnimatedSeat x={42} y={rowY} w={54} h={28} color={leftColor} delay={0.1 + i * 0.05} />
          <AnimatedSeat x={104} y={rowY} w={54} h={28} color={rightColor} delay={0.13 + i * 0.05} />
        </g>
      ))}
      <text x={cx} y={20} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={8} fontWeight={500}>FRONT</text>
      <text x={cx} y={332} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={8} fontWeight={500}>REAR</text>
      <text x={10} y={H/2+3} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={8} fontWeight={500} transform={`rotate(-90,10,${H/2})`}>LEFT</text>
      <text x={W-10} y={H/2+3} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={8} fontWeight={500} transform={`rotate(90,${W-10},${H/2})`}>RIGHT</text>
    </svg>
  );
}

function TrainDiagram({ recommendedSide, sunSide }: { recommendedSide: ExposureSide; sunSide: ExposureSide }) {
  const W = 220; const H = 340; const cx = W / 2;
  const leftColor  = recommendedSide === 'left'  ? RECOMMENDED : sunSide === 'left'  ? AVOID : NEUTRAL;
  const rightColor = recommendedSide === 'right' ? RECOMMENDED : sunSide === 'right' ? AVOID : NEUTRAL;
  const rows = [70, 110, 170, 210, 260];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[200px]" aria-label="Train seat diagram">
      <rect x={30} y={28} width={160} height={290} rx={12} fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth={1.5} />
      {[55, 100, 155, 200, 245].slice(0, rows.length).map((wy, i) => (
        <g key={i}>
          <rect x={34} y={wy - 5} width={22} height={18} rx={3} fill={WINDOW_FILL} />
          <rect x={164} y={wy - 5} width={22} height={18} rx={3} fill={WINDOW_FILL} />
        </g>
      ))}
      <line x1={cx} y1={45} x2={cx} y2={310} stroke="rgba(0,0,0,0.03)" strokeWidth={2} strokeDasharray="5 3" />
      {rows.map((rowY, i) => (
        <g key={i}>
          <AnimatedSeat x={62} y={rowY} w={24} h={26} color={leftColor} delay={0.1 + i * 0.05} />
          <AnimatedSeat x={88} y={rowY} w={24} h={26} color={leftColor} delay={0.13 + i * 0.05} />
          <AnimatedSeat x={108} y={rowY} w={24} h={26} color={rightColor} delay={0.16 + i * 0.05} />
          <AnimatedSeat x={134} y={rowY} w={24} h={26} color={rightColor} delay={0.19 + i * 0.05} />
        </g>
      ))}
      <text x={cx} y={22} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={8} fontWeight={500}>FRONT</text>
      <text x={cx} y={334} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={8} fontWeight={500}>REAR</text>
      <text x={12} y={H/2+3} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={8} fontWeight={500} transform={`rotate(-90,12,${H/2})`}>LEFT</text>
      <text x={W-12} y={H/2+3} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={8} fontWeight={500} transform={`rotate(90,${W-12},${H/2})`}>RIGHT</text>
    </svg>
  );
}

function BikeDiagram({ sunSide }: { sunSide: ExposureSide }) {
  const W = 200; const H = 260; const cx = W / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[180px]" aria-label="Bicycle diagram">
      <circle cx={55} cy={200} r={36} fill="none" stroke={BODY_STROKE} strokeWidth={3} />
      <circle cx={55} cy={200} r={8} fill={BODY_STROKE} />
      <circle cx={145} cy={200} r={36} fill="none" stroke={BODY_STROKE} strokeWidth={3} />
      <circle cx={145} cy={200} r={8} fill={BODY_STROKE} />
      <polyline points="55,200 100,130 145,200" fill="none" stroke={BODY_STROKE} strokeWidth={3} strokeLinecap="round" />
      <line x1={100} y1={130} x2={115} y2={92} stroke={BODY_STROKE} strokeWidth={3} strokeLinecap="round" />
      <line x1={55} y1={200} x2={80} y2={130} stroke={BODY_STROKE} strokeWidth={3} strokeLinecap="round" />
      <line x1={80} y1={130} x2={100} y2={130} stroke={BODY_STROKE} strokeWidth={3} />
      <line x1={108} y1={90} x2={130} y2={87} stroke={BODY_STROKE} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={130} y1={87} x2={130} y2={98} stroke={BODY_STROKE} strokeWidth={2.5} strokeLinecap="round" />
      <rect x={72} y={127} width={22} height={6} rx={3} fill={RECOMMENDED} />
      <circle cx={100} cy={102} r={11} fill="rgba(100,116,139,0.6)" />
      <text x={cx} y={248} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={9} fontWeight={500}>Top-down view</text>
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
  return (
    <div
      className={cn('rounded-2xl overflow-hidden', className)}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
      >
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          Recommended Seat
        </span>
        {vehicleHeading !== undefined && (
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            Heading {Math.round(vehicleHeading)}°
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col items-center gap-4">
        {/* Sun arc indicator */}
        <SunArc sunSide={sunSide} />

        {/* Vehicle diagram */}
        <div className="flex justify-center">
          {vehicleType === 'car'   && <CarDiagram   recommendedSide={recommendedSide} sunSide={sunSide} />}
          {vehicleType === 'bus'   && <BusDiagram   recommendedSide={recommendedSide} sunSide={sunSide} />}
          {vehicleType === 'train' && <TrainDiagram recommendedSide={recommendedSide} sunSide={sunSide} />}
          {vehicleType === 'bike'  && <BikeDiagram  sunSide={sunSide} />}
        </div>

        {/* Badges */}
        <div className="flex gap-2 w-full">
          {vehicleType !== 'bike' ? (
            <>
              <div
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#09090B' }}
              >
                <span>✓</span>
                <span>Sit {recommendedSide}</span>
              </div>
              <div
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)', color: '#09090B' }}
              >
                <span>⚠</span>
                <span>Avoid {sunSide}</span>
              </div>
            </>
          ) : (
            <div
              className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#09090B' }}
            >
              Shield from sun on {sunSide}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
