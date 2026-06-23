import type { RealtimeSnapshot } from '../../services/realtimeService'

interface RealtimeIndicatorProps {
  snapshot: RealtimeSnapshot | null
  refreshing?: boolean
  onRefresh?: () => void
}

export function RealtimeIndicator({ snapshot, refreshing = false, onRefresh }: RealtimeIndicatorProps) {
  const lastUpdated = snapshot?.lastUpdatedAt ? new Date(snapshot.lastUpdatedAt).toLocaleTimeString() : 'Not synced'
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-medium ${snapshot?.connected ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${snapshot?.connected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        {snapshot?.connected ? 'Realtime ready' : 'Offline'}
      </span>
      <span>Updated {lastUpdated}</span>
      {onRefresh && (
        <button onClick={onRefresh} className="rounded-md px-2 py-1 font-medium text-brand-600 hover:bg-brand-50 disabled:text-slate-400" disabled={refreshing}>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      )}
    </div>
  )
}
