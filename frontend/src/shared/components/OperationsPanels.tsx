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
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">Pending action queue</h3>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No pending actions.</p>
        ) : items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-500">{item.detail}</p>
            </div>
            <StatusBadge status={item.status} size="sm" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function RiskFlagsPanel({ flags }: { flags: OperationQueueItem[] }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <h3 className="font-semibold text-amber-900">Risk flags</h3>
      <div className="mt-3 space-y-2">
        {flags.length === 0 ? <p className="text-sm text-amber-700">No active risk flags.</p> : flags.map((flag) => (
          <div key={flag.id} className="rounded-md bg-white/70 p-3">
            <p className="text-sm font-medium text-amber-900">{flag.title}</p>
            <p className="text-xs text-amber-700">{flag.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
