'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ChipAppearance = 'glass' | 'brand-soft';
type ChipSize = 'sm' | 'md';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  appearance?: ChipAppearance;
  size?: ChipSize;
  icon?: React.ReactNode;
  text: React.ReactNode;
}

const sizeClass: Record<ChipSize, string> = {
  sm: 'h-7 text-xs px-2 rounded-lg',
  md: 'h-8 text-sm px-3 rounded-xl',
};

export default function Chip({
  className,
  appearance = 'glass',
  size = 'md',
  icon,
  text,
  ...props
}: ChipProps) {
  const base = 'inline-flex items-center gap-2 whitespace-nowrap';

  const styles: React.CSSProperties = {};
  let look = '';

  if (appearance === 'glass') {
    look = 'text-white border';
    styles.background = 'var(--glass-bg, rgba(255,255,255,.08))';
    styles.borderColor = 'var(--glass-border, rgba(255,255,255,.18))';
    (styles as any).backdropFilter = 'blur(var(--blur-md,12px))';
  } else {
    // brand-soft：更轻的品牌色背景
    look = 'text-white/95';
    styles.background = 'color-mix(in oklab, var(--brand-1,#7c3aed) 18%, transparent)';
    styles.borderColor = 'color-mix(in oklab, var(--brand-1,#7c3aed) 26%, transparent)';
    (styles as any).backdropFilter = 'blur(var(--blur-sm,8px))';
  }

  return (
    <div
      className={cn(base, sizeClass[size], look, className)}
      style={styles}
      {...props}
    >
      {icon && <span className="select-none">{icon}</span>}
      <span className="max-w-[18ch] text-ellipsis overflow-hidden">{text}</span>
    </div>
  );
}