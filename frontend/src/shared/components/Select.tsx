interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, options, placeholder, id, className = '', ...props }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      )}
      <select
        id={selectId}
        className={[
          'w-full px-4 py-2.5 rounded-xl border',
          error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/25',
          'focus:outline-none focus:ring-4 text-sm bg-white shadow-sm transition-all',
          className,
        ].join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && selectId ? `${selectId}-error` : undefined}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p id={selectId ? `${selectId}-error` : undefined} className="mt-1 text-sm text-red-600" role="alert">{error}</p>}
    </div>
  )
}
