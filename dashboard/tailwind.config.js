/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        blueprint: {
          900: "#0B1826",
          800: "#12233A",
          700: "#1B3350",
          600: "#2C4A6E",
        },
        cyanline: "#7FD4E8",
        amber: {
          signal: "#FFB343",
        },
        ink: "#E7EEF4",
        "slate-signal": "#7C93AC",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "blueprint-grid":
          "linear-gradient(rgba(127,212,232,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(127,212,232,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "24px 24px",
      },
    },
  },
  plugins: [],
};
