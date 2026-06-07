import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        paddox: {
          black: "#050505",
          graphite: "#101114",
          panel: "#15161a",
          soft: "#202126",
          red: "#e10600",
          redDark: "#8f0502",
          silver: "#d7d7dc",
          muted: "#8d9099",
          gold: "#c8a45d"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial", "sans-serif"],
        body: ["var(--font-body)", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      boxShadow: {
        command: "0 24px 80px rgba(0,0,0,.42)",
        redGlow: "0 0 42px rgba(225,6,0,.22)"
      },
      backgroundImage: {
        radialRed: "radial-gradient(circle at top right, rgba(225,6,0,.22), transparent 34%)",
        trackGrid: "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
