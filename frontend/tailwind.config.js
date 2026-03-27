/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gsite: {
          bg: "#000000",
          card: "#161616",
          border: "#2a2a2a",
          accent: "#ffffff",
          accentHover: "#e0e0e0",
          gold: "#c6c6c6",
          silver: "#969696",
          bronze: "#6b6b6b",
          cyan: "#ababab",
          text: "#e2e2e2",
          muted: "#696969",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"Montserrat"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
