import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        gold: {
          DEFAULT: "#C8922A",
          light: "#F2D080",
          dark: "#A07320",
          surface: "rgba(200,146,42,0.15)",
        },
        forest: {
          dark: "#0D1F1A",
          mid: "#162D25",
          light: "#1E3D2F",
          bright: "#40916C",
        },
        glass: {
          white: "rgba(255,255,255,0.09)",
          "white-sm": "rgba(255,255,255,0.14)",
          "white-md": "rgba(255,255,255,0.18)",
          border: "rgba(255,255,255,0.17)",
          "border-gold": "rgba(200,146,42,0.25)",
        },
        cat: {
          tents: "#9B8EFF",
          sleep: "#52C788",
          furniture: "#52A8E8",
          catering: "#F2B055",
          food: "#7ED348",
          wash: "#FF7A5A",
          power: "#FF78B0",
          ops: "#A8A4A0",
        },
      },
      backgroundImage: {
        "forest-gradient": "linear-gradient(135deg, #0A1510 0%, #0D1F1A 40%, #162D25 70%, #0A1510 100%)",
        "gold-gradient": "linear-gradient(135deg, #A07320 0%, #C8922A 50%, #F2D080 100%)",
        "glass-card": "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)",
      },
      backdropBlur: {
        xs: "2px",
        glass: "12px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        "glass-sm": "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
        gold: "0 4px 20px rgba(200,146,42,0.3)",
        "gold-lg": "0 8px 32px rgba(200,146,42,0.4)",
      },
      animation: {
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "fade-up": "fade-up 0.4s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(200,146,42,0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(200,146,42,0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
