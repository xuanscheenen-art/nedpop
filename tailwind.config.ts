import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#102a56",
        ocean: "#174a8b",
        skywash: "#eef6ff",
        pop: "#ff9d45",
        peach: "#fff1e5",
        mint: "#dcf8ef",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(16, 42, 86, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
