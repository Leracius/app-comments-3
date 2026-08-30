/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        palette: {
          bondi: "#0799b6",
          "bondi-hover": "#05839c",
          "bondi-light": "#e5f5f8",
          "bondi-subtle": "#f0f9fa",
          sanmarino: "#4a6eb0",
          "sanmarino-hover": "#3a5b98",
          "sanmarino-light": "#edf2f9",
          eden: "#114c5f",
          "eden-text": "#0d3947",
          "eden-light": "#1d6a83",
          "eden-dark": "#0c2731",
          "eden-darker": "#071c24",
          "eden-card": "#102f3a",
          sinbad: "#9cd2d3",
          "sinbad-bubble": "#e8f4f5",
          "sinbad-light": "#f1f8f9",
          "sinbad-dark": "#163a46",
          janna: "#f2e6cf",
          "janna-light": "#fcf8f0",
          "janna-border": "#e8dac0",
          "janna-dark": "#3d3527",
        },
      },
    },
  },
  plugins: [],
};



