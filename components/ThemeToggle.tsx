'use client';

import { Sun } from 'lucide-react';

// Light mode only — toggle is vestigial, kept for compatibility
export function ThemeToggle({ className }: { className?: string }) {
  return (
    <button
      aria-label="Light mode"
      className={className}
      style={{
        width: 36, height: 36, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
        cursor: 'default',
      }}
    >
      <Sun size={15} style={{ color: '#09090B' }} />
    </button>
  );
}
