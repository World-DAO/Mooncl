// components/ui/Input.tsx
'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-xl bg-white/5 border border-white/15',
        'px-4 h-11 text-white placeholder-white/40',
        'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[--brand-2] focus:border-transparent',
        'backdrop-blur-md',
        className
      )}
      {...props}
    />
  );
}