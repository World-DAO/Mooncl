'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Appearance = 'brand' | 'glass' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

/** 兼容旧 API：variant 优先映射到 appearance */
type LegacyVariant = 'primary' | 'secondary' | 'wallet' | 'google';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 新 API（推荐） */
  appearance?: Appearance;
  /** 旧 API（兼容）：primary/google=brand，wallet=glass，secondary=outline */
  variant?: LegacyVariant;
  size?: Size;
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-2xl',
  md: 'h-11 px-5 text-base rounded-2xl',
  lg: 'h-14 px-8 text-lg rounded-2xl',
};

function mapVariantToAppearance(v?: LegacyVariant): Appearance | undefined {
  if (!v) return undefined;
  if (v === 'primary' || v === 'google') return 'brand';
  if (v === 'wallet') return 'glass';
  if (v === 'secondary') return 'outline';
  return undefined;
}

export default function Button({
  className,
  appearance,
  variant,           // 旧字段
  size = 'md',
  isLoading = false,
  iconLeft,
  iconRight,
  disabled,
  children,
  ...props
}: ButtonProps) {
  // 解析最终外观：appearance 优先，其次兼容 variant
  const resolved: Appearance = appearance ?? mapVariantToAppearance(variant) ?? 'brand';
  const isDisabled = disabled || isLoading;

  const base =
    'inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-all ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    'focus-visible:ring-[color:var(--brand-2,#93c5fd)] disabled:opacity-60 disabled:cursor-not-allowed';

  const styles: React.CSSProperties = {};
  let look = '';

  if (resolved === 'brand') {
    look = 'text-white shadow-sm hover:translate-y-[-1px] active:translate-y-0';
    styles.background =
      'var(--gradient-brand, linear-gradient(90deg,#ff4dd2,#7b5cff,#29d3ff))';
    styles.boxShadow = 'var(--elev-1,0 4px 12px rgba(0,0,0,.25))';
  } else if (resolved === 'glass') {
    look = 'text-white border hover:translate-y-[-1px] active:translate-y-0';
    // 几乎透明 + 清晰描边 = 贴合 Wallet 样式
    styles.background = 'var(--glass-bg, rgba(255,255,255,.03))';
    styles.borderColor = 'var(--glass-border, rgba(255,255,255,.28))';
    (styles as any).backdropFilter = 'blur(var(--blur-md,12px))';
    styles.boxShadow = 'var(--elev-1,0 4px 12px rgba(0,0,0,.25))';
  } else if (resolved === 'outline') {
    look = 'text-white border hover:bg-white/10';
  } else {
    look = 'text-white hover:bg-white/10';
  }

  return (
    <button
      type="button"
      className={cn(base, sizeClass[size], look, className)}
      style={styles}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <span
          className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
          aria-hidden
        />
      )}
      {!isLoading && iconLeft}
      <span className="whitespace-nowrap">{children}</span>
      {!isLoading && iconRight}
    </button>
  );
}