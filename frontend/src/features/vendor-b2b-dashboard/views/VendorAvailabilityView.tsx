import { ShieldCheck } from 'lucide-react'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { AvailabilityCalendar, AvailabilityQuickUpdate, BlockedDateList } from '../../../shared/components/AvailabilityComponents'
import type { AvailabilityStatus, VendorAvailabilityPreview } from '../../../services/availabilityService'

interface VendorAvailabilityViewProps {
  availability: VendorAvailabilityPreview | null
  loading: boolean
  submitting: boolean
  error: string | null
  onUpdateAvailabilityStatus: (status: AvailabilityStatus) => Promise<void>
  onClearError: () => void
}

export function VendorAvailabilityView({
  availability,
  loading,
  submitting,
  error,
  onUpdateAvailabilityStatus,
  onClearError
}: VendorAvailabilityViewProps) {
  return (
    <DashboardShell>
      <div className="space-y-8 max-w-[1200px] mx-auto">
        <PageHeader
          title="Availability & Schedule"
          subtitle="Manage your working hours and blocked dates to prevent scheduling conflicts."
        />

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center justify-between gap-3">
            <span>{error}</span>
            <button type="button" onClick={onClearError} className="text-rose-500 hover:text-rose-700">Dismiss</button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start">
          <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[600px] flex flex-col">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Calendar View</h2>
            <div className="flex-1">
              <AvailabilityCalendar preview={availability} />
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Current Status</h3>
                  <p className="text-sm text-slate-500">Toggle your overall availability</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <AvailabilityQuickUpdate
                  status={availability?.status || 'available'}
                  updating={submitting}
                  onUpdate={(status) => { void onUpdateAvailabilityStatus(status) }}
                />
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Blocked Dates</h3>
                <p className="text-sm text-slate-500">Dates you are unavailable for booking</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-h-[200px]">
                <BlockedDateList dates={availability?.blockedDates || []} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
