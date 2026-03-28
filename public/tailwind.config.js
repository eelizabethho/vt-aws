/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        vt: {
          maroon: '#861F41',
          'maroon-dark': '#6B1835',
          orange: '#E87722',
          'orange-light': '#F5A623',
          cream: '#F0E6D2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
