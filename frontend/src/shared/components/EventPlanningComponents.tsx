import type { CalendarPreviewDay, PlanningMilestone, PlanningMilestoneStatus } from '../../services/planningService'

interface DeadlineBadgeProps {
  status: PlanningMilestoneStatus
  dueDate: string
}

const statusClasses: Record<PlanningMilestoneStatus, string> = {
  complete: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  upcoming: 'border-blue-200 bg-blue-50 text-blue-700',
  at_risk: 'border-amber-200 bg-amber-50 text-amber-700',
  blocked: 'border-rose-200 bg-rose-50 text-rose-700'
}

const statusLabels: Record<PlanningMilestoneStatus, string> = {
  complete: 'Complete',
  upcoming: 'Upcoming',
  at_risk: 'Due soon',
  blocked: 'Blocked'
}

export function DeadlineBadge({ status, dueDate }: DeadlineBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[status]}`}>
      {statusLabels[status]} · {new Date(dueDate).toLocaleDateString()}
    </span>
  )
}

export function TimelineMilestoneCard({ milestone }: { milestone: PlanningMilestone }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{milestone.ownerLabel}</p>
          <h3 className="mt-1 text-sm font-semibold text-gray-950">{milestone.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{milestone.description}</p>
        </div>
        <DeadlineBadge status={milestone.status} dueDate={milestone.dueDate} />
      </div>
    </article>
  )
}

export function EventTimelineBoard({ milestones }: { milestones: PlanningMilestone[] }) {
  if (!milestones.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
        Timeline milestones will appear after event requirements, booking requests, and contracts are created.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {milestones.map((milestone) => (
        <TimelineMilestoneCard key={milestone.id} milestone={milestone} />
      ))}
    </div>
  )
}

export function EventCalendarPreview({ days }: { days: CalendarPreviewDay[] }) {
  if (!days.length) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-950">Calendar preview</h3>
          <p className="text-sm text-gray-500">Upcoming event, booking, contract, and requirement dates.</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {days.map((day) => (
          <div key={`${day.date}-${day.label}`} className={`rounded-lg border p-3 ${statusClasses[day.status]}`}>
            <p className="text-xs font-medium">{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold">{day.label}</p>
            <p className="mt-1 text-xs">{day.items} item{day.items === 1 ? '' : 's'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

