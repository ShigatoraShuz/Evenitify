import { Link } from 'react-router-dom'
import { ArrowRight, Building2, CalendarCheck2, CheckCircle2, ClipboardList, FileSignature, LayoutGrid, ShieldCheck, Store, Users2 } from 'lucide-react'
import { Button } from '../../shared/components/Button'

interface EventifyLandingPageProps {
  onStartPlanning?: () => void
  onBrowseVendors?: () => void
  demoPanel?: React.ReactNode
}

const navItems = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Organizer workflow', href: '#organizer-workflow' },
  { label: 'Vendor workflow', href: '#vendor-workflow' },
  { label: 'Platform value', href: '#platform-value' },
]

const organizerSteps = [
  'Create an event portfolio with budget, venue, scope, and timeline.',
  'Define service requirements for catering, production, transport, and support.',
  'Compare vendors, send requests, and track contracts to completion.',
]

const vendorSteps = [
  'Review organizer requests with budgets, dates, and service scope.',
  'Manage service packages, availability, and response status in one queue.',
  'Track contract progress from request to signature without leaving the dashboard.',
]

const platformHighlights = [
  { title: 'Event portfolio', description: 'Keep every large event structured with service requirements, budget, and status history.', icon: ClipboardList },
  { title: 'Vendor comparison', description: 'Rank vendors by fit, availability, and commercial terms before you book.', icon: LayoutGrid },
  { title: 'Contract tracking', description: 'Move from request to signed agreement with a visible procurement timeline.', icon: FileSignature },
  { title: 'Role separation', description: 'Organizers, vendors, and admins each get the workspace they need.', icon: ShieldCheck },
]

function Topbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2 text-slate-950" aria-label="Eventify home">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-900 text-white shadow-sm">
            <Building2 className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">Eventify</span>
        </a>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/login?entry=landing"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Sign in
          </Link>
          <Link
            to="/register?entry=landing"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-900 bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,76,129,0.18)] transition hover:bg-brand-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Create account
          </Link>
        </div>
      </div>
    </header>
  )
}

function HeroCard({ title, description, icon: Icon }: { title: string; description: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-800">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 md:text-[15px]">{description}</p>
    </div>
  )
}

