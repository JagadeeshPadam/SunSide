'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.97]',
    'select-none',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-sky-500 text-white shadow-lg shadow-sky-500/25',
          'hover:bg-sky-600 hover:shadow-sky-500/40 hover:-translate-y-0.5',
        ],
        destructive: [
          'bg-red-500 text-white shadow-lg shadow-red-500/25',
          'hover:bg-red-600 hover:shadow-red-500/40 hover:-translate-y-0.5',
        ],
        outline: [
          'border border-slate-200 bg-white/50 text-slate-700 backdrop-blur-sm',
          'hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5',
          'dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200',
          'dark:hover:bg-slate-800 dark:hover:border-slate-600',
        ],
        secondary: [
          'bg-violet-500 text-white shadow-lg shadow-violet-500/25',
          'hover:bg-violet-600 hover:shadow-violet-500/40 hover:-translate-y-0.5',
        ],
        ghost: [
          'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
          'dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
        ],
        link: [
          'text-sky-500 underline-offset-4 hover:underline hover:text-sky-600',
          'dark:text-sky-400 dark:hover:text-sky-300',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base rounded-2xl',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={16} />}
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
