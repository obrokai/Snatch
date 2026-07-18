/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0d",
        paper: "#f5f5f7",
        accent: "#ff6b1a",
        "accent-soft": "#ff8a47",
        "accent-deep": "#e85d0a",
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};
