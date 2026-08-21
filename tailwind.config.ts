import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", "dark"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "oklch(var(--card) / <alpha-value>)",
          foreground: "oklch(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "oklch(var(--popover) / <alpha-value>)",
          foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "oklch(var(--border) / <alpha-value>)",
        input: "oklch(var(--input) / <alpha-value>)",
        ring: "oklch(var(--ring) / <alpha-value>)",
        chart: {
          "1": "oklch(var(--chart-1) / <alpha-value>)",
          "2": "oklch(var(--chart-2) / <alpha-value>)",
          "3": "oklch(var(--chart-3) / <alpha-value>)",
          "4": "oklch(var(--chart-4) / <alpha-value>)",
          "5": "oklch(var(--chart-5) / <alpha-value>)",
        },
      },
      fontFamily: {
        body: ["var(--font-body)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "oklch(var(--foreground))",
            a: {
              color: "oklch(var(--primary))",
              "&:hover": {
                color: "oklch(var(--foreground-soft))",
              },
            },
            h1: {
              fontSize: "2.25rem",
              fontWeight: "bold",
              color: "oklch(var(--foreground))",
            },
            h2: {
              fontSize: "1.875rem",
              fontWeight: "semibold",
              color: "oklch(var(--foreground))",
            },
            h3: {
              fontSize: "1.5rem",
              fontWeight: "semibold",
              color: "oklch(var(--foreground))",
            },
            pre: {
              backgroundColor: "oklch(var(--muted))",
              color: "oklch(var(--foreground))",
              padding: "1rem",
              borderRadius: "0.5rem",
              overflowX: "auto",
            },
            code: {
              backgroundColor: "oklch(var(--muted))",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
            },
          },
        },
        dark: {
          css: {
            color: "oklch(var(--foreground))",
            a: {
              color: "oklch(var(--primary))",
              "&:hover": {
                color: "oklch(var(--foreground-soft))",
              },
            },
            pre: {
              backgroundColor: "oklch(var(--muted))",
            },
            code: {
              backgroundColor: "oklch(var(--muted))",
            },
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
