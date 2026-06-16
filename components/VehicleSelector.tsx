'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { VehicleType } from '@/types';

interface VehicleOption {
  type: VehicleType;
  icon: string;
  label: string;
  subtitle: string;
}

const VEHICLES: VehicleOption[] = [
  { type: 'car',   icon: '🚗', label: 'Personal Vehicle', subtitle: '4 seats' },
  { type: 'bus',   icon: '🚌', label: 'Public Bus',       subtitle: 'Multiple rows' },
  { type: 'train', icon: '🚆', label: 'Train / Rail',     subtitle: 'Compartment seats' },
  { type: 'bike',  icon: '🚲', label: 'Bicycle',          subtitle: 'Solo rider' },
];

interface VehicleSelectorProps {
  value: VehicleType;
  onChange: (type: VehicleType) => void;
  className?: string;
}

export function VehicleSelector({ value, onChange, className }: VehicleSelectorProps) {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-3', className)}>
      {VEHICLES.map((vehicle) => {
        const isSelected = value === vehicle.type;

        return (
          <motion.button
            key={vehicle.type}
            type="button"
            onClick={() => onChange(vehicle.type)}
            whileHover={{ scale: 1.04, rotate: 1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={cn(
              'relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center',
              'transition-all duration-200 cursor-pointer select-none outline-none',
              'focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
              isSelected
                ? [
                    'border-sky-500 bg-sky-50/80 dark:bg-sky-500/10',
                    'shadow-lg shadow-sky-500/20',
                  ]
                : [
                    'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60',
                    'hover:border-slate-300 dark:hover:border-slate-600',
                    'hover:bg-slate-50 dark:hover:bg-slate-800',
                  ],
            )}
          >
            {/* Glow ring for selected */}
            {isSelected && (
              <motion.div
                layoutId="vehicle-glow"
                className="absolute inset-0 rounded-2xl ring-2 ring-sky-500 ring-offset-0 pointer-events-none"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            {/* Icon */}
            <motion.span
              animate={isSelected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-3xl"
              role="img"
              aria-label={vehicle.label}
            >
              {vehicle.icon}
            </motion.span>

            {/* Labels */}
            <div className="flex flex-col gap-0.5">
              <span
                className={cn(
                  'text-sm font-semibold leading-tight',
                  isSelected
                    ? 'text-sky-700 dark:text-sky-300'
                    : 'text-slate-800 dark:text-slate-200',
                )}
              >
                {vehicle.label}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {vehicle.subtitle}
              </span>
            </div>

            {/* Selected dot */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-sky-500"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
