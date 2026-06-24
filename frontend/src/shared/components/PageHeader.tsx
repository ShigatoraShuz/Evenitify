interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  breadcrumbs?: React.ReactNode
}

export function PageHeader({ title, subtitle, action, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 rounded-[28px] border border-slate-200 bg-white/95 px-5 py-5 shadow-[0_14px_38px_rgba(15,23,42,0.06)] backdrop-blur md:px-6 md:py-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-3">
        {breadcrumbs && <div>{breadcrumbs}</div>}
        <h1 className="text-3xl font-semibold tracking-tighter text-slate-950 md:text-4xl">{title}</h1>
        {subtitle && <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-[15px]">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  )
}
