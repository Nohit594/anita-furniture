import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FDF6EC",
        terracotta: {
          DEFAULT: "#C4622D",
          light: "#D97B45",
          dark: "#A34E20",
        },
        saddle: "#8B4513",
        peach: "#E8A87C",
        espresso: "#2D1B0E",
        sand: "#F5E6D3",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        warm: "0 10px 40px -10px rgba(196, 98, 45, 0.35)",
        "warm-lg": "0 20px 60px -12px rgba(139, 69, 19, 0.4)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      backgroundImage: {
        "warm-gradient": "linear-gradient(135deg, #C4622D 0%, #E8A87C 100%)",
        "hero-gradient":
          "radial-gradient(ellipse at top left, rgba(232,168,124,0.4), transparent 50%), radial-gradient(ellipse at bottom right, rgba(196,98,45,0.25), transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default config;
