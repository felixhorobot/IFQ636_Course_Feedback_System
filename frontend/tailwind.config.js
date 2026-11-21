module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // QUT colour, take from QUT Online website. same as our Figma
      colors: {
        qut: {
          brand: '#003865',
          denim: '#0066B9',
          sky: '#009FE3',
          poly: '#00569C',
          navy: '#011E36',
          bg: '#ECF0F4',
          copy: '#666C70',
          outline: '#7C98AF',
          pink: '#B8296D',
          skytint: '#E5F5FC',
          pinktint: '#F8E9F0',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
