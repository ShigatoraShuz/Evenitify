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
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-cyan-200 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(243,248,252,0.9)_100%)] px-4 py-10 text-center shadow-[0_16px_42px_rgba(15,23,42,0.05)]">
      <div className="w-full max-w-md">
        <PlaceholderMedia title={mediaTitle || title} subtitle={mediaSubtitle !== undefined ? mediaSubtitle : description} tone="slate" compact />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
