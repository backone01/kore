import React from 'react';
import { cn } from '../../utils/cn.js';

export function Progress({ value, className, ...props }) {
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-secondary', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all duration-300"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </div>
  );
}
