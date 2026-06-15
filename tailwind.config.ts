import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9eeff",
          500: "#1f8fff",
          600: "#0f72d9",
          700: "#0b57a4"
        },
        trust: {
          50: "#ecfdf5",
          100: "#d1fae5",
          600: "#059669",
          700: "#047857"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
export default config;
