/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Segoe UI Variable', 'Segoe UI', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef6fb',
          100: '#dbeaf5',
          200: '#b5d3ea',
          300: '#84b6db',
          400: '#5696c9',
          500: '#2f78b5',
          600: '#205f96',
          700: '#184a76',
          800: '#143e62',
          900: '#12344f',
          950: '#0b2238',
        },
        ink: {
          50: '#eef2f7',
          100: '#d9e0ea',
          200: '#b8c6d8',
          300: '#8ea2ba',
          400: '#637996',
          500: '#44566f',
          600: '#314058',
          700: '#223044',
          800: '#182434',
          900: '#0f1724',
          950: '#09111b',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#eef3f8',
          subtle: '#f8fbfe',
        },
        status: {
          pending: '#b45309',
          accepted: '#047857',
          rejected: '#b91c1c',
          'changes-requested': '#c2410c',
          'contract-sent': '#6d28d9',
          confirmed: '#0f766e',
          completed: '#15803d',
          cancelled: '#475569',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
        elevated: '0 18px 45px rgba(15, 23, 42, 0.12)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'brand-fade': 'linear-gradient(180deg, rgba(15, 76, 129, 0.08) 0%, rgba(15, 76, 129, 0) 100%)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      transitionDuration: {
        250: '250ms',
      },
      letterSpacing: {
        tighter: '-0.03em',
      },
      lineHeight: {
        snug: '1.15',
      },
    },
  },
  plugins: [],
};
