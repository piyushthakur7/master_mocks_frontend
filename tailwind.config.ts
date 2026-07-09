import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // 🌟 Cover paths inside the src folder
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/src/app/**/*.{js,ts,jsx,tsx,mdx}",
    
    // 🌟 Cover paths at the root folder level
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./compnents/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#D00113", // Your signature crimson red[cite: 1]
          hover: "#b0010f",   
          light: "#fff5f5",   
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;