import { Clock, CheckCircle2, XCircle, BadgeCheck } from 'lucide-react'

interface Props {
  counts: {
    pending: number
    accepted: number
    rejected: number
    confirmed: number
  }
}

const cards = [
  { label: 'Pending', count: 'pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Accepted', count: 'accepted', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'Rejected', count: 'rejected', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  { label: 'Confirmed', count: 'confirmed', icon: BadgeCheck, color: 'text-green-500', bg: 'bg-green-50' },
]

export function VendorStatusSummaryCards({ counts }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.count}
            className={`${card.bg} rounded-xl p-4 border border-slate-200 transition-shadow hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-600">{card.label}</span>
              <Icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {counts[card.count as keyof typeof counts]}
              </span>
              <span className="text-xs text-slate-400">requests</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
