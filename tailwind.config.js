/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        card: '#111111',
        'card-elevated': '#161616',
        gold: '#C9A84C',
        'gold-light': '#E8C87A',
        'gold-dark': '#9A7A35',
        border: '#222222',
        muted: '#888888',
      },
    },
  },
  plugins: [],
};
