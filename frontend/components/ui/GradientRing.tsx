// components/ui/GradientRing.tsx
'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  radius?: string;  // 例: '1.25rem' 对应 rounded-2xl
  padding?: number; // 边框厚度，默认1px
}

export default function GradientRing({ className, children, radius = '1rem', padding = 1, ...props }: Props) {
  return (
    <div className={cn('relative', className)} style={{ borderRadius: radius }} {...props}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: radius,
          padding,
          background: 'var(--gradient-brand)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <div className="relative" style={{ borderRadius: radius }}>{children}</div>
    </div>
  );
}