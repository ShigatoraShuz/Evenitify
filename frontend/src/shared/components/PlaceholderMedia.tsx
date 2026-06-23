interface PlaceholderMediaProps {
  title: string
  subtitle?: string
  tone?: 'slate' | 'emerald' | 'indigo' | 'amber' | 'rose'
  icon?: React.ReactNode
  compact?: boolean
}

const toneClasses: Record<NonNullable<PlaceholderMediaProps['tone']>, string> = {
  slate: 'from-slate-100 via-slate-50 to-white border-slate-200 text-slate-700',
  emerald: 'from-emerald-100 via-white to-emerald-50 border-emerald-200 text-emerald-700',
  indigo: 'from-indigo-100 via-white to-indigo-50 border-indigo-200 text-indigo-700',
  amber: 'from-amber-100 via-white to-amber-50 border-amber-200 text-amber-700',
  rose: 'from-rose-100 via-white to-rose-50 border-rose-200 text-rose-700'
}

export function PlaceholderMedia({ title, subtitle, tone = 'slate', icon, compact = false }: PlaceholderMediaProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 ${toneClasses[tone]} ${compact ? 'min-h-28' : 'min-h-40'}`}>
      <div className="absolute inset-0 opacity-60">
        <div className="absolute left-4 top-4 h-16 w-16 rounded-full bg-white/70 blur-xl" />
        <div className="absolute right-3 top-6 h-20 w-20 rounded-full bg-current/10 blur-2xl" />
        <div className="absolute inset-x-8 bottom-4 h-14 rounded-full bg-white/45 blur-2xl" />
      </div>
      <div className="relative flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-current/70">{title}</p>
            {subtitle && <p className="mt-1 max-w-[14rem] text-sm text-current/75">{subtitle}</p>}
          </div>
          {icon && <div className="rounded-2xl border border-white/80 bg-white/70 p-2 text-current shadow-sm">{icon}</div>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 rounded-2xl border border-white/70 bg-white/65" />
          <div className="h-12 rounded-2xl border border-white/70 bg-white/40" />
          <div className="h-12 rounded-2xl border border-white/70 bg-white/55" />
        </div>
      </div>
    </div>
  )
}
