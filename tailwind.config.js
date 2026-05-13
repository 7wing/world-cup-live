/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-container': '#00ff41',
        'on-primary': '#003907',
        'on-primary-container': '#007117',
        'surface': '#121414',
        'surface-container': '#1e2020',
        'surface-container-low': '#1a1c1c',
        'surface-container-high': '#282a2b',
        'surface-container-highest': '#333535',
        'on-surface': '#e2e2e2',
        'on-surface-variant': '#b9ccb2',
        'background': '#121414',
        'on-background': '#e2e2e2',
        'outline': '#84967e',
        'outline-variant': '#3b4b37',
        'secondary-container': '#ffdb3c',
        'on-secondary': '#3a3000',
        'error': '#ffb4ab',
        'error-container': '#93000a',
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-live': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}