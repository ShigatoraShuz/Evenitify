import { StatusBadge } from './StatusBadge'

export interface OperationQueueItem {
  id: string
  title: string
  detail: string
  status: string
  priority: 'high' | 'medium' | 'low'
}

export function ActionQueuePanel({ items }: { items: OperationQueueItem[] }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/95 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
      <h3 className="text-base font-semibold text-slate-950">Pending action queue</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm leading-6 text-slate-500">No pending actions.</p>
        ) : items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
            <div>
              <p className="text-sm font-medium text-slate-950">{item.title}</p>
              <p className="text-xs text-slate-500">{item.detail}</p>
            </div>
            <StatusBadge status={item.status} size="sm" />
          </div>
        ))}
      </div>
    </section>
  )
}

export function RiskFlagsPanel({ flags }: { flags: OperationQueueItem[] }) {
  return (
    <section className="rounded-[28px] border border-amber-200/60 bg-[linear-gradient(135deg,rgba(255,251,235,0.96)_0%,rgba(255,247,237,0.92)_100%)] p-5 shadow-[0_16px_45px_rgba(15,23,42,0.05)]">
      <h3 className="text-base font-semibold text-amber-950">Risk flags</h3>
      <div className="mt-4 space-y-3">
        {flags.length === 0 ? (
          <p className="text-sm leading-6 text-amber-800">No active risk flags.</p>
        ) : flags.map((flag) => (
          <div key={flag.id} className="rounded-2xl border border-white/70 bg-white/85 p-3 shadow-sm">
            <p className="text-sm font-medium text-slate-950">{flag.title}</p>
            <p className="text-xs text-slate-600">{flag.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
