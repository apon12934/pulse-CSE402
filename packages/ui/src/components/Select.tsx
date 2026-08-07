import React, { SelectHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="font-mono text-[11px] uppercase tracking-wider text-[#888]">{label}</label>}
        <select
          ref={ref}
          className={cn(
            "bg-[#121212] border border-[#262626] text-white px-4 py-3 font-mono text-sm",
            "focus:outline-none focus:border-[#FFFF00] transition-colors rounded-none cursor-pointer",
            error && "border-red-500",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className="font-mono text-[10px] text-red-500">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
