// components/ui/Field.tsx
'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function Field({ label, hint, error, children, className }: FieldProps) {
  return (
    <label className={cn('block space-y-2', className)}>
      {label && <div className="text-sm text-white/80">{label}</div>}
      {children}
      <div className="min-h-[18px]">
        {error ? (
          <div className="text-xs text-red-300">{error}</div>
        ) : hint ? (
          <div className="text-xs text-white/50">{hint}</div>
        ) : null}
      </div>
    </label>
  );
}