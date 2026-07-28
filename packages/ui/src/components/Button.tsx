import React from "react";
import { cn } from "../utils/cn.js";

/* ─── Variant Definitions ──────────────────────── */

const variants = {
  /** Solid #FFFF00 bg, #000000 text. Inverts on press. */
  primary: [
    "bg-accent text-on-accent",
    "hover:bg-on-accent hover:text-accent hover:border-accent",
    "active:scale-[0.97]",
    "border border-accent",
  ].join(" "),

  /** 1px white stroke, no fill. Inverts on press. */
  secondary: [
    "bg-transparent text-text-primary",
    "border border-text-primary",
    "hover:bg-text-primary hover:text-floor",
    "active:scale-[0.97]",
  ].join(" "),

  /** Transparent with accent text. Minimal footprint. */
  ghost: [
    "bg-transparent text-text-secondary",
    "border border-transparent",
    "hover:text-accent hover:border-rule",
    "active:scale-[0.97]",
  ].join(" "),

  /** Destructive action. Red border, inverts on hover. */
  danger: [
    "bg-transparent text-status-error",
    "border border-status-error",
    "hover:bg-status-error hover:text-floor",
    "active:scale-[0.97]",
  ].join(" "),
} as const;

const sizes = {
  sm: "px-3 py-1 text-xs",
  md: "px-5 py-2 text-sm",
  lg: "px-7 py-3 text-base",
} as const;

/* ─── Props ────────────────────────────────────── */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

/* ─── Component ────────────────────────────────── */

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base — shared by all variants
          "inline-flex items-center justify-center",
          "rounded-none font-bold tracking-[0.02em] font-sans",
          "transition-colors duration-150 ease-out",
          "cursor-pointer select-none",
          "disabled:opacity-40 disabled:pointer-events-none",
          // Variant + Size
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
