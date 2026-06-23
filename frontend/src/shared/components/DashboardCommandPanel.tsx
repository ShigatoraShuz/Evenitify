interface DashboardCommandPanelProps {
  title: string
  description: string
  meta: string
  action?: React.ReactNode
  secondary?: React.ReactNode
}

export function DashboardCommandPanel({ title, description, meta, action, secondary }: DashboardCommandPanelProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">{meta}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">{description}</p>
        </div>
        {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
      </div>
      {secondary && <div className="mt-5 border-t border-white/10 pt-5">{secondary}</div>}
    </section>
  )
}
