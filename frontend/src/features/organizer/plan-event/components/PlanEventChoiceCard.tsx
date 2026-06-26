interface PlanEventChoiceCardProps {
  title: string
  description: string
  detail?: string
  imageUrl: string
  imageAlt: string
  selected: boolean
  onSelect: () => void
  compact?: boolean
}

export function PlanEventChoiceCard({
  title,
  description,
  detail,
  imageUrl,
  imageAlt,
  selected,
  onSelect,
  compact = false
}: PlanEventChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group flex h-full flex-col overflow-hidden rounded-[20px] border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/25 ${
        selected
          ? 'border-brand-500 bg-brand-50 shadow-[0_8px_24px_rgba(0,144,193,0.12)]'
          : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]'
      }`}
    >
      <div className={`relative overflow-hidden ${compact ? 'aspect-[16/11]' : 'aspect-[4/3]'}`}>
        <img
          src={imageUrl}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/0 to-transparent" />
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${
          selected ? 'bg-brand-600 text-white' : 'bg-white/90 text-slate-700'
        }`}>
          {selected ? 'Selected' : 'Add'}
        </span>
      </div>
      <div className={`flex flex-1 flex-col ${compact ? 'gap-1.5 p-3' : 'gap-2 p-3.5'}`}>
        <h4 className={`font-semibold text-slate-950 ${compact ? 'text-sm' : 'text-[15px]'}`}>{title}</h4>
        <p className={`text-slate-600 ${compact ? 'text-xs leading-5' : 'text-sm leading-6'}`}>{description}</p>
        {detail && (
          <p className="mt-auto text-[11px] font-medium text-slate-500">
            {detail}
          </p>
        )}
      </div>
    </button>
  )
}
