import React from "react";
import { cn } from "../utils/cn.js";

/* ─── Props ────────────────────────────────────── */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional card header — separated from content by a 1px horizontal rule. */
  header?: React.ReactNode;
  /** If true, the card gets a #FFFF00 border (elevated attention). */
  elevated?: boolean;
}

/* ─── Component ────────────────────────────────── */

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ header, elevated = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-none bg-module",
          "border",
          elevated ? "border-accent" : "border-rule",
          "transition-colors duration-150 ease-out",
          "hover:bg-hover",
          className,
        )}
        {...props}
      >
        {header && (
          <>
            <div className="px-4 py-3">
              {typeof header === "string" ? (
                <h3 className="font-sans text-[15px] font-semibold leading-6 text-text-primary">
                  {header}
                </h3>
              ) : (
                header
              )}
            </div>
            {/* 1px horizontal rule separating header from content */}
            <div className={cn("h-px w-full", elevated ? "bg-accent" : "bg-rule")} />
          </>
        )}

        <div className="px-4 py-3">{children}</div>
      </div>
    );
  },
);

Card.displayName = "Card";
