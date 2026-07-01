import type { Config } from "tailwindcss";

/**
 * VENTIS GROUP design system — mirrors ventis.lovable.app exactly.
 * Two-tone editorial palette: deep emerald ⟷ ivory cream, champagne-gold accent.
 * Colors use the live build's oklch tokens verbatim for an exact match.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark (emerald) context — `<alpha-value>` keeps opacity modifiers (/80) working.
        bg: {
          base: "oklch(22% 0.045 165 / <alpha-value>)", // --emerald-deep
          elev: "oklch(30% 0.06 165 / <alpha-value>)",  // --emerald
          deep: "oklch(19% 0.04 165 / <alpha-value>)",  // deepest gradient floor
        },
        ink: {
          DEFAULT: "oklch(97% 0.012 90 / <alpha-value>)", // --ivory
          muted: "oklch(78% 0.02 150 / <alpha-value>)",   // sage ivory on emerald
        },
        // Light (cream) context
        cream: {
          DEFAULT: "oklch(97% 0.012 90 / <alpha-value>)", // --ivory page bg
          elev: "oklch(100% 0 0 / <alpha-value>)",        // --card white
          line: "oklch(88% 0.02 90 / <alpha-value>)",     // --border
          ink: "oklch(22% 0.045 165 / <alpha-value>)",    // --emerald-deep text
          muted: "oklch(45% 0.03 165 / <alpha-value>)",   // --muted-foreground
        },
        accent: {
          DEFAULT: "rgb(249 216 109 / <alpha-value>)", // --gold #f9d86d
          soft: "rgb(251 228 154 / <alpha-value>)",    // --gold-soft (hover)
        },
        line: "oklch(40% 0.03 165 / <alpha-value>)", // hairline on emerald
      },
      borderRadius: {
        brand: "1rem", // --radius
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Barlow Condensed", "Oswald", "sans-serif"],
        sans: ["var(--font-sans)", "Manrope", "Inter", "system-ui", "sans-serif"],
        quote: ["var(--font-quote)", "Playfair Display", "Georgia", "serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        hero: ["clamp(3rem, 6.5vw, 7rem)", { lineHeight: "0.95", letterSpacing: "-0.01em" }],
        display: ["clamp(2.25rem, 4.8vw, 4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
      },
      maxWidth: {
        shell: "1280px",
      },
      spacing: {
        section: "120px",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      letterSpacing: {
        eyebrow: "0.25em",
      },
    },
  },
  plugins: [],
};

export default config;
