'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { VehicleType, ExposureSide } from '@/types';

interface SeatDiagramProps {
  vehicleType: VehicleType;
  recommendedSide: ExposureSide;
  sunSide: ExposureSide;
  vehicleHeading?: number;
  className?: string;
}

// Colors
const RECOMMENDED = '#10B981'; // emerald
const AVOID = '#EF4444';       // red
const NEUTRAL = '#94A3B8';     // slate-400
const SEAT_BG = '#E2E8F0';     // slate-200
const BODY_FILL = '#1E293B';   // slate-800
const BODY_STROKE = '#334155'; // slate-700

function SunIcon({ x, y, size = 22 }: { x: number; y: number; size?: number }) {
  const r = size / 2;
  const rays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 8;
    const innerR = r + 4;
    const outerR = r + 9;
    return {
      x1: x + Math.cos(angle) * innerR,
      y1: y + Math.sin(angle) * innerR,
      x2: x + Math.cos(angle) * outerR,
      y2: y + Math.sin(angle) * outerR,
    };
  });

  return (
    <g>
      <circle cx={x} cy={y} r={r + 14} fill="#FEF3C7" fillOpacity={0.3} />
      {rays.map((ray, i) => (
        <line
          key={i}
          x1={ray.x1}
          y1={ray.y1}
          x2={ray.x2}
          y2={ray.y2}
          stroke="#F59E0B"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${x} ${y}`}
            to={`360 ${x} ${y}`}
            dur="8s"
            repeatCount="indefinite"
          />
        </line>
      ))}
      <circle cx={x} cy={y} r={r} fill="#FBBF24" />
      <circle cx={x} cy={y} r={r} fill="#F59E0B" fillOpacity={0.6} />
    </g>
  );
}

function SeatRect({
  x,
  y,
  w,
  h,
  color,
  label,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  label?: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill={color}
        fillOpacity={color === SEAT_BG ? 1 : 0.25}
        stroke={color}
        strokeWidth={1.5}
      />
      {label && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 4}
          textAnchor="middle"
          fill={color === SEAT_BG ? NEUTRAL : color}
          fontSize={9}
          fontWeight={600}
        >
          {label}
        </text>
      )}
    </g>
  );
}

function CarDiagram({
  recommendedSide,
  sunSide,
}: {
  recommendedSide: ExposureSide;
  sunSide: ExposureSide;
}) {
  const W = 200;
  const H = 320;
  const cx = W / 2;

  const leftColor = recommendedSide === 'left' ? RECOMMENDED : sunSide === 'left' ? AVOID : NEUTRAL;
  const rightColor = recommendedSide === 'right' ? RECOMMENDED : sunSide === 'right' ? AVOID : NEUTRAL;

  const sunX = sunSide === 'left' ? 22 : sunSide === 'right' ? W - 22 : cx;
  const sunY = sunSide === 'front' ? 22 : sunSide === 'rear' ? H - 22 : H / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[180px]" aria-label="Car seat diagram">
      {/* Car body */}
      <rect x={50} y={30} width={100} height={260} rx={20} fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth={2} />
      {/* Windshield */}
      <rect x={62} y={45} width={76} height={50} rx={8} fill="#38BDF8" fillOpacity={0.4} stroke="#38BDF8" strokeOpacity={0.6} strokeWidth={1} />
      {/* Rear window */}
      <rect x={62} y={225} width={76} height={40} rx={6} fill="#38BDF8" fillOpacity={0.4} stroke="#38BDF8" strokeOpacity={0.6} strokeWidth={1} />

      {/* Front seats */}
      <SeatRect x={58} y={110} w={36} h={44} color={leftColor} label="FL" />
      <SeatRect x={106} y={110} w={36} h={44} color={rightColor} label="FR" />

      {/* Rear seats */}
      <SeatRect x={58} y={168} w={36} h={44} color={leftColor} label="RL" />
      <SeatRect x={106} y={168} w={36} h={44} color={rightColor} label="RR" />

      {/* Direction labels */}
      <text x={cx} y={24} textAnchor="middle" fill="#94A3B8" fontSize={9} fontWeight={500}>FRONT</text>
      <text x={cx} y={310} textAnchor="middle" fill="#94A3B8" fontSize={9} fontWeight={500}>REAR</text>
      <text x={14} y={H / 2 + 4} textAnchor="middle" fill="#94A3B8" fontSize={9} fontWeight={500} transform={`rotate(-90, 14, ${H / 2})`}>LEFT</text>
      <text x={W - 14} y={H / 2 + 4} textAnchor="middle" fill="#94A3B8" fontSize={9} fontWeight={500} transform={`rotate(90, ${W - 14}, ${H / 2})`}>RIGHT</text>

      <SunIcon x={sunX} y={sunY} />
    </svg>
  );
}

function BusDiagram({
  recommendedSide,
  sunSide,
}: {
  recommendedSide: ExposureSide;
  sunSide: ExposureSide;
}) {
  const W = 200;
  const H = 340;
  const cx = W / 2;

  const leftColor = recommendedSide === 'left' ? RECOMMENDED : sunSide === 'left' ? AVOID : NEUTRAL;
  const rightColor = recommendedSide === 'right' ? RECOMMENDED : sunSide === 'right' ? AVOID : NEUTRAL;

  const rows = [80, 120, 160, 200, 240];
  const sunX = sunSide === 'left' ? 20 : sunSide === 'right' ? W - 20 : cx;
  const sunY = sunSide === 'front' ? 22 : sunSide === 'rear' ? H - 22 : H / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[180px]" aria-label="Bus seat diagram">
      {/* Bus body */}
      <rect x={35} y={25} width={130} height={295} rx={14} fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth={2} />
      {/* Windshield */}
      <rect x={47} y={35} width={106} height={35} rx={6} fill="#38BDF8" fillOpacity={0.35} stroke="#38BDF8" strokeOpacity={0.5} strokeWidth={1} />
      {/* Rear */}
      <rect x={47} y={298} width={106} height={15} rx={5} fill="#38BDF8" fillOpacity={0.25} />

      {/* Aisle marking */}
      <line x1={cx} y1={75} x2={cx} y2={295} stroke="#334155" strokeWidth={1.5} strokeDasharray="4 3" />

      {/* Seat rows */}
      {rows.map((rowY, i) => (
        <g key={i}>
          <SeatRect x={42} y={rowY} w={54} h={28} color={leftColor} />
          <SeatRect x={104} y={rowY} w={54} h={28} color={rightColor} />
        </g>
      ))}

      <text x={cx} y={20} textAnchor="middle" fill="#94A3B8" fontSize={9} fontWeight={500}>FRONT</text>
      <text x={cx} y={332} textAnchor="middle" fill="#94A3B8" fontSize={9} fontWeight={500}>REAR</text>
      <text x={10} y={H / 2 + 4} textAnchor="middle" fill="#94A3B8" fontSize={9} fontWeight={500} transform={`rotate(-90, 10, ${H / 2})`}>LEFT</text>
      <text x={W - 10} y={H / 2 + 4} textAnchor="middle" fill="#94A3B8" fontSize={9} fontWeight={500} transform={`rotate(90, ${W - 10}, ${H / 2})`}>RIGHT</text>

      <SunIcon x={sunX} y={sunY} />
    </svg>
  );
}

function TrainDiagram({
  recommendedSide,
  sunSide,
}: {
  recommendedSide: ExposureSide;
  sunSide: ExposureSide;
}) {
  const W = 220;
  const H = 340;
  const cx = W / 2;

  const leftColor = recommendedSide === 'left' ? RECOMMENDED : sunSide === 'left' ? AVOID : NEUTRAL;
  const rightColor = recommendedSide === 'right' ? RECOMMENDED : sunSide === 'right' ? AVOID : NEUTRAL;

  const rows = [70, 110, 170, 210, 260];
  const sunX = sunSide === 'left' ? 20 : sunSide === 'right' ? W - 20 : cx;
  const sunY = sunSide === 'front' ? 22 : sunSide === 'rear' ? H - 22 : H / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[200px]" aria-label="Train seat diagram">
      {/* Train body */}
      <rect x={30} y={28} width={160} height={290} rx={12} fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth={2} />
      {/* Windows strip */}
      <rect x={30} y={28} width={30} height={290} rx={0} fill="#0F172A" fillOpacity={0.6} />
      <rect x={160} y={28} width={30} height={290} rx={0} fill="#0F172A" fillOpacity={0.6} />

      {/* Window panes */}
      {[55, 100, 155, 200, 245].slice(0, rows.length).map((wy, i) => (
        <g key={i}>
          <rect x={34} y={wy - 5} width={22} height={20} rx={3} fill="#38BDF8" fillOpacity={0.3} />
          <rect x={164} y={wy - 5} width={22} height={20} rx={3} fill="#38BDF8" fillOpacity={0.3} />
        </g>
      ))}

      {/* Aisle */}
      <line x1={cx} y1={50} x2={cx} y2={310} stroke="#334155" strokeWidth={2} strokeDasharray="5 3" />

      {/* Seats — 2 per side */}
      {rows.map((rowY, i) => (
        <g key={i}>
          <SeatRect x={62} y={rowY} w={24} h={26} color={leftColor} />
          <SeatRect x={88} y={rowY} w={24} h={26} color={leftColor} />
          <SeatRect x={108} y={rowY} w={24} h={26} color={rightColor} />
          <SeatRect x={134} y={rowY} w={24} h={26} color={rightColor} />
        </g>
      ))}

      <text x={cx} y={22} textAnchor="middle" fill="#94A3B8" fontSize={9} fontWeight={500}>FRONT</text>
      <text x={cx} y={334} textAnchor="middle" fill="#94A3B8" fontSize={9} fontWeight={500}>REAR</text>
      <text x={12} y={H / 2 + 4} textAnchor="middle" fill="#94A3B8" fontSize={9} fontWeight={500} transform={`rotate(-90, 12, ${H / 2})`}>LEFT</text>
      <text x={W - 12} y={H / 2 + 4} textAnchor="middle" fill="#94A3B8" fontSize={9} fontWeight={500} transform={`rotate(90, ${W - 12}, ${H / 2})`}>RIGHT</text>

      <SunIcon x={sunX} y={sunY} />
    </svg>
  );
}

function BikeDiagram({ sunSide }: { sunSide: ExposureSide }) {
  const W = 200;
  const H = 280;
  const cx = W / 2;
  const sunX = sunSide === 'left' ? 22 : sunSide === 'right' ? W - 22 : cx;
  const sunY = sunSide === 'front' ? 24 : sunSide === 'rear' ? H - 24 : H / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[180px]" aria-label="Bicycle seat diagram">
      {/* Wheels */}
      <circle cx={55} cy={210} r={36} fill="none" stroke={BODY_STROKE} strokeWidth={4} />
      <circle cx={55} cy={210} r={8} fill={BODY_STROKE} />
      <circle cx={145} cy={210} r={36} fill="none" stroke={BODY_STROKE} strokeWidth={4} />
      <circle cx={145} cy={210} r={8} fill={BODY_STROKE} />

      {/* Frame */}
      <polyline points="55,210 100,140 145,210" fill="none" stroke={BODY_STROKE} strokeWidth={4} strokeLinecap="round" />
      <line x1={100} y1={140} x2={115} y2={100} stroke={BODY_STROKE} strokeWidth={4} strokeLinecap="round" />
      <line x1={55} y1={210} x2={80} y2={140} stroke={BODY_STROKE} strokeWidth={4} strokeLinecap="round" />
      <line x1={80} y1={140} x2={100} y2={140} stroke={BODY_STROKE} strokeWidth={4} />

      {/* Handlebar */}
      <line x1={108} y1={98} x2={130} y2={95} stroke={BODY_STROKE} strokeWidth={3} strokeLinecap="round" />
      <line x1={130} y1={95} x2={130} y2={106} stroke={BODY_STROKE} strokeWidth={3} strokeLinecap="round" />

      {/* Seat */}
      <rect x={72} y={135} width={22} height={6} rx={3} fill={RECOMMENDED} />

      {/* Rider silhouette */}
      <circle cx={100} cy={108} r={12} fill="#64748B" />
      <path d="M 100 120 Q 108 145 115 165 Q 108 150 90 155 Q 78 148 83 140 Z" fill="#64748B" />

      <text x={cx} y={260} textAnchor="middle" fill="#94A3B8" fontSize={10} fontWeight={500}>
        Rider position shown top-down
      </text>

      <SunIcon x={sunX} y={sunY} />
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
  const headingLabel = vehicleHeading !== undefined
    ? `Vehicle heading: ${Math.round(vehicleHeading)}°`
    : undefined;

  const sideColorMap: Record<ExposureSide, string> = {
    left: 'text-emerald-500',
    right: 'text-sky-500',
    front: 'text-amber-500',
    rear: 'text-slate-400',
    minimal: 'text-emerald-500',
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-emerald-500 opacity-30 border border-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Recommended</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-500 opacity-30 border border-red-500" />
          <span className="text-red-600 dark:text-red-400 font-medium">Avoid (sun side)</span>
        </span>
      </div>

      {/* Diagram */}
      <div className="flex justify-center">
        {vehicleType === 'car' && (
          <CarDiagram recommendedSide={recommendedSide} sunSide={sunSide} />
        )}
        {vehicleType === 'bus' && (
          <BusDiagram recommendedSide={recommendedSide} sunSide={sunSide} />
        )}
        {vehicleType === 'train' && (
          <TrainDiagram recommendedSide={recommendedSide} sunSide={sunSide} />
        )}
        {vehicleType === 'bike' && (
          <BikeDiagram sunSide={sunSide} />
        )}
      </div>

      {/* Recommendation label */}
      <div className="text-center space-y-1">
        {vehicleType === 'bike' ? (
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Solo rider — shield from sun directly
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Sit on the{' '}
              <span className={cn('font-bold', sideColorMap[recommendedSide])}>
                {recommendedSide}
              </span>
              {' '}side
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sun is on the{' '}
              <span className="font-medium text-amber-600 dark:text-amber-400">{sunSide}</span>
            </p>
          </>
        )}
        {headingLabel && (
          <p className="text-xs text-slate-400 dark:text-slate-500">{headingLabel}</p>
        )}
      </div>
    </div>
  );
}
