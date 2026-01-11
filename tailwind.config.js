/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['var(--font-playfair)'],
        manrope: ['var(--font-manrope)'],
        'great-vibes': ['var(--font-great-vibes)'],
        montserrat: ['var(--font-montserrat)'],
        lato: ['var(--font-lato)'],
        cinzel: ['var(--font-cinzel)'],
        cormorant: ['var(--font-cormorant)'],
        dancing: ['var(--font-dancing)'],
      },
      colors: {
        gold: { 500: '#D4AF37', 600: '#AA8C2C' },
      }
    },
  },
  plugins: [],
};