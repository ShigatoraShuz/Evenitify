import { Clock, CheckCircle2, XCircle, BadgeCheck } from 'lucide-react'

interface Props {
  counts: {
    pending: number
    negotiating: number
    accepted: number
    rejected: number
    confirmed: number
  }
}

const cards = [
  { label: 'Pending', count: 'pending', icon: Clock, color: 'text-amber-600', bg: 'from-amber-50 to-white' },
  { label: 'Negotiating', count: 'negotiating', icon: Clock, color: 'text-orange-600', bg: 'from-orange-50 to-white' },
  { label: 'Accepted', count: 'accepted', icon: CheckCircle2, color: 'text-emerald-600', bg: 'from-emerald-50 to-white' },
  { label: 'Rejected', count: 'rejected', icon: XCircle, color: 'text-red-600', bg: 'from-red-50 to-white' },
  { label: 'Confirmed', count: 'confirmed', icon: BadgeCheck, color: 'text-green-600', bg: 'from-green-50 to-white' },
]

export function VendorStatusSummaryCards({ counts }: Props) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.count}
            className={`relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-gradient-to-br ${card.bg} p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]`}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300" aria-hidden="true" />
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">{card.label}</span>
              <span className="rounded-xl bg-white/80 p-2 shadow-sm">
                <Icon className={`h-4 w-4 ${card.color}`} />
              </span>
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
