/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e8f6fa',
          100: '#cfeaf4',
          200: '#a0daec',
          300: '#64c3db',
          400: '#38AECC',
          500: '#18a0b7',
          600: '#0090C1',
          700: '#046E8F',
          800: '#045e79',
          900: '#034963',
          950: '#183446',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0a1c2e',
        },
        status: {
          pending: '#f59e0b',
          accepted: '#10b981',
          rejected: '#ef4444',
          'changes-requested': '#f97316',
          'contract-sent': '#8b5cf6',
          confirmed: '#06b6d4',
          completed: '#22c55e',
          cancelled: '#6b7280'
        }
      }
    }
  },
  plugins: []
};
