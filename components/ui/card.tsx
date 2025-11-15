/**
 * Card Component - Newspaper Aesthetic
 *
 * A clean card component with newspaper-inspired styling.
 * Features clean borders, customizable padding, and white background.
 *
 * @example
 * ```tsx
 * <Card>
 *   <h2>Card Title</h2>
 *   <p>Card content goes here</p>
 * </Card>
 *
 * <Card padding="lg" className="shadow-md">
 *   <p>Large padding with custom shadow</p>
 * </Card>
 * ```
 *
 * @see docs/PRD.md - Design System Principles
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Padding variant
   * sm: 16px, md: 24px, lg: 32px
   * Responsive: smaller padding on mobile
   */
  padding?: "sm" | "md" | "lg";
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Card content
   */
  children: React.ReactNode;
}

/**
 * Card component with newspaper aesthetic
 *
 * Clean borders (1px solid black), white background,
 * responsive padding based on 8px grid system
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ padding = "md", className, children, ...props }, ref) => {
    // Padding classes based on 8px grid system
    const paddingClasses = {
      sm: "p-4 mobile:p-3", // 16px (mobile: 12px)
      md: "p-6 mobile:p-4", // 24px (mobile: 16px)
      lg: "p-8 mobile:p-6", // 32px (mobile: 24px)
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles - newspaper aesthetic
          "bg-background border border-primary rounded-none",
          // Padding variant
          paddingClasses[padding],
          // Custom classes
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export { Card };
