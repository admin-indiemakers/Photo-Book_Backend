/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF9F4',
        ink: '#2B2420',
        muted: '#8A7B6E',
        border: '#F0E4D8',
        brand: {
          50: '#FFF3EC',
          100: '#FFE3D2',
          200: '#FFC7A3',
          300: '#FFA268',
          400: '#F47C3C',
          500: '#E85D2C', // primary
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
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(43, 36, 32, 0.08)',
        card: '0 4px 20px -4px rgba(43, 36, 32, 0.10)',
      },
    },
  },
  plugins: [],
};
