import React from 'react';
import { cn } from '../../utils/cn.js';

export function Switch({ className, checked, onCheckedChange, ...props }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary justify-end' : 'bg-input justify-start',
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow"
      />
    </button>
  );
}
