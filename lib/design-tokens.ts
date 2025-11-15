/**
 * Design System Tokens - Newspaper Aesthetic
 *
 * Single source of truth for design system values.
 * These tokens are imported by tailwind.config.ts and used across all components.
 *
 * @see docs/PRD.md - Design System Principles
 * @see docs/architecture.md - Component Patterns
 */

export const designTokens = {
  /**
   * Color Palette - Newspaper Aesthetic
   * Black & white base with spot color for CTAs
   */
  colors: {
    /** Black - Primary text, borders, grid lines */
    primary: "#000000",
    /** White - Clean canvas background */
    background: "#FFFFFF",
    /** Blue - CTAs, links, highlights (spot color) */
    accent: "#1a73e8",
    /** Green - Completion states, success messages */
    success: "#0f9d58",
    /** Gray - Secondary text, captions, disabled states */
    neutral: "#757575",
  },

  /**
   * Typography Scale
   * Serif (Merriweather) for headers, Sans (Inter) for UI/body
   */
  typography: {
    fontFamily: {
      /** Serif font for headers and branding (newspaper style) */
      serif: ["var(--font-serif)", "Merriweather", "Georgia", "serif"],
      /** Sans-serif for UI elements (readability on screens) */
      sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
    },
    /** Typography scale based on design system requirements */
    scale: {
      xs: "0.75rem", // 12px - Small captions
      sm: "0.875rem", // 14px - UI labels, secondary text
      base: "1rem", // 16px - Body text
      lg: "1.125rem", // 18px - Large body
      xl: "1.25rem", // 20px - Small headings
      "2xl": "1.5rem", // 24px - H3
      "3xl": "1.875rem", // 30px - Medium headings
      "4xl": "2.25rem", // 36px - Large headings
      "5xl": "3rem", // 48px - Display (H1)
    },
  },

  /**
   * Spacing Scale - 8px Grid System
   * All spacing values follow 8px increments for consistency
   */
  spacing: {
    0: "0",
    1: "0.5rem", // 8px
    2: "1rem", // 16px
    3: "1.5rem", // 24px
    4: "2rem", // 32px
    5: "2.5rem", // 40px
    6: "3rem", // 48px
    8: "4rem", // 64px
    10: "5rem", // 80px
    12: "6rem", // 96px
    16: "8rem", // 128px
  },

  /**
   * Responsive Breakpoints
   * Mobile-first approach with defined breakpoints
   */
  screens: {
    mobile: { max: "767px" },
    tablet: { min: "768px", max: "1024px" },
    desktop: { min: "1025px" },
  },
} as const;

/**
 * Type exports for TypeScript safety
 */
export type DesignTokens = typeof designTokens;
export type ColorToken = keyof typeof designTokens.colors;
export type TypographyScale = keyof typeof designTokens.typography.scale;
export type SpacingToken = keyof typeof designTokens.spacing;
