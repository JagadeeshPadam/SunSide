import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { VehicleType, ExposureSide } from '@/types';

// ─── Tailwind / className ─────────────────────────────────────────────────────

/**
 * Merge class names with Tailwind conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Date / Time formatting ───────────────────────────────────────────────────

/**
 * Format a Date to "09:30 AM" (12-hour clock).
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a Date to "Mon, Jun 16".
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Vehicle ──────────────────────────────────────────────────────────────────

const VEHICLE_ICONS: Record<VehicleType, string> = {
  car: '🚗',
  bus: '🚌',
  train: '🚆',
  bike: '🚲',
};

/**
 * Return the emoji icon for a vehicle type.
 */
export function getVehicleIcon(type: VehicleType): string {
  return VEHICLE_ICONS[type] ?? '🚗';
}

// ─── Exposure side ────────────────────────────────────────────────────────────

const EXPOSURE_LABELS: Record<ExposureSide, string> = {
  left: 'Left side',
  right: 'Right side',
  front: 'Front of vehicle',
  rear: 'Rear of vehicle',
  minimal: 'Minimal / no direct sun',
};

/**
 * Human-readable label for an exposure side.
 */
export function getExposureSideLabel(side: ExposureSide): string {
  return EXPOSURE_LABELS[side] ?? side;
}

// ─── Exposure colour ──────────────────────────────────────────────────────────

/**
 * Map an exposure score (0–100) to a hex colour.
 *
 * Colour ramp:
 *   0–33  → green  (#22c55e)
 *   34–66 → yellow (#eab308)
 *   67–100→ red    (#ef4444)
 *
 * Values in between are linearly interpolated.
 */
export function getExposureColor(score: number): string {
  const clamped = Math.max(0, Math.min(100, score));

  // Helper: interpolate between two hex colours
  function hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  }

  function interpolate(
    a: [number, number, number],
    b: [number, number, number],
    t: number,
  ): string {
    const r = Math.round(a[0] + (b[0] - a[0]) * t);
    const g = Math.round(a[1] + (b[1] - a[1]) * t);
    const bv = Math.round(a[2] + (b[2] - a[2]) * t);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bv.toString(16).padStart(2, '0')}`;
  }

  const green: [number, number, number] = hexToRgb('#22c55e');
  const yellow: [number, number, number] = hexToRgb('#eab308');
  const red: [number, number, number] = hexToRgb('#ef4444');

  if (clamped <= 33) {
    return interpolate(green, yellow, clamped / 33);
  }
  return interpolate(yellow, red, (clamped - 33) / 67);
}

/**
 * Map an exposure score (0–100) to a Tailwind CSS text/background colour class.
 *
 *   0–33  → green
 *   34–66 → yellow
 *   67–100→ red
 */
export function getExposureColorClass(score: number): string {
  if (score <= 33) return 'text-green-500';
  if (score <= 66) return 'text-yellow-500';
  return 'text-red-500';
}
