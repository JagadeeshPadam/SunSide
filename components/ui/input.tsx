'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  floatingLabel?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      floatingLabel = false,
      id,
      placeholder,
      value,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(
      Boolean(value ?? props.defaultValue),
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      props.onChange?.(e);
    };

    const isFloated = floatingLabel && (isFocused || hasValue);

    return (
      <div className="relative flex flex-col gap-1.5 w-full">
        {label && !floatingLabel && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}

        <div className="relative group">
          {leftIcon && (
            <div
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200',
                isFocused
                  ? 'text-sky-500'
                  : 'text-slate-400 dark:text-slate-500',
              )}
            >
              {leftIcon}
            </div>
          )}

          {floatingLabel && label && (
            <label
              htmlFor={inputId}
              className={cn(
                'absolute left-3 transition-all duration-200 pointer-events-none origin-left z-10',
                leftIcon && 'left-10',
                isFloated
                  ? '-top-2.5 text-xs text-sky-500 font-medium bg-white dark:bg-slate-900 px-1 rounded'
                  : 'top-1/2 -translate-y-1/2 text-sm text-slate-400',
              )}
            >
              {label}
            </label>
          )}

          <input
            id={inputId}
            ref={ref}
            type={type}
            value={value}
            placeholder={floatingLabel ? (isFloated ? placeholder : '') : placeholder}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'w-full rounded-xl border bg-white/80 px-3 py-2.5 text-sm text-slate-900',
              'backdrop-blur-sm outline-none transition-all duration-200',
              'placeholder:text-slate-400',
              'dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : [
                    'border-slate-200 dark:border-slate-700',
                    'focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
                    'hover:border-slate-300 dark:hover:border-slate-600',
                  ],
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200',
                isFocused
                  ? 'text-sky-500'
                  : 'text-slate-400 dark:text-slate-500',
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
