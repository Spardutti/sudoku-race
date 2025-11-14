import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Newspaper aesthetic theme preparation
      // Color palette will be defined in Story 1.5
      colors: {
        // Placeholders for newspaper aesthetic colors
        newspaper: {
          // To be populated in Story 1.5
        },
      },
      fontFamily: {
        // Serif fonts for newspaper aesthetic
        // Will be configured with custom fonts in Story 1.5
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
