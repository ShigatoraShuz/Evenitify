interface DashboardCommandPanelProps {
  title: string
  description: string
  meta: string
  action?: React.ReactNode
  secondary?: React.ReactNode
}

export function DashboardCommandPanel({ title, description, meta, action, secondary }: DashboardCommandPanelProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)] md:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" aria-hidden="true" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">{meta}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tighter text-white md:text-[1.75rem]">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
        </div>
        {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
      </div>
      {secondary && <div className="mt-5 border-t border-white/10 pt-5">{secondary}</div>}
    </section>
  )
}
