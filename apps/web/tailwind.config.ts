import type { Config } from "tailwindcss";

// Identité de marque Assiettly : chaleureuse et motivante, sans reprendre les
// codes visuels des apps concurrentes (pas de rouge/orange "CalAI" pur).
// Corail comme couleur d'action, sarcelle comme accent santé/fraîcheur,
// ambre pour la mécanique de la flamme — sur un fond ivoire chaud.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        creme: {
          50: "#FEFCFA",
          100: "#FBF4EC",
          200: "#F5E6D8",
        },
        corail: {
          50: "#FFF1EC",
          100: "#FFDCD0",
          400: "#F97F5E",
          500: "#F2603C",
          600: "#DA4B2A",
          700: "#B23A20",
        },
        sarcelle: {
          50: "#EAF6F3",
          100: "#CDE9E2",
          400: "#3E9E8D",
          500: "#1F7A6C",
          600: "#166057",
        },
        ambre: {
          300: "#FFCB7A",
          400: "#FFB648",
          500: "#F2953C",
        },
        charbon: {
          400: "#6B615B",
          600: "#463C36",
          800: "#2B2320",
        },
      },
      fontFamily: {
        titre: ["var(--font-fredoka)", "sans-serif"],
        corps: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
