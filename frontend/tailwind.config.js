/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // IEA Official Colors
        primary: {
          DEFAULT: '#1e3a8a', // Deep Navy (Header/Footer)
          light: '#2563eb',   // Bright Blue (Buttons/Links)
          dark: '#172554',    // Darkest Blue (Sidebar)
        },
        secondary: {
          DEFAULT: '#f59e0b', // Amber/Yellow (Energy Highlights)
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Clean Modern Font
      }
    },
  },
  plugins: [],
}