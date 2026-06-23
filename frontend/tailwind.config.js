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
