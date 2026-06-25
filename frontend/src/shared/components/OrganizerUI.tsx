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
        'relative rounded-[28px] border',
        'border-slate-200/80 px-5 py-5 md:px-6 md:py-6',
        'bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(241,248,255,0.94)_46%,rgba(231,244,255,0.9)_100%)]',
        'shadow-[0_18px_55px_rgba(15,23,42,0.07)]',
      ].join(' ')}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-sky-400 to-cyan-300 rounded-t-[28px]" aria-hidden="true" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-brand-600">{eyebrow}</p>}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">{description}</p>}
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
        'rounded-[24px] border border-slate-200/80',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)]',
        'p-5 shadow-[0_14px_42px_rgba(15,23,42,0.05)]',
        interactive ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_20px_55px_rgba(15,23,42,0.08)]' : '',
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
        {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-600">{eyebrow}</p>}
        <h2 className="mt-1 text-base font-semibold text-slate-950">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
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
    <OrganizerCard className={`p-4 ${tone === 'blue' ? 'bg-[linear-gradient(180deg,rgba(239,246,255,0.95)_0%,rgba(255,255,255,0.98)_100%)]' : ''}`} interactive>
      <div className="flex items-start justify-between gap-3">
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
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${metricToneClasses[tone]}`}>
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
        'rounded-[24px] border border-dashed border-brand-200 p-6 text-center',
        'bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,250,255,0.92)_100%)]',
        'shadow-[0_12px_35px_rgba(15,23,42,0.04)]',
        className,
      ].join(' ')}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-600">
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
