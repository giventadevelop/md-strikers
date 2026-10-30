import type { Config } from 'tailwindcss';
import animate from "tailwindcss-animate";

const config = {
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
        // Add custom color variables
        "dark-background": "var(--color-dark-background)",
        "medium-gray": "var(--color-medium-gray)",
        "yellow-accent": "var(--color-yellow-accent)",
        "blue-accent": "var(--color-blue-accent)",
        "green-accent": "var(--color-green-accent)",
        "pink-accent": "var(--color-pink-accent)",
        "cyan-accent": "var(--color-cyan-accent)",
        "progress-background": "var(--color-progress-background)",
        // mosc_site_re_design.json — parchment family
        parchment: {
          DEFAULT: "#F5EDD8",
          deep: "#EDE0C4",
          mid: "#F0E6CC",
          light: "#FDFAF3",
        },
        burgundy: {
          DEFAULT: "#C0284A",
          dark: "#8B1030",
          light: "#E8406A",
          muted: "#E8899A",
        },
        warmBrown: {
          DEFAULT: "#7A1E35",
          light: "#9E2A48",
          dark: "#3D0D0D",
        },
        warmGold: {
          DEFAULT: "#C8860A",
          dark: "#A06808",
          light: "#E8A830",
        },
        warmGray: {
          light: "#D4C4C4",
          DEFAULT: "#9E8080",
          dark: "#5C3D3D",
        },
        // Syro-Malabar Design System (was only in tailwind.config.js — keep both stacks in one config)
        "syro-red": {
          DEFAULT: "#dc3545",
          darker: "#be1929",
          hover: "#990b3f",
          light: "#dc354533",
        },
        "syro-blue": {
          DEFAULT: "#0b2848",
          secondary: "#011e94",
          light: "#798daf",
          dark: "#16253c",
        },
        "syro-orange": "#ff7903",
        "syro-purple": "#6e1b48",
        "syro-maroon": "#77121b",
        "syro-light-gray": "#eaebef",
        "syro-bg-gray": "#f5f6f7",
        "syro-text-gray": "#818181",
        "syro-medium-gray": "#7b869a",
        "syro-dark-gray": "#506276",
        "syro-table-border": "#eaebef",
        "syro-success": {
          DEFAULT: "#25d366",
          bg: "#25d36633",
        },
        "syro-warning": {
          DEFAULT: "#ff7903",
          bg: "#ffc81533",
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
        "marquee-slow": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "marquee-slow": "marquee-slow 30s linear infinite",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        script: "var(--font-script)",
        "dm-sans": ["var(--font-dm-sans)", "DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        "syro-primary": ["Poppins", "Arial", "Helvetica", "sans-serif"],
        "syro-display": ["Playfair Display", "serif"],
      },
      fontSize: {
        "syro-logo": "1.5rem",
        "syro-h1": "2.8rem",
        "syro-h2": "2.2rem",
        "syro-h3": "1.8rem",
        "syro-h4": "1.5rem",
        "syro-h6": "18px",
        "syro-body": "20px",
        "syro-label": "16px",
        "syro-small": "14px",
        "syro-section-title": "24px",
      },
      spacing: {
        "syro-xs": "5px",
        "syro-sm": "10px",
        "syro-md": "15px",
        "syro-lg": "20px",
        "syro-xl": "30px",
        "syro-xxl": "40px",
        "syro-xxxl": "60px",
      },
      boxShadow: {
        "syro-header": "#0b28487d 0px 10px 25px -10px",
        "syro-card":
          "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
        "syro-card-hover": "rgba(0, 0, 0, 0.35) 0px 5px 15px",
      },
      screens: {
        "syro-tablet": "991px",
        "syro-mobile": "576px",
      },
    },
  },
  plugins: [animate],
} satisfies Config;

export default config;