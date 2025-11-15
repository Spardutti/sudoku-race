/**
 * Button Component - Newspaper Aesthetic
 *
 * A flexible button component with newspaper-inspired variants.
 * Supports primary (black background), secondary (white with border),
 * and ghost (transparent) styles.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleSubmit}>
 *   Submit
 * </Button>
 *
 * <Button variant="secondary" size="lg">
 *   Cancel
 * </Button>
 *
 * <Button variant="ghost" asChild>
 *   <Link href="/about">Learn More</Link>
 * </Button>
 * ```
 *
 * @see docs/PRD.md - Design System Principles
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /**
         * Primary variant - Black background, white text
         * High contrast for primary CTAs
         */
        primary:
          "bg-primary text-background border-2 border-primary hover:bg-background hover:text-primary",
        /**
         * Secondary variant - White background, black border
         * For secondary actions and alternative CTAs
         */
        secondary:
          "bg-background text-primary border-2 border-primary hover:bg-primary hover:text-background",
        /**
         * Ghost variant - Transparent background, underline on hover
         * For subtle actions and tertiary CTAs
         */
        ghost: "bg-transparent text-primary hover:underline underline-offset-4",
      },
      size: {
        /**
         * Small - 36px height (below minimum tap target, use cautiously)
         * Primarily for desktop interfaces with mouse input
         */
        sm: "min-h-[36px] px-3 text-sm",
        /**
         * Medium - 44px height (meets WCAG 2.1 Level AA minimum tap target)
         * Default size for most use cases
         */
        md: "min-h-[44px] px-4 text-base",
        /**
         * Large - 52px height (exceeds minimum tap target)
         * For prominent CTAs and important actions
         */
        lg: "min-h-[52px] px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * When true, renders the button as a child component (e.g., Link)
   * Uses Radix UI Slot for polymorphic behavior
   */
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
