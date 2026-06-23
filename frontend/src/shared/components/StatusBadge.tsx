import { STATUS_COLORS } from '../constants/statusColors'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] || 'bg-slate-100 text-slate-600 border-slate-200'
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'

  return (
    <span className={`inline-flex items-center rounded-full font-semibold border border-current/10 ${colorClass} ${sizeClass} transition-all duration-200`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current shrink-0" />
      {label}
    </span>
  )
}
