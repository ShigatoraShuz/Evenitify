import type React from 'react'
import { ArrowRight, Inbox } from 'lucide-react'
import { Button } from './Button'

interface OrganizerPageProps {
  children: React.ReactNode
  className?: string
}

export function OrganizerPage({ children, className = '' }: OrganizerPageProps) {
  return (
    <div className={`mx-auto w-full max-w-[1920px] space-y-6 ${className}`}>
      {children}
    </div>
  )
}

interface OrganizerPageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  children?: React.ReactNode
  eyebrow?: string | null
}

export function OrganizerPageHeader({ title, description, action, children, eyebrow = 'Eventify' }: OrganizerPageHeaderProps) {
  return (
    <section className={[
        'relative overflow-hidden rounded-[30px] border',
        'border-white/10 px-5 py-5 md:px-6 md:py-6',
        'bg-[linear-gradient(135deg,rgba(8,15,29,0.94)_0%,rgba(10,24,45,0.92)_48%,rgba(9,44,53,0.88)_100%)]',
        'shadow-[0_24px_70px_rgba(2,6,23,0.32)]',
      ].join(' ')}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300" aria-hidden="true" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-cyan-200/80">{eyebrow}</p>}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">{description}</p>}
        </div>
        {action && <div className="flex flex-wrap gap-2 shrink-0">{action}</div>}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </section>
  )
}

interface OrganizerCardProps {
  children: React.ReactNode
  className?: string
  interactive?: boolean
}

export function OrganizerCard({ children, className = '', interactive = false }: OrganizerCardProps) {
  return (
    <section className={[
        'rounded-[28px] border border-slate-200/80',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(244,248,252,0.96)_100%)]',
        'p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]',
        interactive ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:shadow-[0_24px_65px_rgba(15,23,42,0.12)]' : '',
        className,
      ].filter(Boolean).join(' ')}>
      {children}
    </section>
  )
}

interface SectionHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  eyebrow?: string | null
}

export function SectionHeader({ title, description, action, eyebrow = 'Eventify section' }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-slate-200/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-700">{eyebrow}</p>}
        <h2 className="mt-1 text-base font-semibold text-slate-950">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: React.ReactNode
  helper?: string
  icon?: React.ComponentType<{ className?: string }>
  tone?: 'blue' | 'slate' | 'amber' | 'emerald' | 'rose' | 'indigo'
}

const metricToneClasses = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  slate: 'bg-slate-50 text-slate-700 border-slate-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-100',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
}

export function MetricCard({ label, value, helper, icon: Icon, tone = 'blue' }: MetricCardProps) {
  return (
    <OrganizerCard className={`relative overflow-hidden p-4 ${tone === 'blue' ? 'bg-[linear-gradient(180deg,rgba(239,246,255,0.98)_0%,rgba(255,255,255,0.98)_100%)]' : ''}`} interactive>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_24%)]" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
          {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
        </div>
        {Icon && (
          <span className={`rounded-2xl border p-2 ${metricToneClasses[tone]}`}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
    </OrganizerCard>
  )
}

interface StatusPillProps {
  children: React.ReactNode
  tone?: 'blue' | 'slate' | 'amber' | 'emerald' | 'rose' | 'indigo'
}

export function StatusPill({ children, tone = 'slate' }: StatusPillProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm ${metricToneClasses[tone]}`}>
      {children}
    </span>
  )
}

interface EmptyStateCardProps {
  title: string
  description: string
  action?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function EmptyStateCard({ title, description, action, icon: Icon = Inbox, className = '' }: EmptyStateCardProps) {
  return (
    <div className={[
        'rounded-[28px] border border-dashed border-cyan-200 p-6 text-center',
        'bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(244,250,255,0.94)_100%)]',
        'shadow-[0_16px_42px_rgba(15,23,42,0.06)]',
        className,
      ].join(' ')}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100 bg-white text-cyan-600 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}

export function ActionButton({ children, icon: Icon = ArrowRight, className = '', ...props }: ActionButtonProps) {
  return (
    <Button className={`gap-2 ${className}`} {...props}>
      {children}
      <Icon className="h-4 w-4" />
    </Button>
  )
}
