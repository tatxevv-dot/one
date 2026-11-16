import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        zone: {
          black: "#000000",
          surface: "#111113",
          elevated: "#1C1C1E",
          border: "#2C2C2E",
          muted: "#8E8E93",
          accent: "#0A84FF"
        }
      }
    }
  },
  plugins: []
};

export default config;
