interface SummaryCardProps {
  label: string
  value: string | number
  color?: string
  sub?: string
}

export function SummaryCard({ label, value, color = 'text-slate-900', sub }: SummaryCardProps) {
  let borderAccent = 'border-l-brand-500'
  if (color.includes('text-blue-')) borderAccent = 'border-l-blue-500'
  else if (color.includes('text-emerald-')) borderAccent = 'border-l-emerald-500'
  else if (color.includes('text-green-')) borderAccent = 'border-l-green-500'
  else if (color.includes('text-indigo-')) borderAccent = 'border-l-indigo-500'
  else if (color.includes('text-purple-')) borderAccent = 'border-l-purple-500'
  else if (color.includes('text-yellow-')) borderAccent = 'border-l-amber-500'
  else if (color.includes('text-orange-')) borderAccent = 'border-l-orange-500'
  else if (color.includes('text-rose-') || color.includes('text-red-')) borderAccent = 'border-l-red-500'
  else if (color.includes('text-cyan-')) borderAccent = 'border-l-cyan-500'

  return (
    <div className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,248,252,0.93)_100%)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_65px_rgba(15,23,42,0.12)] border-l-4 ${borderAccent}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_26%)]" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
          <p className={`mt-2 text-3xl font-semibold tracking-tight ${color}`}>{value}</p>
        </div>
      </div>
      {sub && <p className="relative mt-4 border-t border-slate-100 pt-3 text-xs font-medium leading-5 text-slate-500">{sub}</p>}
    </div>
  )
}
