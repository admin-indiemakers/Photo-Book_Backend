/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF9F4',
        canvas: '#FFFFFF', // Clean white
        ink: '#2B2420', // Dark contrast
        muted: '#8A7B6E',
        border: '#F0E4D8',
        brand: {
          50: '#FFF3EC',
          100: '#FFE3D2',
          200: '#FFC7A3',
          300: '#FFA268',
          400: '#F47C3C',
          500: '#E85D2C', // primary orange
          600: '#C94A1F',
          700: '#A23A18',
          800: '#7A2C13',
          900: '#521D0C',
        },
        success: '#2F9E64',
        warning: '#E4A72D',
        danger: '#D8483B',
        info: '#3B82C4',
      },
      fontFamily: {
        editorial: ['"Playfair Display"', '"Merriweather"', 'serif'],
        functional: ['"Inter"', '"Outfit"', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.25rem',
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        paper: '0 4px 12px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
      },
    },
  },
  plugins: [],
};
