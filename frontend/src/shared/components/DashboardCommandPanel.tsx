interface DashboardCommandPanelProps {
  title: string
  description: string
  meta: string
  action?: React.ReactNode
  secondary?: React.ReactNode
}

export function DashboardCommandPanel({ title, description, meta, action, secondary }: DashboardCommandPanelProps) {
  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{meta}</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
        </div>
        {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
      </div>
      {secondary && <div className="mt-4 border-t border-slate-100 pt-4">{secondary}</div>}
    </section>
  )
}
