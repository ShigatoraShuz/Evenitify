interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base = [
    'inline-flex items-center justify-center px-4 py-2 rounded-xl',
    'font-medium text-sm transition-all duration-200 focus:outline-none',
    'focus:ring-2 focus:ring-offset-2 disabled:opacity-50',
    'disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]',
    'active:translate-y-0 shadow-sm',
  ].join(' ')
  const variants = {
    primary: 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-500 hover:to-brand-600 focus:ring-brand-500 shadow-brand-200/50 hover:shadow-lg hover:shadow-brand-500/10',
    secondary: 'bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-500 border border-slate-200 shadow-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-red-200/50 hover:shadow-md hover:shadow-red-500/10',
    ghost: 'text-slate-600 hover:bg-slate-50 focus:ring-slate-400 border border-transparent shadow-none hover:shadow-none'
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
