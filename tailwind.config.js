const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'blue-100': 'rgb(141,183,211)',
        'blue-200': 'rgb(111,163,199)',
        'blue-300': 'rgb(43,123,177)',
        'blue-400': 'rgb(37,108,156)',
        'blue-500': 'rgb(33,92,134)',
        'blue-600': 'rgb(28,80,117)',
        'blue-700': 'rgb(30,74,110)',
        'blue-800': 'rgb(21,65,96)',
        'blue-900': 'rgb(17,52,75)',
        'blue-aivis-drop': 'rgb(43,127,210)',
        'blue-aivis-drop-light': 'rgb(82,159,235)',
        'orange-400': 'rgb(234,131,66)',
        'orange-500': 'rgb(237,236,1)',
        'green-400': 'rgb(88,158,88)',
        'green-500': 'rgb(86,195,94)', //'rgb(68,160,68)',
        'green-600': 'rgb(66,127,66)',
      },
      backgroundColor: ['active'],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
