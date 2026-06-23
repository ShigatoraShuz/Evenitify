/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
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
