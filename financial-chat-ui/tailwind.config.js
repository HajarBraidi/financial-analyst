/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      colors: {
        finance: {
          950: '#030a17',
          900: '#061329',
          850: '#091c3d',
          800: '#0e2652',
          700: '#143673',
          navy: '#0b1e3f',
          gold: '#f59e0b',
          glow: '#38bdf8',
        },
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(180deg, #051329 0%, #081a38 60%, #030a17 100%)',
        'candlestick-glow': 'radial-gradient(ellipse at 80% 20%, rgba(56, 189, 248, 0.15), transparent 70%)',
      },
    },
  },
  plugins: [],
};