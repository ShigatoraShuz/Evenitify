interface PlaceholderMediaProps {
  title: string
  subtitle?: string
  tone?: 'slate' | 'emerald' | 'indigo' | 'amber' | 'rose'
  icon?: React.ReactNode
  compact?: boolean
  imageUrl?: string
  imageAlt?: string
  chips?: string[]
}

const toneClasses: Record<NonNullable<PlaceholderMediaProps['tone']>, string> = {
  slate: 'border-slate-200 text-slate-700',
  emerald: 'border-emerald-200 text-emerald-700',
  indigo: 'border-indigo-200 text-indigo-700',
  amber: 'border-amber-200 text-amber-700',
  rose: 'border-rose-200 text-rose-700'
}

export function PlaceholderMedia({
  title,
  subtitle,
  tone = 'slate',
  icon,
  compact = false,
  imageUrl,
  imageAlt,
  chips = []
}: PlaceholderMediaProps) {
  return (
    <div className={`overflow-hidden rounded-[26px] border bg-white shadow-[0_16px_45px_rgba(15,23,42,0.07)] ${toneClasses[tone]} ${compact ? 'max-w-full' : ''}`}>
      <div className={`relative overflow-hidden ${compact ? 'aspect-[16/11]' : 'aspect-[4/3]'}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt ?? title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,rgba(255,255,255,0.95)_0%,rgba(241,248,255,0.9)_50%,rgba(224,242,254,0.9)_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/0 to-transparent" />
        <div className="absolute left-3 top-3 flex items-start gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-700 shadow-sm">
            {title}
          </span>
          {icon && <div className="rounded-2xl bg-white/90 p-2 text-current shadow-sm">{icon}</div>}
        </div>
      </div>
      <div className={`space-y-3 ${compact ? 'p-3' : 'p-4'}`}>
        {subtitle && <p className="text-sm leading-6 text-slate-600">{subtitle}</p>}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className={`rounded-full border bg-white px-2.5 py-1 text-[11px] font-semibold ${tone === 'slate' ? 'border-slate-200 text-slate-600' : 'border-current/15 text-current'}`}
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
