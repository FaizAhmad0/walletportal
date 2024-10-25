/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Times New Roman", "IBM Plex Sans", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
};
