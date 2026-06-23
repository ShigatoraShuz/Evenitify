import type { BudgetSummary, CategoryBudgetSummary } from '../../services/budgetService'

const currency = (value: number) => `$${Math.round(value).toLocaleString()}`

export function BudgetWarningBanner({ summary }: { summary: BudgetSummary }) {
  if (!summary.overBudget) return null

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
      <p className="font-semibold">Event budget is over target</p>
      <p className="mt-1">Estimated spending is {currency(Math.abs(summary.remainingBudget))} above the current event budget.</p>
    </div>
  )
}

export function BudgetOverviewCard({ summary }: { summary: BudgetSummary }) {
  const usedPct = summary.totalBudget > 0 ? Math.min(100, Math.round((summary.estimatedSpending / summary.totalBudget) * 100)) : 0

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Budget center</p>
          <h2 className="mt-1 text-2xl font-semibold text-gray-950">{currency(summary.totalBudget)}</h2>
          <p className="mt-1 text-sm text-gray-600">Total event budget with accepted and pending vendor spend.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <BudgetMetric label="Allocated" value={summary.allocatedVendorBudget} />
          <BudgetMetric label="Accepted" value={summary.acceptedBookingTotal} />
          <BudgetMetric label="Pending" value={summary.pendingBookingTotal} />
          <BudgetMetric label="Estimated" value={summary.estimatedSpending} />
          <BudgetMetric label="Remaining" value={summary.remainingBudget} negative={summary.remainingBudget < 0} />
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs font-medium text-gray-500">
          <span>Estimated spend</span>
          <span>{usedPct}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div className={`h-full rounded-full ${summary.overBudget ? 'bg-rose-500' : 'bg-indigo-600'}`} style={{ width: `${usedPct}%` }} />
        </div>
      </div>
    </section>
  )
}

function BudgetMetric({ label, value, negative = false }: { label: string; value: number; negative?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${negative ? 'text-rose-700' : 'text-gray-950'}`}>{currency(value)}</p>
    </div>
  )
}

export function CategoryBudgetRow({ category }: { category: CategoryBudgetSummary }) {
  const spend = category.estimated
  const pct = category.allocated > 0 ? Math.min(100, Math.round((spend / category.allocated) * 100)) : 0

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-950">{category.category}</p>
          <p className="text-xs text-gray-500">Accepted {currency(category.accepted)} · Pending {currency(category.pending)}</p>
        </div>
        <p className="text-sm font-semibold text-gray-700">{currency(spend)}</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-cyan-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function BudgetBreakdownChart({ categories }: { categories: CategoryBudgetSummary[] }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-950">Budget by category</h3>
        <p className="text-sm text-gray-500">Vendor budget allocation, accepted spend, and pending requests.</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {categories.map((category) => (
          <CategoryBudgetRow key={category.category} category={category} />
        ))}
      </div>
    </section>
  )
}

