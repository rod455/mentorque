import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mentorque brand palette
        graphite: {
          DEFAULT: "#16181D",
          900: "#101216",
          800: "#1E222B",
          700: "#272C35",
          600: "#333944",
        },
        amber: { DEFAULT: "#F2A623", 600: "#D98E18", 300: "#F7B53D" },
        teal: { DEFAULT: "#0F8A66", 600: "#0C7355" },
        coral: { DEFAULT: "#C24D26", 600: "#A83F1E" },
        cream: "#F4F2EC",
        ink: "#14161B",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(0,0,0,0.25)",
        card: "0 18px 40px -20px rgba(0,0,0,0.30)",
        glow: "0 10px 40px -10px rgba(242,166,35,0.35)",
      },
      spacing: { 13: "3.25rem" },
      maxWidth: { content: "1180px" },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { "fade-up": "fade-up 0.5s ease-out both" },
    },
  },
  plugins: [],
};

export default config;
