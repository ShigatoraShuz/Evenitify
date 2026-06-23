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
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <select
        id={selectId}
        className={`w-full px-3 py-2 rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white ${className}`}
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
