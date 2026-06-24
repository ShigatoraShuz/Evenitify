interface LoadingStateProps {
  label?: string
  compact?: boolean
}

export function LoadingState({ label = 'Loading…', compact = false }: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center rounded-[24px] border border-slate-200 bg-white ${compact ? 'min-h-32 p-4' : 'min-h-56 p-6'} shadow-[0_1px_2px_rgba(15,23,42,0.04)]`} role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" aria-hidden="true" />
        <span>{label}</span>
      </div>
    </div>
  )
}
