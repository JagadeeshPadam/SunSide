'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sun, Map, Share2, RotateCcw, Moon, Download, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandMenuProps {
  onReset: () => void;
  onShare: () => void;
  onExport: () => void;
  onToggleTheme: () => void;
}

interface Cmd { id: string; icon: React.ReactNode; label: string; shortcut: string; action: () => void; }

export function CommandMenu({ onReset, onShare, onExport, onToggleTheme }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [idx, setIdx] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const commands: Cmd[] = [
    { id: 'new',    icon: <RotateCcw size={15} />,  label: 'New Journey',   shortcut: '⌘N', action: onReset },
    { id: 'share',  icon: <Share2 size={15} />,     label: 'Share Results', shortcut: '⌘S', action: onShare },
    { id: 'export', icon: <Download size={15} />,   label: 'Export PDF',    shortcut: '⌘E', action: onExport },
    { id: 'theme',  icon: <Moon size={15} />,       label: 'Toggle Theme',  shortcut: '⌘T', action: onToggleTheme },
    { id: 'map',    icon: <Map size={15} />,        label: 'Focus Map',     shortcut: '⌘M', action: () => document.getElementById('route-map')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'sun',    icon: <Sun size={15} />,        label: 'Sun Path Arc',  shortcut: '⌘P', action: () => document.getElementById('sun-arc')?.scrollIntoView({ behavior: 'smooth' }) },
  ];

  const filtered = query
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  React.useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(''); setIdx(0); }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => (i + 1) % filtered.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => (i - 1 + filtered.length) % filtered.length); }
    else if (e.key === 'Enter') { filtered[idx]?.action(); setOpen(false); }
  };

  return (
    <>
      {/* Trigger button */}
      <button onClick={() => setOpen(true)}
        className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all',
          'hover:bg-white/5 border border-white/[0.06]')}
        style={{ color: 'var(--text-secondary)' }}>
        <Keyboard size={13} />
        <span className="hidden sm:inline">Command</span>
        <kbd className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px]"
          style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)' }}>
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)} />

            {/* Panel */}
            <motion.div
              className="fixed top-[20vh] left-1/2 z-[999] w-full max-w-md -translate-x-1/2 rounded-2xl overflow-hidden"
              style={{ background: '#FAFAFA', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}>

              {/* Search */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <Search size={16} style={{ color: 'var(--text-secondary)' }} />
                <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setIdx(0); }}
                  onKeyDown={handleKeyDown} placeholder="Search commands…"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }} />
                <kbd className="px-2 py-0.5 rounded text-[11px]"
                  style={{ background: 'rgba(0,0,0,0.03)', color: 'var(--text-secondary)' }}>ESC</kbd>
              </div>

              {/* Commands */}
              <div className="py-2 max-h-72 overflow-y-auto">
                {filtered.length === 0 && (
                  <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                    No commands found
                  </p>
                )}
                {filtered.map((cmd, i) => (
                  <button key={cmd.id} onClick={() => { cmd.action(); setOpen(false); }}
                    onMouseEnter={() => setIdx(i)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                    style={{ background: i === idx ? 'rgba(0,0,0,0.04)' : 'transparent', color: 'var(--text-primary)' }}>
                    <span style={{ color: i === idx ? '#09090B' : 'var(--text-secondary)' }}>{cmd.icon}</span>
                    <span className="flex-1 text-left">{cmd.label}</span>
                    <kbd className="text-[11px] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(0,0,0,0.03)', color: 'var(--text-secondary)' }}>
                      {cmd.shortcut}
                    </kbd>
                  </button>
                ))}
              </div>

              <div className="px-4 py-2.5 border-t flex items-center gap-4 text-[11px]"
                style={{ borderColor: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)' }}>
                <span>↑↓ navigate</span><span>↵ select</span><span>esc close</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
