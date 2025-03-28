/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/*.html"],
  theme: {
    extend: {
      colors: {
        ESNblue: '#00aeef',  // Custom named color
        ESNpink: '#ec008c',   
        ESNorange: '#f47b20',
        ESNdarkblue: '#2e3192',
        ESNdarkblue1000: '#2e3192',
        ESNdarkblue500: '#8183DE',
        ESNdarkblue100: '#DCDCFA',
        ESNgreen: '#7ac143'
      }
    },
  },
  plugins: [],
}

