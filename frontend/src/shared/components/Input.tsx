interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">{label}</label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-2.5 rounded-xl border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/25'} focus:outline-none focus:ring-4 text-sm bg-white shadow-sm transition-all placeholder-slate-400 ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">{error}</p>}
    </div>
  )
}
