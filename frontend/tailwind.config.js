/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F7F7F5',
        surface: '#FFFFFF',
        slate: {
          800: '#2D3748',
          600: '#4A5568',
          500: '#718096',
          200: '#E2E8F0',
        },
        mint: '#4ADE80',
        mintDark: '#22C55E',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
