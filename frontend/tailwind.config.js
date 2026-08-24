/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          500: "#3b6fed",
          600: "#2f5cd6",
          700: "#2749a8",
        },
      },
      keyframes: {
        blink: {
          "0%, 80%, 100%": { opacity: 0.2 },
          "40%": { opacity: 1 },
        },
      },
      animation: {
        blink: "blink 1.4s infinite both",
      },
    },
  },
  plugins: [],
};
