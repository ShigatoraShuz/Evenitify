interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
  hint?: string
}

export function Select({ label, error, options, placeholder, hint, id, className = '', ...props }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-[border-color,box-shadow,background-color] duration-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 hover:border-slate-300'} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint && selectId ? `${selectId}-hint` : null, error && selectId ? `${selectId}-error` : null].filter(Boolean).join(' ') || undefined}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {hint && !error && selectId && <p id={`${selectId}-hint`} className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && <p id={selectId ? `${selectId}-error` : undefined} className="mt-1.5 text-sm text-red-600" role="alert">{error}</p>}
    </div>
  )
}
