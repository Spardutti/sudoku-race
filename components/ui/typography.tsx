/**
 * Typography Component - Newspaper Aesthetic
 *
 * A flexible typography component with newspaper-inspired variants.
 * Supports h1, h2, h3 (serif) and body, caption (sans-serif) styles.
 *
 * @example
 * ```tsx
 * <Typography variant="h1">Main Heading</Typography>
 * <Typography variant="h2" as="h1">Semantic H1, styled as H2</Typography>
 * <Typography variant="body">Body text content</Typography>
 * <Typography variant="caption" className="text-neutral">
 *   Small caption text
 * </Typography>
 * ```
 *
 * @see docs/PRD.md - Design System Principles - Typography Scale
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TypographyProps {
  /**
   * Typography variant
   * h1, h2, h3: Serif font (Merriweather) for headers
   * body: Sans-serif font (Inter) for body text
   * caption: Sans-serif font (Inter) for captions
   */
  variant: "h1" | "h2" | "h3" | "body" | "caption";
  /**
   * The actual HTML element to render
   * Allows semantic HTML while using different visual styles
   */
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /**
   * Content to display
   */
  children: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Typography component with newspaper aesthetic
 *
 * Features:
 * - Serif typography (Merriweather) for h1, h2, h3
 * - Sans-serif typography (Inter) for body, caption
 * - Responsive font scaling (smaller on mobile)
 * - Black text color (newspaper aesthetic)
 */
const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ variant, as, children, className, ...props }, ref) => {
    // Variant styles mapping
    const variantClasses = {
      h1: "font-serif text-5xl font-bold text-primary mobile:text-4xl",
      h2: "font-serif text-3xl font-bold text-primary mobile:text-2xl",
      h3: "font-serif text-2xl font-semibold text-primary mobile:text-xl",
      body: "font-sans text-base font-normal text-primary mobile:text-base",
      caption: "font-sans text-sm font-normal text-neutral mobile:text-xs",
    };

    const className_merged = cn(variantClasses[variant], className);
    const elementType = as || getDefaultElement(variant);

    // Render based on element type to avoid component creation during render
    switch (elementType) {
      case "h1":
        return (
          <h1 ref={ref as React.ForwardedRef<HTMLHeadingElement>} className={className_merged} {...props}>
            {children}
          </h1>
        );
      case "h2":
        return (
          <h2 ref={ref as React.ForwardedRef<HTMLHeadingElement>} className={className_merged} {...props}>
            {children}
          </h2>
        );
      case "h3":
        return (
          <h3 ref={ref as React.ForwardedRef<HTMLHeadingElement>} className={className_merged} {...props}>
            {children}
          </h3>
        );
      case "span":
        return (
          <span ref={ref as React.ForwardedRef<HTMLSpanElement>} className={className_merged} {...props}>
            {children}
          </span>
        );
      case "p":
      default:
        return (
          <p ref={ref as React.ForwardedRef<HTMLParagraphElement>} className={className_merged} {...props}>
            {children}
          </p>
        );
    }
  }
);
Typography.displayName = "Typography";

/**
 * Helper: Get default HTML element for variant
 * Ensures semantic HTML when 'as' prop is not specified
 */
function getDefaultElement(
  variant: TypographyProps["variant"]
): "h1" | "h2" | "h3" | "p" {
  switch (variant) {
    case "h1":
      return "h1";
    case "h2":
      return "h2";
    case "h3":
      return "h3";
    case "body":
    case "caption":
      return "p";
  }
}

export { Typography };
