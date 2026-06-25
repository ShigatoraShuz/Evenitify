interface ValidationSummaryProps {
  errors: string[]
  title?: string
}

export function ValidationSummary({ errors, title = 'Review these items before continuing' }: ValidationSummaryProps) {
  if (errors.length === 0) return null
  return (
    <div className="rounded-xl border border-amber-900/50 bg-amber-950/30 p-4 text-sm text-amber-500" role="alert">
      <p className="font-medium text-amber-400">{title}</p>
      <ul className="mt-1.5 list-inside list-disc space-y-0.5">
        {errors.map((error) => <li key={error}>{error}</li>)}
      </ul>
    </div>
  )
}
