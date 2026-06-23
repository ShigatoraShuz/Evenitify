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
        <div key={metric.label} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{metric.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{metric.value}</p>
          <p className="mt-1 text-xs text-slate-500">{metric.helper}</p>
        </div>
      ))}
    </div>
  )
}

export function OperationsInsightCard({ insights }: { insights: string[] }) {
  return (
    <section className="rounded-[24px] border border-indigo-100 bg-indigo-50 p-4 shadow-sm">
      <h3 className="text-base font-semibold text-indigo-950">Operations insights</h3>
      <div className="mt-3 space-y-2">
        {insights.map((insight) => (
          <p key={insight} className="text-sm text-indigo-800">{insight}</p>
        ))}
      </div>
    </section>
  )
}

export function StatusDistributionPanel({ title, items }: { title: string; items: StatusDistribution[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
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
    <section className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-950">Response trend</h3>
      <p className="mt-1 text-sm text-slate-500">Trend charts will connect to backend analytics once response-time aggregation is available.</p>
      <div className="mt-4 flex h-24 items-end gap-2">
        {[28, 44, 32, 58, 66, 51, 72].map((height, index) => (
          <div key={index} className="flex-1 rounded-t bg-slate-300" style={{ height: `${height}%` }} />
        ))}
      </div>
    </section>
  )
}
