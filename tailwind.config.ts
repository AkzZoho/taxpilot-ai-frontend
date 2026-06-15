import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a5f",
          950: "#0f1e3d",
        },
        trust: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        amber: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        rose: {
          50: "#fff1f2",
          100: "#ffe4e6",
          500: "#f43f5e",
          600: "#e11d48",
        },
      },
      boxShadow: {
        soft: "0 2px 8px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.04)",
        card: "0 4px 24px rgba(15,23,42,0.08)",
        glow: "0 0 0 3px rgba(37,99,235,0.15)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0f1e3d 0%, #1d4ed8 100%)",
        "trust-gradient": "linear-gradient(135deg, #047857 0%, #10b981 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
