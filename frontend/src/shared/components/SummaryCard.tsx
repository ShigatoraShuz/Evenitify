interface SummaryCardProps {
  label: string
  value: string | number
  color?: string
  sub?: string
  borderColor?: string
}

export function SummaryCard({ label, value, color = 'text-slate-900', sub, borderColor }: SummaryCardProps) {
  return (
    <div className={`bg-white rounded-xl border ${borderColor || 'border-slate-200'} p-4`}>
      <p className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}
