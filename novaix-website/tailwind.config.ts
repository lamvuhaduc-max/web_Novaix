import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#070b16",
        "bg-2": "#0b1120",
        ink: "#eef2fb",
        muted: "#8b97b4",
        line: "rgba(255,255,255,0.08)",
        accent: "#2dd4bf",
        "accent-2": "#38bdf8",
        "accent-3": "#fbbf24",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      animation: {
        marquee: "marquee 26s linear infinite",
        spin18: "spin 18s linear infinite",
        spin18r: "spin 18s linear infinite reverse",
      },
      keyframes: {
        marquee: { to: { transform: "translateX(-50%)" } },
      },
    },
  },
  plugins: [],
};
export default config;
