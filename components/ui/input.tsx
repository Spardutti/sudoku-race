/**
 * Input Component - Newspaper Aesthetic
 *
 * A text input component with clean newspaper styling, focus states,
 * and comprehensive error handling for accessible forms.
 *
 * @example
 * ```tsx
 * <Input
 *   type="email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   ariaLabel="Email address"
 * />
 *
 * <Input
 *   type="password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 *   error="Password must be at least 8 characters"
 *   ariaLabel="Password"
 *   required
 * />
 * ```
 *
 * @see docs/PRD.md - Design System Principles
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /**
   * Input type
   */
  type?: "text" | "email" | "password";
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Input value (controlled component)
   */
  value?: string;
  /**
   * Change handler
   */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Error message to display below input
   */
  error?: string;
  /**
   * ARIA label (required for accessibility)
   */
  ariaLabel: string;
  /**
   * Whether the input is required
   */
  required?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Input component with newspaper aesthetic
 *
 * Features:
 * - Clean black border (1px solid)
 * - Blue accent focus state (2px solid #1a73e8)
 * - Red error border with error message
 * - Minimum 44px height (WCAG tap target)
 * - Full keyboard and screen reader support
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      placeholder,
      value,
      onChange,
      error,
      ariaLabel,
      required = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    // Generate unique ID for error message association
    const errorId = id ? `${id}-error` : undefined;

    return (
      <div className="flex flex-col gap-1">
        <input
          ref={ref}
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-label={ariaLabel}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error && errorId ? errorId : undefined}
          aria-required={required}
          required={required}
          className={cn(
            // Base styles - newspaper aesthetic
            "w-full bg-background text-primary font-sans text-base",
            // Border and padding
            "border border-primary px-3 py-2.5 rounded-none",
            // Minimum height for tap target (WCAG 2.1 Level AA)
            "min-h-[44px]",
            // Focus state - blue accent ring
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
            // Placeholder styling
            "placeholder:text-neutral placeholder:opacity-70",
            // Disabled state
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral/10",
            // Error state - red border
            error && "border-red-600 focus:ring-red-600 focus:border-red-600",
            // Custom classes
            className
          )}
          {...props}
        />
        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600 font-sans"
            role="alert"
          >
            {error}
          </p>
        )}
        {/* Required indicator (visually hidden, screen reader accessible) */}
        {required && (
          <span className="sr-only" aria-live="polite">
            Required field
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
