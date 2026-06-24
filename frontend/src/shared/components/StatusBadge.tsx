import { STATUS_COLORS } from '../constants/statusColors'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] || 'border-slate-200 bg-slate-50 text-slate-700'
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${colorClass} ${sizeClass}`}>
      <span className={`shrink-0 rounded-full bg-current ${dotSize}`} aria-hidden="true" />
      {label}
    </span>
  )
}
