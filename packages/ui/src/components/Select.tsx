'use client'

import React, { SelectHTMLAttributes, useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  onChange?: (e: any) => void;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ label, error, className, children, value, onChange }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Extract options from children
    const options = React.Children.toArray(children)
      .filter((child): child is React.ReactElement => React.isValidElement(child) && child.type === 'option')
      .map(child => ({
        value: (child.props as any).value,
        label: (child.props as any).children
      }));

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (newValue: any) => {
      if (onChange) {
        // Fake event for compatibility with existing onChange handlers
        onChange({ target: { value: newValue } });
      }
      setIsOpen(false);
    };

    return (
      <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
        {label && <label className="font-mono text-[11px] uppercase tracking-wider text-[#888]">{label}</label>}
        
        <div
          ref={ref}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "bg-[#121212] border border-[#262626] text-white px-4 py-3 font-mono text-sm",
            "focus:outline-none transition-colors rounded-none cursor-pointer flex justify-between items-center",
            isOpen ? "border-[#FFFF00]" : "hover:border-[#404040]",
            error && "border-red-500",
            className
          )}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          <span>{selectedOption?.label || value || 'Select...'}</span>
          <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute z-50 top-full left-0 w-full mt-1 bg-[#121212] border border-[#262626] shadow-xl">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  "px-4 py-3 font-mono text-sm cursor-pointer transition-colors",
                  value === opt.value 
                    ? "bg-[#FFFF00] text-black font-bold" 
                    : "text-white hover:bg-[#262626] hover:text-[#FFFF00]"
                )}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
        {error && <span className="font-mono text-[10px] text-red-500">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
