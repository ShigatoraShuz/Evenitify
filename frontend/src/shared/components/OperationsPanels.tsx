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
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <h3 className="text-base font-semibold tracking-tight text-slate-950">Pending action queue</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm leading-6 text-slate-500">No pending actions.</p>
        ) : items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">{item.title}</p>
              <p className="text-xs leading-5 text-slate-500">{item.detail}</p>
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
    <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <h3 className="text-base font-semibold tracking-tight text-amber-950">Risk flags</h3>
      <div className="mt-4 space-y-3">
        {flags.length === 0 ? (
          <p className="text-sm leading-6 text-amber-800">No active risk flags.</p>
        ) : flags.map((flag) => (
            <div key={flag.id} className="rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">{flag.title}</p>
            <p className="text-xs leading-5 text-slate-600">{flag.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
