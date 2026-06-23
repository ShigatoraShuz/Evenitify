import { Button } from './Button'
import type { ReportBundle, ReportMetric } from '../../services/reportService'

const toneClasses: Record<NonNullable<ReportMetric['tone']>, string> = {
  neutral: 'border-slate-200 text-slate-900',
  success: 'border-emerald-200 text-emerald-700',
  warning: 'border-amber-200 text-amber-700',
  danger: 'border-red-200 text-red-700'
}

export function ReportMetricGrid({ metrics }: { metrics: ReportMetric[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className={`rounded-lg border bg-white p-4 ${toneClasses[metric.tone || 'neutral']}`}>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
          {metric.helper && <p className="mt-1 text-xs text-slate-500">{metric.helper}</p>}
        </div>
      ))}
    </div>
  )
}

export function ExportActionBar({ onCsv, onPrint, onPdf }: { onCsv: () => void; onPrint: () => void; onPdf: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onCsv}>Export CSV</Button>
      <Button variant="secondary" onClick={onPrint}>Print</Button>
      <Button variant="ghost" onClick={onPdf}>PDF placeholder</Button>
    </div>
  )
}

export function ReportTables({ report }: { report: ReportBundle }) {
  return (
    <div className="space-y-4">
      {report.tables.map((table) => (
        <div key={table.title} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="font-semibold text-slate-900">{table.title}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>{table.columns.map((column) => <th key={column} className="px-4 py-3 font-medium">{column}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {table.rows.map((row, index) => (
                  <tr key={index}>
                    {table.columns.map((column) => <td key={column} className="px-4 py-3 text-slate-700">{row[column] ?? '-'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
