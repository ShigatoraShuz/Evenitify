import type { AvailabilityStatus, BlockedDate, VendorAvailabilityPreview } from '../../services/availabilityService'
import { Button } from './Button'

const statusStyles: Record<AvailabilityStatus, string> = {
  available: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  limited: 'border-amber-200 bg-amber-50 text-amber-700',
  unavailable: 'border-rose-200 bg-rose-50 text-rose-700'
}

export function AvailabilityStatusPill({ status }: { status: AvailabilityStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}>
      {status}
    </span>
  )
}

export function DateConflictBanner({ preview }: { preview: VendorAvailabilityPreview | null }) {
  if (!preview?.conflictDate) return null

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
      <p className="font-semibold">Availability conflict warning</p>
      <p className="mt-1">{preview.conflictReason} Review {new Date(preview.conflictDate).toLocaleDateString()} before booking.</p>
    </div>
  )
}

export function AvailabilityCalendar({ preview }: { preview: VendorAvailabilityPreview | null }) {
  if (!preview) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
        Select a vendor to preview availability.
      </div>
    )
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-950">Availability preview</h3>
          <p className="text-xs text-gray-500">Updated {new Date(preview.updatedAt).toLocaleString()}</p>
        </div>
        <AvailabilityStatusPill status={preview.status} />
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {preview.days.map((day) => (
          <div key={day.date} className={`min-h-16 rounded-lg border p-2 text-xs ${statusStyles[day.status]}`}>
            <p className="font-semibold">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}</p>
            <p>{new Date(day.date).getDate()}</p>
            <p className="mt-1 truncate">{day.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function BlockedDateList({ dates }: { dates: BlockedDate[] }) {
  if (!dates.length) {
    return <p className="text-sm text-gray-500">No blocked dates in the current mock schedule.</p>
  }

  return (
    <div className="space-y-2">
      {dates.map((date) => (
        <div key={date.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
          <span className="font-medium text-gray-900">{new Date(date.date).toLocaleDateString()}</span>
          <span className="text-gray-500">{date.reason}</span>
        </div>
      ))}
    </div>
  )
}

export function AvailabilityQuickUpdate({
  status,
  updating,
  onUpdate
}: {
  status: AvailabilityStatus
  updating: boolean
  onUpdate: (status: AvailabilityStatus) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(['available', 'limited', 'unavailable'] as AvailabilityStatus[]).map((option) => (
        <Button
          key={option}
          variant={status === option ? 'primary' : 'secondary'}
          loading={updating && status === option}
          onClick={() => onUpdate(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  )
}

