import React from "react";
import { cn } from "../utils/cn";

/* ─── Status Color Map ─────────────────────────── */

const statusColors = {
  upcoming: { border: "border-text-muted", dot: "bg-text-muted", text: "text-text-secondary" },
  running: { border: "border-status-running", dot: "bg-status-running", text: "text-status-running" },
  completed: { border: "border-status-success", dot: "bg-status-success", text: "text-status-success" },
  overdue: { border: "border-status-error", dot: "bg-status-error", text: "text-status-error" },
  warning: { border: "border-status-warning", dot: "bg-status-warning", text: "text-status-warning" },
} as const;

/* ─── Props ────────────────────────────────────── */

export interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: keyof typeof statusColors;
  /** Override the display label. Defaults to the status key capitalised. */
  label?: string;
}

/* ─── Component ────────────────────────────────── */

export const StatusChip = React.forwardRef<HTMLSpanElement, StatusChipProps>(
  ({ status, label, className, ...props }, ref) => {
    const colors = statusColors[status];
    const displayLabel = label ?? status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2",
          "rounded-none border px-2.5 py-1",
          "font-mono text-[12px] font-medium leading-4 tracking-[0.05em] uppercase",
          "select-none",
          colors.border,
          colors.text,
          className,
        )}
        {...props}
      >
        {/* 6px solid square indicator — per DESIGN.md active state spec */}
        <span className={cn("block h-1.5 w-1.5 shrink-0", colors.dot)} />
        {displayLabel}
      </span>
    );
  },
);

StatusChip.displayName = "StatusChip";
