'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { VehicleType } from '@/types';

/* ─── SVG vehicle illustrations ─────────────────────────────────────────────── */

function CarSVG({ color }: { color: string }) {
  return (
    <svg width="52" height="34" viewBox="0 0 52 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <rect x="4" y="14" width="44" height="14" rx="4" fill={color} opacity="0.9" />
      {/* Cabin */}
      <path d="M14 14 L17 6 L35 6 L38 14 Z" fill={color} opacity="0.7" />
      {/* Windshield */}
      <path d="M17.5 13 L19.5 7.5 L32.5 7.5 L34.5 13 Z" fill="rgba(0,0,0,0.12)" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
      {/* Side windows */}
      <rect x="20" y="8" width="5" height="4.5" rx="0.5" fill="rgba(0,0,0,0.10)" />
      <rect x="27" y="8" width="5" height="4.5" rx="0.5" fill="rgba(0,0,0,0.10)" />
      {/* Wheels */}
      <circle cx="13" cy="28" r="5" fill="rgba(0,0,0,0.7)" stroke={color} strokeWidth="1.5" />
      <circle cx="13" cy="28" r="2.5" fill={color} opacity="0.5" />
      <circle cx="39" cy="28" r="5" fill="rgba(0,0,0,0.7)" stroke={color} strokeWidth="1.5" />
      <circle cx="39" cy="28" r="2.5" fill={color} opacity="0.5" />
      {/* Headlights */}
      <rect x="44" y="16" width="3.5" height="2" rx="1" fill="rgba(0,0,0,0.45)" />
      <rect x="4.5" y="16" width="3.5" height="2" rx="1" fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

function BusSVG({ color }: { color: string }) {
  return (
    <svg width="58" height="34" viewBox="0 0 58 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <rect x="3" y="6" width="52" height="22" rx="3" fill={color} opacity="0.85" />
      {/* Front face */}
      <rect x="50" y="7" width="5" height="20" rx="2" fill={color} />
      {/* Windshield */}
      <rect x="50.5" y="8" width="3.5" height="8" rx="1" fill="rgba(0,0,0,0.12)" />
      {/* Windows row */}
      {[6, 14, 22, 30, 38].map((x) => (
        <rect key={x} x={x + 1} y={9} width={6} height={8} rx="1" fill="rgba(0,0,0,0.10)" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
      ))}
      {/* Door */}
      <rect x="6" y="18" width="7" height="9" rx="1" fill={color} opacity="0.6" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
      {/* Wheels */}
      <circle cx="13" cy="30" r="4" fill="rgba(0,0,0,0.7)" stroke={color} strokeWidth="1.5" />
      <circle cx="13" cy="30" r="1.8" fill={color} opacity="0.5" />
      <circle cx="45" cy="30" r="4" fill="rgba(0,0,0,0.7)" stroke={color} strokeWidth="1.5" />
      <circle cx="45" cy="30" r="1.8" fill={color} opacity="0.5" />
      {/* Headlight */}
      <rect x="51.5" y="18" width="2.5" height="2" rx="0.5" fill="rgba(0,0,0,0.45)" />
    </svg>
  );
}

function TrainSVG({ color }: { color: string }) {
  return (
    <svg width="58" height="34" viewBox="0 0 58 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <rect x="3" y="5" width="52" height="22" rx="4" fill={color} opacity="0.85" />
      {/* Nose */}
      <path d="M55 5 L55 27 Q58 16 55 5Z" fill={color} opacity="0.6" />
      {/* Cabin windows */}
      {[6, 16, 26, 36, 44].map((x) => (
        <rect key={x} x={x} y={9} width={8} height={7} rx="1.5" fill="rgba(0,0,0,0.12)" stroke="rgba(0,0,0,0.07)" strokeWidth="0.5" />
      ))}
      {/* Connector stripe */}
      <rect x="3" y="18" width="52" height="2" fill="rgba(0,0,0,0.2)" />
      {/* Rail track */}
      <rect x="0" y="29" width="58" height="2" rx="1" fill="rgba(0,0,0,0.08)" />
      {/* Wheels */}
      {[11, 25, 40].map((x) => (
        <React.Fragment key={x}>
          <circle cx={x} cy="29" r="3.5" fill="rgba(0,0,0,0.7)" stroke={color} strokeWidth="1.2" />
          <circle cx={x} cy="29" r="1.5" fill={color} opacity="0.5" />
        </React.Fragment>
      ))}
      {/* Headlight */}
      <circle cx="55" cy="16" r="2" fill="rgba(0,0,0,0.45)" />
      <circle cx="55" cy="16" r="3.5" fill="rgba(0,0,0,0.05)" />
    </svg>
  );
}

function BikeSVG({ color }: { color: string }) {
  return (
    <svg width="48" height="38" viewBox="0 0 48 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rear wheel */}
      <circle cx="11" cy="28" r="9" fill="none" stroke={color} strokeWidth="2" opacity="0.9" />
      <circle cx="11" cy="28" r="3" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
      {/* Spokes */}
      {[0, 60, 120].map((a) => (
        <line key={a}
          x1={11 + Math.cos((a * Math.PI) / 180) * 3}
          y1={28 + Math.sin((a * Math.PI) / 180) * 3}
          x2={11 + Math.cos((a * Math.PI) / 180) * 9}
          y2={28 + Math.sin((a * Math.PI) / 180) * 9}
          stroke={color} strokeWidth="1" opacity="0.5"
        />
      ))}
      {/* Front wheel */}
      <circle cx="37" cy="28" r="9" fill="none" stroke={color} strokeWidth="2" opacity="0.9" />
      <circle cx="37" cy="28" r="3" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
      {/* Frame */}
      <path d="M11 28 L24 18 L37 28" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M24 18 L30 10 L37 19" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M24 18 L24 28" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* Seat */}
      <rect x="20" y="17" width="8" height="2" rx="1" fill={color} opacity="0.8" />
      {/* Handlebars */}
      <rect x="28" y="9" width="5" height="2" rx="1" fill={color} opacity="0.8" />
      {/* Pedal */}
      <circle cx="24" cy="28" r="2.5" fill={color} opacity="0.5" />
    </svg>
  );
}

/* ─── Seat diagram ───────────────────────────────────────────────────────────── */

function SeatPreview({ type }: { type: VehicleType }) {
  const seatData: Record<VehicleType, { rows: number; cols: number; label: string }> = {
    car:   { rows: 2, cols: 2, label: '4 seats · 2×2' },
    bus:   { rows: 5, cols: 2, label: '20+ seats · multi-row' },
    train: { rows: 4, cols: 2, label: 'Compartment · 2+2' },
    bike:  { rows: 1, cols: 1, label: 'Solo rider' },
  };

  const { rows, cols, label } = seatData[type];

  return (
    <motion.div
      key={type}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-5 p-4 rounded-xl"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          Seat Layout
        </span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(0,0,0,0.13)', boxShadow: '0 0 6px rgba(0,0,0,0.09)' }} />
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Recommended</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-hover)' }} />
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Other seat</span>
        </div>
      </div>

      {/* Vehicle silhouette + seats */}
      <div className="flex justify-center">
        {type === 'bike' ? (
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.07)' }}
            >
              <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(0,0,0,0.13)' }} />
            </div>
            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>You</span>
          </div>
        ) : (
          <div
            className="inline-grid gap-1.5 p-3 rounded-lg"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {Array.from({ length: rows * cols }).map((_, idx) => {
              const isRecommended = idx % cols === 0; // left column = recommended (away from sun)
              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="w-6 h-6 rounded-sm flex items-center justify-center relative"
                  style={{
                    background: isRecommended
                      ? 'rgba(0,0,0,0.06)'
                      : 'var(--surface-3)',
                    border: isRecommended
                      ? '1px solid rgba(0,0,0,0.07)'
                      : '1px solid var(--border-subtle)',
                    boxShadow: isRecommended ? '0 0 8px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  {isRecommended && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: '#09090B' }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Vehicle card data ──────────────────────────────────────────────────────── */

interface VehicleOption {
  type: VehicleType;
  label: string;
  subtitle: string;
  accentColor: string;
  SvgComponent: React.FC<{ color: string }>;
}

const VEHICLES: VehicleOption[] = [
  { type: 'car',   label: 'Car',     subtitle: '4 seats',     accentColor: '#09090B', SvgComponent: CarSVG   },
  { type: 'bus',   label: 'Bus',     subtitle: 'Multi-row',   accentColor: '#09090B', SvgComponent: BusSVG   },
  { type: 'train', label: 'Train',   subtitle: 'Compartment', accentColor: '#09090B', SvgComponent: TrainSVG },
  { type: 'bike',  label: 'Bicycle', subtitle: 'Solo rider',  accentColor: '#09090B', SvgComponent: BikeSVG  },
];

/* ─── Props ──────────────────────────────────────────────────────────────────── */

interface VehicleSelectorProps {
  value: VehicleType;
  onChange: (type: VehicleType) => void;
  className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

export function VehicleSelector({ value, onChange, className }: VehicleSelectorProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* 2×2 grid of vehicle cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {VEHICLES.map((vehicle) => {
          const isSelected = value === vehicle.type;
          const { SvgComponent } = vehicle;

          return (
            <motion.button
              key={vehicle.type}
              type="button"
              onClick={() => onChange(vehicle.type)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="relative flex flex-col items-center gap-3 rounded-2xl p-4 text-center outline-none cursor-pointer select-none overflow-hidden"
              style={{
                background: isSelected ? '#09090B' : '#FFFFFF',
                border: isSelected ? '1px solid #09090B' : '1px solid rgba(0,0,0,0.09)',
                boxShadow: isSelected
                  ? '0 4px 20px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.12) inset'
                  : '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
              }}
              aria-pressed={isSelected}
              aria-label={vehicle.label}
            >
              {/* Top gloss highlight on selected */}
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 60%)',
                  }}
                />
              )}

              {/* SVG illustration */}
              <motion.div
                animate={isSelected ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center"
              >
                <SvgComponent color={isSelected ? 'rgba(255,255,255,0.9)' : '#3F3F46'} />
              </motion.div>

              {/* Labels */}
              <div className="flex flex-col gap-0.5">
                <span
                  className="text-sm font-semibold leading-tight"
                  style={{ color: isSelected ? '#FFFFFF' : '#09090B' }}
                >
                  {vehicle.label}
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: isSelected ? 'rgba(255,255,255,0.55)' : '#71717A' }}
                >
                  {vehicle.subtitle}
                </span>
              </div>

              {/* Selected checkmark */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Animated seat preview */}
      <AnimatePresence mode="wait">
        <SeatPreview key={value} type={value} />
      </AnimatePresence>
    </div>
  );
}
