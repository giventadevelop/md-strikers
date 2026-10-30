/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        /*
         * MD Strikers brand palette, taken from the club crest. Values live in CSS variables
         * (src/app/globals.css, "MD STRIKERS BRAND DESIGN SYSTEM"). `pitch-*` names are roles:
         * charcoal = dark surface / dark text, forest = secondary dark surface,
         * olive = deep brand red for accents on light, lime = crest gold for accents on dark,
         * chalk = warm white surface / light text, stone = muted text.
         */
        pitch: {
          forest: "rgb(var(--md-rgb-dark-secondary) / <alpha-value>)",
          charcoal: "rgb(var(--md-rgb-dark) / <alpha-value>)",
          olive: "rgb(var(--md-rgb-primary-deep) / <alpha-value>)",
          chalk: "rgb(var(--md-rgb-light) / <alpha-value>)",
          stone: "rgb(var(--md-rgb-muted) / <alpha-value>)",
          lime: "rgb(var(--md-rgb-accent) / <alpha-value>)",
        },
        brand: {
          red: "rgb(var(--md-rgb-primary) / <alpha-value>)",
          "red-deep": "rgb(var(--md-rgb-primary-deep) / <alpha-value>)",
          orange: "rgb(var(--md-rgb-secondary) / <alpha-value>)",
          gold: "rgb(var(--md-rgb-accent) / <alpha-value>)",
          dark: "rgb(var(--md-rgb-dark) / <alpha-value>)",
          "dark-2": "rgb(var(--md-rgb-dark-secondary) / <alpha-value>)",
          light: "rgb(var(--md-rgb-light) / <alpha-value>)",
          text: "rgb(var(--md-rgb-text) / <alpha-value>)",
          muted: "rgb(var(--md-rgb-muted) / <alpha-value>)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      boxShadow: {
        pitch: "0 24px 48px -24px rgba(0, 0, 0, 0.55)",
        "pitch-soft": "0 12px 32px -16px rgba(23, 23, 23, 0.25)",
        brand: "0 10px 24px -10px rgba(239, 48, 34, 0.55)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

