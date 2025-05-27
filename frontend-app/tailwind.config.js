/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': 'var(--primary-bg)',
        'primary-text': 'var(--primary-text)',
        'secondary-text': 'var(--secondary-text)',
        'accent-color': 'var(--accent-color)',
        'accent-text-color': 'var(--accent-text-color)',
        'card-bg': 'var(--card-bg)',
        'border-color': 'var(--border-color)',
        'input-bg': 'var(--input-bg)',
      }
    },
  },
  plugins: [],
}