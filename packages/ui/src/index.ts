/**
 * @pulse/ui — The UI Kernel
 *
 * Centralized, OS-style component library for Pulse.
 * Every interactive primitive is defined here once
 * and consumed across all clients.
 *
 * One code change here propagates everywhere.
 */

// ─── Utilities ────────────────────────────────────────────
export { cn } from "./utils/cn.js";

// ─── Components ───────────────────────────────────────────
export { Button, type ButtonProps } from "./components/Button.js";
export { Input, type InputProps } from "./components/Input.js";
export { Card, type CardProps } from "./components/Card.js";
export { StatusChip, type StatusChipProps } from "./components/StatusChip.js";
