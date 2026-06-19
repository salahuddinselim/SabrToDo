'use client';

import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary mb-2">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-bg-base/40 border border-white/10',
            'text-primary placeholder:text-placeholder',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/70',
            'transition-all duration-base',
            error && 'border-accent-red focus:ring-accent-red/50 focus:border-accent-red',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-accent-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary mb-2">{label}</label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-bg-base/40 border border-white/10',
            'text-primary placeholder:text-placeholder resize-none',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/70',
            'transition-all duration-base',
            error && 'border-accent-red focus:ring-accent-red/50 focus:border-accent-red',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-accent-red">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };
