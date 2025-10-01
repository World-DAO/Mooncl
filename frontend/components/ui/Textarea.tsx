// components/ui/Textarea.tsx
'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full min-h-[120px] rounded-xl bg-white/5 border border-white/15',
        'px-4 py-3 text-white placeholder-white/40',
        'focus:outline-none focus:ring-2 focus:ring-[--brand-2] focus:border-transparent',
        'backdrop-blur-md',
        className
      )}
      {...props}
    />
  );
}