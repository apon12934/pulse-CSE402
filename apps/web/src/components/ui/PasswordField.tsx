import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@pulse/ui';

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className="relative w-full">
        <input
          {...props}
          type={show ? 'text' : 'password'}
          ref={ref}
          className={cn(
            "w-full bg-[#1A1A1A] border border-[#262626] text-white p-3 pr-12 font-mono text-sm focus:outline-none focus:border-[#FFFF00] rounded-none transition-colors",
            className
          )}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#FFFF00] transition-colors focus:outline-none"
        >
          {show ? (
            <EyeOff className="w-4 h-4 animate-in fade-in zoom-in duration-200" />
          ) : (
            <Eye className="w-4 h-4 animate-in fade-in zoom-in duration-200" />
          )}
        </button>
      </div>
    );
  }
);
PasswordField.displayName = 'PasswordField';
