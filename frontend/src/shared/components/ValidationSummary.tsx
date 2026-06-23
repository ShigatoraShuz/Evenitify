interface ValidationSummaryProps {
  errors: string[]
  title?: string
}

export function ValidationSummary({ errors, title = 'Review these items before continuing' }: ValidationSummaryProps) {
  if (errors.length === 0) return null
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" role="alert">
      <p className="font-medium">{title}</p>
      <ul className="mt-1 list-inside list-disc space-y-0.5">
        {errors.map((error) => <li key={error}>{error}</li>)}
      </ul>
    </div>
  )
}
