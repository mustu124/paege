import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
    },
    extend: {
      colors: {
        // rgb(var(--x) / <alpha-value>) — not a bare var() reference —
        // is required for Tailwind's opacity modifier (bg-cream/95,
        // text-charcoal-500/40, etc.) to work with these CSS-variable
        // colors. See the comment in app/globals.css for why.
        cream: {
          DEFAULT: "rgb(var(--color-cream) / <alpha-value>)",
          50: "rgb(var(--color-cream-50) / <alpha-value>)",
          100: "rgb(var(--color-cream-100) / <alpha-value>)",
        },
        burgundy: {
          DEFAULT: "rgb(var(--color-burgundy) / <alpha-value>)",
          50: "rgb(var(--color-burgundy-50) / <alpha-value>)",
          600: "rgb(var(--color-burgundy-600) / <alpha-value>)",
          700: "rgb(var(--color-burgundy-700) / <alpha-value>)",
          800: "rgb(var(--color-burgundy-800) / <alpha-value>)",
        },
        charcoal: {
          DEFAULT: "rgb(var(--color-charcoal) / <alpha-value>)",
          500: "rgb(var(--color-charcoal-500) / <alpha-value>)",
          700: "rgb(var(--color-charcoal-700) / <alpha-value>)",
          900: "rgb(var(--color-charcoal-900) / <alpha-value>)",
        },
        border: "rgb(var(--color-border) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["var(--font-editorial-serif)", "Georgia", "serif"],
        sans: ["var(--font-ui-sans)", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "1px",
        sm: "2px",
        md: "2px",
        lg: "3px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        subtleLg: "0 4px 16px 0 rgb(0 0 0 / 0.06)",
      },
      letterSpacing: {
        wide: ".05em",
        wider: ".12em",
        widest: ".2em",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
