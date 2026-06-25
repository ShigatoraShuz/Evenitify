import { PlaceholderMedia } from './PlaceholderMedia'

interface EmptyStateProps {
  title: string
  description?: string
  mediaTitle?: string
  mediaSubtitle?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, mediaTitle, mediaSubtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
      <div className="w-full max-w-md">
        <PlaceholderMedia title={mediaTitle || title} subtitle={mediaSubtitle !== undefined ? mediaSubtitle : description} tone="slate" compact />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
