import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, id, className = '', ...props }, ref) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 hover:border-slate-300'} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? `${inputId}-hint` : null, error ? `${inputId}-error` : null].filter(Boolean).join(' ') || undefined}
        {...props}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
