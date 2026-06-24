import { PlaceholderMedia } from './PlaceholderMedia'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  tone?: 'slate' | 'brand' | 'emerald' | 'amber'
}

export function EmptyState({ title, description, action, tone = 'slate' }: EmptyStateProps) {
  const toneClass = {
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    brand: 'border-brand-200 bg-brand-50 text-brand-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
  }[tone]

  return (
    <div className={`flex flex-col items-center justify-center rounded-[28px] border border-dashed px-4 py-10 text-center ${toneClass}`}>
      <div className="w-full max-w-md">
        <PlaceholderMedia title={title} subtitle={description} tone={tone} compact />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
