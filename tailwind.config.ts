import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172121",
        paper: "#f8faf8",
        brand: {
          DEFAULT: "#0f8b8d",
          dark: "#0b6869",
          soft: "#d9f0ef"
        },
        accent: "#f25f5c"
      },
      boxShadow: {
        panel: "0 16px 45px rgba(23, 33, 33, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
