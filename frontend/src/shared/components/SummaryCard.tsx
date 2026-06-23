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
    <div className={`bg-white rounded-2xl border-y border-r border-slate-200/80 border-l-4 ${borderAccent} p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 shadow-sm flex flex-col justify-between min-h-[100px]`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className={`text-2xl md:text-3xl font-bold tracking-tight ${color} mt-1.5`}>{value}</p>
      </div>
      {sub && <p className="text-xs text-slate-400 font-medium mt-2 pt-2 border-t border-slate-50 border-t-slate-100/60">{sub}</p>}
    </div>
  )
}
