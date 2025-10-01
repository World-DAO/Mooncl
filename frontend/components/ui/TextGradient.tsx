'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextGradientProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand';
}

export default function TextGradient({
  className,
  variant = 'brand',
  children,
  ...props
}: TextGradientProps) {
  const style: React.CSSProperties = {};

  if (variant === 'brand') {
    // 用全局 token；附带一个深色备用渐变做兜底
    style.background =
      'var(--gradient-brand, linear-gradient(90deg,#1e3a8a 0%,#1d4ed8 55%,#0ea5e9 100%))';
  }

  return (
    <span
      className={cn('inline-block select-none', className)}
      style={{
        ...style,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
      }}
      {...props}
    >
      {children}
    </span>
  );
}