export default function EventifyLandingPage({ onStartPlanning, onBrowseVendors, demoPanel }: EventifyLandingPageProps) {
  return (
    <div className="min-h-screen bg-transparent text-slate-950">
      <Topbar />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,76,129,0.10),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(20,184,166,0.08),_transparent_22%)]" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
            <div className="flex flex-col justify-center">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">B2B organizer-vendor procurement</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tighter text-slate-950 sm:text-5xl lg:text-6xl">
                  Manage event procurement with one calm, premium workspace.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                  Eventify helps organizers create event portfolios, compare vendors, book services, and track contracts end to end.
                  Vendors get a separate B2B queue for requests, availability, and signed work. Admins keep platform operations visible.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button onClick={onStartPlanning} className="min-w-44">
                    Start procurement
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" onClick={onBrowseVendors}>
                    Explore vendor workflow
                  </Button>
                </div>
                {demoPanel && <div className="mt-6">{demoPanel}</div>}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Event portfolio</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">One event, every service, every status</h2>
                  </div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-900 text-white">
                    <CalendarCheck2 className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <HeroCard title="Requirements" description="Service scope, budget guardrails, venue notes, and guest counts stay aligned." icon={ClipboardList} />
                  <HeroCard title="Vendor queue" description="Compare candidates by availability, fit, and response stage before you book." icon={Store} />
                  <HeroCard title="Contracts" description="Follow each agreement from sent to signed without losing context." icon={FileSignature} />
                  <HeroCard title="Stakeholders" description="Keep organizers, vendors, and operations aligned without mixing workspaces." icon={Users2} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <HeroCard title="Organizer-ready" description="Built for event teams that need structure, approvals, and procurement visibility." icon={Building2} />
                <HeroCard title="Vendor-ready" description="Designed for service providers handling serious B2B request volume." icon={ShieldCheck} />
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-slate-200/80 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <SectionTitle
              title="How Eventify works"
              description="The workflow is intentionally structured so users can move from planning to procurement without changing tools."
            />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {[
                { title: '1. Create the portfolio', description: 'Define the event, budget, venue, and required services in one structured plan.', icon: ClipboardList },
                { title: '2. Compare vendors', description: 'Review matching vendors and evaluate fit, availability, and commercial terms.', icon: LayoutGrid },
                { title: '3. Book and track contracts', description: 'Send requests, move through approvals, and follow every contract to completion.', icon: FileSignature },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-900 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="organizer-workflow" className="bg-slate-50">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
            <div>
              <SectionTitle
                title="Organizer workflow"
                description="Give planners a clear path from event definition to vendor procurement and contract tracking."
              />
              <ul className="mt-6 space-y-3">
                {organizerSteps.map((step) => (
                  <li key={step} className="flex gap-3 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="text-sm leading-6 text-slate-700">{step}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={onStartPlanning}>Create organizer account</Button>
                <Button variant="secondary" onClick={onBrowseVendors}>See vendor workflow</Button>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="grid gap-4 md:grid-cols-2">
                <HeroCard title="Budget" description="Keep procurement anchored to a real budget and scope." icon={CalendarCheck2} />
                <HeroCard title="Approvals" description="Track pending reviews and move work forward deliberately." icon={CheckCircle2} />
                <HeroCard title="Compare" description="See vendor fit, service coverage, and readiness side by side." icon={LayoutGrid} />
                <HeroCard title="Contracts" description="Follow procurement status until signatures are complete." icon={FileSignature} />
              </div>
            </div>
          </div>
        </section>

        <section id="vendor-workflow" className="border-t border-slate-200/80 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="grid gap-4 md:grid-cols-2">
                <HeroCard title="Request queue" description="See organizer requests with budgets, dates, and scope in one list." icon={Users2} />
                <HeroCard title="Availability" description="Keep service availability and blocked dates visible before you respond." icon={CalendarCheck2} />
                <HeroCard title="Service packages" description="Present commercial offerings in a way organizers can actually compare." icon={Store} />
                <HeroCard title="Contract status" description="Move each booking from pending to confirmed with a clear trail." icon={ShieldCheck} />
              </div>
            </div>
            <div>
              <SectionTitle
                title="Vendor workflow"
                description="Separate B2B organizer requests from consumer-style work and keep the team focused on high-value opportunities."
              />
              <ul className="mt-6 space-y-3">
                {vendorSteps.map((step) => (
                  <li key={step} className="flex gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
                    <span className="text-sm leading-6 text-slate-700">{step}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={onBrowseVendors}>Create vendor account</Button>
                <Button variant="secondary" onClick={onStartPlanning}>See organizer flow</Button>
              </div>
            </div>
          </div>
        </section>

        <section id="platform-value" className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <SectionTitle
              title="Platform value"
              description="A premium procurement platform should feel operational, not decorative."
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {platformHighlights.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-900">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold tracking-tight text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200/80 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="rounded-[32px] border border-slate-200 bg-brand-950 p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] md:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Choose the role that fits your work.</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-[15px]">
                    Organizers manage procurement. Vendors manage their B2B request queue. Admins keep the platform healthy.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button onClick={onStartPlanning}>Start as organizer</Button>
                    <Button variant="secondary" onClick={onBrowseVendors}>Start as vendor</Button>
                  </div>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ['Organizers', 'Event portfolios, procurement, and contracts.'],
                      ['Vendors', 'Requests, availability, and service packages.'],
                      ['Admins', 'Approvals, reports, and operational oversight.'],
                    ].map(([title, description]) => (
                      <div key={title} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-2 text-xs leading-5 text-slate-300">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-900 text-white">
              <Building2 className="h-4 w-4" />
            </span>
            <span className="font-semibold text-slate-900">Eventify</span>
          </div>
          <p>Eventify is the B2B organizer-vendor procurement workspace for large-scale events.</p>
        </div>
      </footer>
    </div>
  )
}
