'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Loader2, Search, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Location } from '@/types';

/* ─── Props ──────────────────────────────────────────────────────────────────── */

interface LocationInputProps {
  label: string;
  placeholder?: string;
  value?: Location | null;
  onChange: (location: Location) => void;
  icon?: React.ReactNode;
  className?: string;
  hasError?: boolean;
}

/* ─── Debounce hook (unchanged) ─────────────────────────────────────────────── */

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

export function LocationInput({
  label,
  placeholder = 'Search location…',
  value,
  onChange,
  icon,
  className,
  hasError = false,
}: LocationInputProps) {
  const [query, setQuery] = React.useState(value?.name ?? '');
  const [suggestions, setSuggestions] = React.useState<Location[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [focused, setFocused] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 350);
  const isConfirmed = !!(value && value.name === query && value.coordinates);

  /* ── Sync external value ── */
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (value?.name && value.name !== query) setQuery(value.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.name]);

  /* ── Fetch suggestions ── */
  React.useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
      return;
    }
    if (isConfirmed) return;

    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    fetch(`/api/geocode?q=${encodeURIComponent(debouncedQuery.trim())}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ locations: Location[] }>;
      })
      .then(({ locations }) => {
        if (cancelled) return;
        setSuggestions(locations ?? []);
        setOpen((locations ?? []).length > 0);
        setActiveIndex(-1);
      })
      .catch(() => {
        if (cancelled) return;
        setFetchError('Could not reach location service');
        setOpen(false);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedQuery, isConfirmed]);

  /* ── Close on outside click (identical logic) ── */
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Selection & keyboard (identical logic) ── */
  const selectSuggestion = (loc: Location) => {
    setQuery(loc.name);
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    onChange(loc);
  };

  const clearInput = () => {
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  React.useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      (listRef.current.children[activeIndex] as HTMLElement)?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  /* ── Border style decision ── */
  const getBorderStyle = () => {
    if (hasError) return { borderColor: 'var(--red-err)', boxShadow: '0 0 0 3px rgba(239,68,68,0.12)' };
    if (isConfirmed) return { borderColor: '#09090B', boxShadow: '0 0 0 3px rgba(16,185,129,0.12)' };
    if (focused) return { borderColor: 'var(--amber)', boxShadow: '0 0 0 3px var(--amber-glow)' };
    return { borderColor: 'var(--border-subtle)', boxShadow: 'none' };
  };

  const borderStyle = getBorderStyle();

  return (
    <div ref={containerRef} className={cn('relative flex flex-col gap-1.5 w-full', className)}>
      {/* Label */}
      <label
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>

      {/* Input wrapper */}
      <div className="relative group">
        {/* Left icon */}
        <div
          className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 transition-all duration-200"
          style={{ color: isConfirmed ? '#09090B' : focused ? 'var(--amber)' : 'var(--text-secondary)' }}
        >
          {icon ?? <MapPin size={16} />}
        </div>

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-activedescendant={activeIndex >= 0 ? `loc-option-${activeIndex}` : undefined}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setFocused(true);
            if (suggestions.length > 0 && !isConfirmed) setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-10 py-4 text-sm rounded-2xl outline-none',
            hasError ? 'animate-shake' : '',
          )}
          style={{
            background: 'var(--surface-2)',
            border: `1px solid ${borderStyle.borderColor}`,
            boxShadow: borderStyle.boxShadow,
            color: 'var(--text-primary)',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
        />

        {/* Right indicator */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--amber)' }} />
              </motion.div>
            ) : isConfirmed ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="relative"
              >
                {/* Green shimmer animation on confirmed */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ background: 'rgba(16,185,129,0.3)' }}
                />
                <CheckCircle2 size={17} style={{ color: '#09090B' }} />
              </motion.div>
            ) : query ? (
              <motion.button
                key="clear"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={clearInput}
                aria-label="Clear input"
                className="flex items-center justify-center w-5 h-5 rounded-full transition-all"
                style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-3)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <X size={13} />
              </motion.button>
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Search size={15} style={{ color: 'var(--border-hover)' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Helper hint */}
      {!isConfirmed && query && !loading && !open && debouncedQuery.length >= 2 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1 text-xs"
          style={{ color: 'var(--amber)' }}
        >
          <Search size={10} />
          Type more or wait — then select from the list
        </motion.p>
      )}
      {fetchError && (
        <p className="text-xs" style={{ color: 'var(--red-err)' }}>{fetchError}</p>
      )}

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-2 z-[200] overflow-hidden rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(0,0,0,0.09)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#A1A1AA' }}>
                Select a location
              </p>
            </div>

            {/* List */}
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-56 overflow-y-auto py-1"
            >
              {suggestions.map((loc, i) => {
                const isActive = i === activeIndex;
                return (
                  <motion.li
                    key={i}
                    id={`loc-option-${i}`}
                    role="option"
                    aria-selected={isActive}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onMouseDown={(e) => { e.preventDefault(); selectSuggestion(loc); }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer select-none transition-all duration-100"
                    style={{
                      background: isActive ? '#F4F4F5' : 'transparent',
                      borderLeft: isActive ? '2px solid #09090B' : '2px solid transparent',
                    }}
                  >
                    <MapPin
                      size={13}
                      className="mt-0.5 shrink-0 transition-colors"
                      style={{ color: isActive ? '#09090B' : '#A1A1AA' }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: '#09090B' }}
                      >
                        {loc.name}
                      </span>
                      {loc.address && (
                        <span
                          className="text-xs truncate mt-0.5"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {loc.address}
                        </span>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results */}
      {!open && !loading && debouncedQuery.length >= 3 && suggestions.length === 0 && !isConfirmed && query === debouncedQuery && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1 text-xs mt-0.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          <MapPin size={10} />
          No locations found — try a different spelling or add the country
        </motion.p>
      )}
    </div>
  );
}
