/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.html", "./src/**/*.vue"],
  darkMode: "class",
  corePlugins: {
    preflight: true,
  },
  variants: {
    extend: {
      display: ["group-hover"],
    },
  },
  theme: {
    extend: {
      screens: {
        "3xl": "1724px",
        "4xl": "2160px",
      },
      colors: {
        primary: "#1a202c",
        secondary: "#c7d2fe",
        accent: "#8d93ab",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Georgia", "serif"],
        mono: ["Monaco", "monospace"],
      },
      fontSize: {
        xxxs: ".4rem",
        xxs: ".7rem",
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "4rem",
        "7xl": "5rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
        "10xl": "90%",
      },
      height: {
        xl: "36rem",
        xxl: "44rem",
        xxxl: "53rem",
      },
      colors: {
        primary: "#6366f1",
        secondary: "#94a3b8",
        accent: "#0ea5e9",
        positive: "#34d399",
        negative: "#f43f5e",
        info: "#16B1FF",
        warning: "#fbbf24",
      },
    },
  },
  prefix: "tw-",
  plugins: [],
};
