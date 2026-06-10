/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0A1628',
        gold: '#FFD700',
        'electric-blue': '#00A3E0',
      },
    },
  },
  plugins: [],
};
