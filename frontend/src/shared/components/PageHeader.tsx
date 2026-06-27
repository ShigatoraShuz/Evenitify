interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="relative flex flex-col gap-4 overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,29,0.96)_0%,rgba(10,24,45,0.94)_54%,rgba(9,44,53,0.9)_100%)] px-5 py-5 shadow-[0_24px_70px_rgba(2,6,23,0.26)] backdrop-blur md:px-6 md:py-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300" aria-hidden="true" />
      <div className="relative max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/80">Eventify</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">{subtitle}</p>}
      </div>
      {action && <div className="relative flex flex-wrap gap-2">{action}</div>}
    </div>
  )
}
