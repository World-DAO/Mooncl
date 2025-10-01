'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 1 | 2;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  blur?: 'sm' | 'md';
}

const padClass = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export default function GlassPanel({
  className,
  elevation = 2,
  padding = 'md',
  blur = 'md',
  children,
  ...props
}: GlassPanelProps) {
  const styles: React.CSSProperties = {
    background: 'var(--glass-bg, rgba(255,255,255,.08))',
    borderColor: 'var(--glass-border, rgba(255,255,255,.18))',
    boxShadow:
      elevation === 2
        ? 'var(--elev-2,0 10px 24px rgba(0,0,0,.35))'
        : 'var(--elev-1,0 4px 12px rgba(0,0,0,.25))',
  };
  (styles as any).backdropFilter =
    blur === 'md' ? 'blur(var(--blur-md,12px))' : 'blur(var(--blur-sm,8px))';

  return (
    <div
      className={cn('rounded-2xl border text-white', padClass[padding], className)}
      style={styles}
      {...props}
    >
      {children}
    </div>
  );
}