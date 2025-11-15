import type { Config } from "tailwindcss";
import { designTokens } from "./lib/design-tokens";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Newspaper aesthetic theme
      colors: {
        // Design system color palette
        primary: designTokens.colors.primary,
        background: designTokens.colors.background,
        accent: designTokens.colors.accent,
        success: designTokens.colors.success,
        neutral: designTokens.colors.neutral,
      },
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.scale,
      spacing: designTokens.spacing,
      screens: designTokens.screens,
    },
  },
  plugins: [],
};

export default config;
