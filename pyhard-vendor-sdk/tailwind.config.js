/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'space-mono': ['Space Mono', 'monospace'],
      },
      colors: {
        'pyhard-blue': '#0079c1',
        'pyhard-dark': '#0a0e27',
      }
    },
  },
  plugins: [],
}
