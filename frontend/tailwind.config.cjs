/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#FBF2F4',
          100: '#F5E1E5',
          200: '#ECC7CE',
          300: '#DEA3AD',
          400: '#C77181',
          500: '#A74457',
          600: '#892E40',
          700: '#6E2232',
          800: '#521623',
          900: '#3F0E18',
          950: '#26070E',
        },
        ivory: {
          50: '#FCFBF8',
          100: '#FAF7F2',
          200: '#F4EEE4',
          300: '#ECE1D2',
          400: '#DECDB6',
          500: '#CDB596',
        },
        gold: {
          50: '#FCF9EE',
          100: '#F8F1D5',
          200: '#F0E1A7',
          300: '#E6CC73',
          400: '#DCB745',
          500: '#CBA32A',
          600: '#B08620',
          700: '#8B651B',
          800: '#70501B',
          900: '#5E421B',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'luxury': '0 4px 20px -2px rgba(63, 14, 24, 0.05), 0 2px 6px -1px rgba(63, 14, 24, 0.03)',
        'luxury-hover': '0 10px 25px -3px rgba(63, 14, 24, 0.09), 0 4px 10px -2px rgba(63, 14, 24, 0.05)',
      }
    },
  },
  plugins: [],
}
