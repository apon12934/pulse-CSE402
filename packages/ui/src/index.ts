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
export { cn } from "./utils/cn";

// ─── Components ───────────────────────────────────────────
export { Button, type ButtonProps } from "./components/Button";
export { Input, type InputProps } from "./components/Input";
export { Card, type CardProps } from "./components/Card";
export { StatusChip, type StatusChipProps } from "./components/StatusChip";
export { Modal, type ModalProps } from "./components/Modal";
export { Select, type SelectProps } from "./components/Select";
