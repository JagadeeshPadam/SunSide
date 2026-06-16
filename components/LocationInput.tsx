'use client';

import * as React from 'react';
import { MapPin, X, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Location } from '@/types';

interface LocationInputProps {
  label: string;
  placeholder?: string;
  value?: Location | null;
  onChange: (location: Location) => void;
  icon?: React.ReactNode;
  className?: string;
}

interface GeocodeSuggestion {
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function LocationInput({
  label,
  placeholder = 'Search location...',
  value,
  onChange,
  icon,
  className,
}: LocationInputProps) {
  const [query, setQuery] = React.useState(value?.name ?? '');
  const [suggestions, setSuggestions] = React.useState<GeocodeSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Sync external value changes
  React.useEffect(() => {
    if (value?.name && value.name !== query) {
      setQuery(value.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.name]);

  // Fetch suggestions
  React.useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    // If this matches the currently selected value, skip fetch
    if (value?.name === debouncedQuery) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/geocode?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch suggestions');
        return res.json() as Promise<GeocodeSuggestion[]>;
      })
      .then((data) => {
        if (!cancelled) {
          setSuggestions(data);
          setOpen(data.length > 0);
          setActiveIndex(-1);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load suggestions');
          setOpen(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery, value?.name]);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectSuggestion = (s: GeocodeSuggestion) => {
    setQuery(s.name);
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    onChange({ name: s.name, address: s.address, coordinates: s.coordinates });
  };

  const clearInput = () => {
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          selectSuggestion(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Scroll active item into view
  React.useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  return (
    <div ref={containerRef} className={cn('relative flex flex-col gap-1.5 w-full', className)}>
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="relative group">
        {/* Left icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors duration-200 group-focus-within:text-sky-500 z-10">
          {icon ?? <MapPin size={16} />}
        </div>

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-10 py-2.5',
            'text-sm text-slate-900 backdrop-blur-sm outline-none',
            'transition-all duration-200 placeholder:text-slate-400',
            'hover:border-slate-300',
            'focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
            'dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100',
            'dark:placeholder:text-slate-500 dark:hover:border-slate-600',
            'dark:focus:border-sky-500',
          )}
        />

        {/* Right: loading or clear */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-sky-500" />
          ) : query ? (
            <button
              type="button"
              onClick={clearInput}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Clear"
            >
              <X size={16} />
            </button>
          ) : (
            <Search size={16} className="text-slate-300 dark:text-slate-600" />
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className={cn(
          'absolute left-0 right-0 top-full mt-1.5 z-50',
          'rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50',
          'dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/50',
          'overflow-hidden',
        )}>
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-64 overflow-y-auto py-1"
          >
            {suggestions.map((s, i) => (
              <li
                key={i}
                id={`suggestion-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(s);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  'flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-100',
                  i === activeIndex
                    ? 'bg-sky-50 dark:bg-sky-500/10'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50',
                )}
              >
                <MapPin
                  size={14}
                  className={cn(
                    'mt-0.5 shrink-0',
                    i === activeIndex ? 'text-sky-500' : 'text-slate-400',
                  )}
                />
                <div className="flex flex-col min-w-0">
                  <span
                    className={cn(
                      'text-sm font-medium truncate',
                      i === activeIndex
                        ? 'text-sky-700 dark:text-sky-300'
                        : 'text-slate-800 dark:text-slate-200',
                    )}
                  >
                    {s.name}
                  </span>
                  {s.address && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {s.address}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
