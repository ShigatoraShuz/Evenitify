import type { AnalyticsMetric, StatusDistribution } from '../../services/analyticsService'

const toneClasses: Record<StatusDistribution['tone'], string> = {
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  slate: 'bg-slate-500'
}

export function AnalyticsMetricGrid({ metrics }: { metrics: AnalyticsMetric[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-[28px] border border-white/10 bg-white/95 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-medium text-slate-500">{metric.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{metric.value}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{metric.helper}</p>
        </div>
      ))}
    </div>
  )
}

export function OperationsInsightCard({ insights }: { insights: string[] }) {
  return (
    <section className="rounded-[28px] border border-cyan-100 bg-[linear-gradient(135deg,rgba(240,249,255,0.95)_0%,rgba(236,253,245,0.88)_100%)] p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
      <h3 className="text-base font-semibold text-slate-950">Operations insights</h3>
      <div className="mt-3 space-y-2">
        {insights.map((insight) => (
          <p key={insight} className="text-sm leading-6 text-slate-700">{insight}</p>
        ))}
      </div>
    </section>
  )
}

export function StatusDistributionPanel({ title, items }: { title: string; items: StatusDistribution[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/95 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const width = total > 0 ? Math.max(6, Math.round((item.value / total) * 100)) : 6
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">{item.label}</span>
                <span className="font-semibold text-slate-950">{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${toneClasses[item.tone]}`} style={{ width: `${width}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function AdminTrendPlaceholder() {
  return (
    <section className="rounded-[28px] border border-dashed border-cyan-200 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(243,248,252,0.9)_100%)] p-4 shadow-[0_16px_45px_rgba(15,23,42,0.05)]">
      <h3 className="text-base font-semibold text-slate-950">Response trend</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">Trend charts will connect to backend analytics once response-time aggregation is available.</p>
      <div className="mt-4 flex h-24 items-end gap-2">
        {[28, 44, 32, 58, 66, 51, 72].map((height, index) => (
          <div key={index} className="flex-1 rounded-t bg-gradient-to-t from-cyan-300 to-cyan-500" style={{ height: `${height}%` }} />
        ))}
      </div>
    </section>
  )
}
