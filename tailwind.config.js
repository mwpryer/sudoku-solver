const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./index.html"],
  darkMode: false,
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "768px",
        md: "768px",
        lg: "768px",
        xl: "768px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        gray: {
          ...colors.gray,
          1000: "#050505",
        },
      },
    },
  },
  variants: {
    extend: {
      ringWidth: ["focus-visible"],
      opacity: ["disabled"],
      cursor: ["disabled"],
    },
  },
  plugins: [],
};
