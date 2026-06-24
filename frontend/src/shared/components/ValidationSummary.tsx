interface ValidationSummaryProps {
  errors: string[]
  title?: string
}

export function ValidationSummary({ errors, title = 'Review these items before continuing' }: ValidationSummaryProps) {
  if (errors.length === 0) return null
  return (
    <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="alert" aria-live="polite">
      <p className="font-semibold">{title}</p>
      <ul className="mt-2 list-inside list-disc space-y-1">
        {errors.map((error) => <li key={error}>{error}</li>)}
      </ul>
    </div>
  )
}
