/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gsite: {
          bg: "#0b0e17",
          card: "#111827",
          border: "#1e293b",
          accent: "#f43f5e",
          accentHover: "#e11d48",
          gold: "#fbbf24",
          silver: "#94a3b8",
          bronze: "#d97706",
          cyan: "#06b6d4",
          text: "#e2e8f0",
          muted: "#64748b",
        },
      },
      fontFamily: {
        display: ['"Rajdhani"', "sans-serif"],
        body: ['"Inter"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
