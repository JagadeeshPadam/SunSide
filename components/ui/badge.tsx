'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-200 select-none',
  {
    variants: {
      variant: {
        default: [
          'bg-slate-100 text-slate-700 border border-slate-200',
          'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        ],
        success: [
          'bg-emerald-50 text-emerald-700 border border-emerald-200',
          'dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
        ],
        warning: [
          'bg-zinc-50 text-zinc-700 border border-zinc-200',
          'dark:bg-zinc-500/10 dark:text-zinc-500 dark:border-zinc-900/15',
        ],
        danger: [
          'bg-red-50 text-red-700 border border-red-200',
          'dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
        ],
        info: [
          'bg-sky-50 text-sky-700 border border-sky-200',
          'dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'inline-block w-1.5 h-1.5 rounded-full',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-zinc-500',
            variant === 'danger' && 'bg-red-500',
            variant === 'info' && 'bg-sky-500',
            (!variant || variant === 'default') && 'bg-slate-500',
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
