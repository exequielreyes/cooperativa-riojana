import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Tokens tomados de los prototipos de Figma
        primary: {
          DEFAULT: "#0F3D3A", // verde botella institucional (headers, botones, sidebar)
          light: "#155E58",
          dark: "#0A2C29",
        },
        accent: {
          DEFAULT: "#C99A3C", // dorado/mostaza para acentos y badges premium
          light: "#E0B968",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F5F6F5", // fondo gris claro de secciones
          border: "#E4E6E3",
        },
        status: {
          success: "#2E9E5B",
          warning: "#D9A441",
          danger: "#D64545",
          info: "#3B6FD9",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
