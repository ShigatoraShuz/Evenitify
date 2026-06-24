interface SummaryCardProps {
  label: string
  value: string | number
  color?: string
  sub?: string
}

export function SummaryCard({ label, value, color = 'text-slate-900', sub }: SummaryCardProps) {
  let accent = 'bg-brand-500'
  if (color.includes('text-blue-')) accent = 'bg-blue-500'
  else if (color.includes('text-emerald-')) accent = 'bg-emerald-500'
  else if (color.includes('text-green-')) accent = 'bg-green-500'
  else if (color.includes('text-indigo-')) accent = 'bg-indigo-500'
  else if (color.includes('text-purple-')) accent = 'bg-violet-500'
  else if (color.includes('text-yellow-') || color.includes('text-amber-')) accent = 'bg-amber-500'
  else if (color.includes('text-orange-')) accent = 'bg-orange-500'
  else if (color.includes('text-rose-') || color.includes('text-red-')) accent = 'bg-red-500'
  else if (color.includes('text-cyan-')) accent = 'bg-cyan-500'

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
      <div className="flex items-start gap-3">
        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${accent}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
          <p className={`mt-2 text-3xl font-semibold tracking-tighter ${color}`}>{value}</p>
        </div>
      </div>
      {sub && <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">{sub}</p>}
    </div>
  )
}
