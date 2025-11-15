/**
 * Design System Components - Barrel Export
 *
 * Central export point for all UI components.
 * Enables clean imports across the application.
 *
 * @example
 * ```tsx
 * import { Button, Card, Input, Typography } from '@/components/ui'
 * ```
 *
 * @see docs/PRD.md - Design System Principles
 * @see docs/architecture.md - Component Patterns
 */

export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";

export { Card } from "./card";
export type { CardProps } from "./card";

export { Input } from "./input";
export type { InputProps } from "./input";

export { Typography } from "./typography";
export type { TypographyProps } from "./typography";
