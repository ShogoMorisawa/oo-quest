import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        "retro": "0 0 0 2px rgba(255,255,255,0.18), 0 14px 40px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};

export default config;
