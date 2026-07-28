import React from "react";
import { cn } from "../utils/cn.js";

/* ─── Variant Definitions ──────────────────────── */

const inputVariants = {
  /** Bottom border only — minimal. */
  underline: [
    "border-b border-rule bg-transparent",
    "focus:border-b-2 focus:border-rule-focus",
  ].join(" "),

  /** Full 1px box — structured. */
  outlined: [
    "border border-rule bg-transparent",
    "focus:border-2 focus:border-rule-focus",
  ].join(" "),
} as const;

/* ─── Props ────────────────────────────────────── */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: keyof typeof inputVariants;
  error?: string;
}

/* ─── Component ────────────────────────────────── */

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, variant = "outlined", error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "font-mono text-[12px] font-medium leading-4 tracking-[0.05em]",
              "uppercase text-text-secondary",
            )}
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            // Base
            "w-full rounded-none px-3 py-2",
            "font-sans text-[15px] leading-6 text-text-primary",
            "placeholder:text-text-muted",
            "outline-none transition-colors duration-150 ease-out",
            "disabled:opacity-40 disabled:pointer-events-none",
            // Variant
            inputVariants[variant],
            // Error state
            error && "border-status-error focus:border-status-error",
            className,
          )}
          {...props}
        />

        {error && (
          <span className="font-mono text-[11px] tracking-[0.05em] text-status-error">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
