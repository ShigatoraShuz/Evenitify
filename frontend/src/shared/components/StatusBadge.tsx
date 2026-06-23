type StatusVariant = 'pending' | 'accepted' | 'rejected' | 'changes_requested' | 'contract_sent' | 'confirmed' | 'completed' | 'cancelled' | 'open' | 'fulfilled'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  changes_requested: 'bg-orange-100 text-orange-800',
  contract_sent: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-cyan-100 text-cyan-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  open: 'bg-blue-100 text-blue-800',
  fulfilled: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-600',
  planning: 'bg-indigo-100 text-indigo-800',
  booking: 'bg-blue-100 text-blue-800'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizeClass}`}>
      {label}
    </span>
  )
}
