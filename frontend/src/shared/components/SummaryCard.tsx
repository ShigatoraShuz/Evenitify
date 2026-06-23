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
    <div className={`rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg border-l-4 ${borderAccent}`}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
        <p className={`mt-2 text-3xl font-semibold tracking-tight ${color}`}>{value}</p>
      </div>
      {sub && <p className="mt-3 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">{sub}</p>}
    </div>
  )
}
