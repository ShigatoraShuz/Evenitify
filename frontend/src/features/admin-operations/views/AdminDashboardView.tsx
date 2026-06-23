import { useEffect, useMemo, useState } from 'react'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { PageHeader } from '../../../shared/components/PageHeader'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { SummaryCard } from '../../../shared/components/SummaryCard'
import { Modal } from '../../../shared/components/Modal'
import { Input } from '../../../shared/components/Input'
import { Select } from '../../../shared/components/Select'
import { DataTable, type Column } from '../../../shared/components/DataTable'
import { RealtimeIndicator } from '../../../shared/components/RealtimeIndicator'
import { ActionQueuePanel, RiskFlagsPanel, type OperationQueueItem } from '../../../shared/components/OperationsPanels'
import { AuditTimeline } from '../../../shared/components/AuditTimeline'
import { DashboardCommandPanel } from '../../../shared/components/DashboardCommandPanel'
import { AdminTrendPlaceholder, AnalyticsMetricGrid, OperationsInsightCard, StatusDistributionPanel } from '../../../shared/components/AnalyticsComponents'
import { PlaceholderMedia } from '../../../shared/components/PlaceholderMedia'
import type { AuditActivity } from '../../../services/auditService'
import type { RealtimeSnapshot } from '../../../services/realtimeService'
import type { OperationalAnalytics } from '../../../services/analyticsService'
import type {
  AdminDashboardSummary,
  AdminUser,
  AdminEvent,
  AdminBooking,
  AdminVendor
} from '../models/admin-operations.model'

interface AdminDashboardViewProps {
  summary: AdminDashboardSummary
  users: AdminUser[]
  events: AdminEvent[]
  bookings: AdminBooking[]
  vendors: AdminVendor[]
  loading: boolean
  submitting: boolean
  error: string | null
  activeSection: string
  selectedVendor: AdminVendor | null
  selectedBooking: AdminBooking | null
  auditActivities: AuditActivity[]
  analytics: OperationalAnalytics | null
  actionQueue: OperationQueueItem[]
  riskFlags: OperationQueueItem[]
  realtimeSnapshot: RealtimeSnapshot | null
  realtimeRefreshing: boolean
  onLoadSummary: () => Promise<void>
  onRefreshRealtime: () => Promise<void>
  onLoadUsers: (params?: { role?: string; search?: string }) => Promise<void>
  onLoadEvents: (params?: { status?: string; search?: string }) => Promise<void>
  onLoadBookings: (params?: { status?: string; search?: string }) => Promise<void>
  onLoadVendors: (params?: { status?: string; search?: string }) => Promise<void>
  onSetActiveSection: (section: string) => void
  onSelectVendor: (vendor: AdminVendor | null) => void
  onSelectBooking: (booking: AdminBooking | null) => void
  onUpdateVendorVerification: (vendorId: string, status: string, reason?: string) => Promise<void>
  onOverrideBookingStatus: (bookingId: string, status: string, reason: string) => Promise<void>
  onClearError: () => void
}

const NAV_ITEMS = [
  { key: 'summary', label: 'Dashboard' },
  { key: 'users', label: 'Users' },
  { key: 'events', label: 'Events' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'vendors', label: 'Vendors' }
]

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function AdminDashboardView({
  summary,
  users,
  events,
  bookings,
  vendors,
  loading,
  submitting,
  error,
  activeSection,
  selectedVendor,
  selectedBooking,
  auditActivities,
  analytics,
  actionQueue,
  riskFlags,
  realtimeSnapshot,
  realtimeRefreshing,
  onLoadSummary,
  onRefreshRealtime,
  onLoadUsers,
  onLoadEvents,
  onLoadBookings,
  onLoadVendors,
  onSetActiveSection,
  onSelectVendor,
  onSelectBooking,
  onUpdateVendorVerification,
  onOverrideBookingStatus,
  onClearError
}: AdminDashboardViewProps) {
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [eventStartDate, setEventStartDate] = useState('')
  const [eventEndDate, setEventEndDate] = useState('')
  const [verifyReason, setVerifyReason] = useState('')
  const [overrideStatus, setOverrideStatus] = useState('')
  const [overrideReason, setOverrideReason] = useState('')

  useEffect(() => {
    void onLoadSummary()
  }, [onLoadSummary])

  useEffect(() => {
    if (activeSection === 'users') onLoadUsers({ role: roleFilter || undefined })
    else if (activeSection === 'events') onLoadEvents({ status: statusFilter || undefined })
    else if (activeSection === 'bookings') onLoadBookings({ status: statusFilter || undefined })
    else if (activeSection === 'vendors') onLoadVendors({ status: statusFilter || undefined })
  }, [activeSection, roleFilter, statusFilter, onLoadUsers, onLoadEvents, onLoadBookings, onLoadVendors])

  const handleSearch = (term?: string) => {
    if (activeSection === 'users') onLoadUsers({ role: roleFilter || undefined, search: term || undefined })
    else if (activeSection === 'events') onLoadEvents({ status: statusFilter || undefined, search: term || undefined })
    else if (activeSection === 'bookings') onLoadBookings({ status: statusFilter || undefined, search: term || undefined })
    else if (activeSection === 'vendors') onLoadVendors({ status: statusFilter || undefined, search: term || undefined })
  }

  const userColumns: Column<AdminUser>[] = [
    { key: 'name', label: 'Name', render: (u) => <span className="font-medium text-slate-950">{u.display_name || '-'}</span>, sortable: true },
    { key: 'email', label: 'Email', render: (u) => <span className="text-slate-500">{u.email}</span>, sortable: true },
    { key: 'role', label: 'Role', render: (u) => <StatusBadge status={u.role} size="sm" />, sortable: true },
    { key: 'created_at', label: 'Joined', render: (u) => <span className="text-slate-500">{formatDate(u.created_at)}</span>, sortable: true },
  ]

  const eventColumns: Column<AdminEvent>[] = [
    { key: 'title', label: 'Title', render: (e) => <span className="font-medium text-slate-950">{e.title}</span>, sortable: true },
    { key: 'org', label: 'Organizer', render: (e) => <span className="text-slate-500">{e.organization_name || '-'}</span> },
    { key: 'event_date', label: 'Date', render: (e) => <span className="text-slate-500">{formatDate(e.event_date)}</span>, sortable: true },
    { key: 'venue', label: 'Venue', render: (e) => <span className="text-slate-500">{e.venue}</span> },
    { key: 'budget', label: 'Budget', render: (e) => <span className="text-slate-500">${Number(e.budget).toLocaleString()}</span>, sortable: true },
    { key: 'status', label: 'Status', render: (e) => <StatusBadge status={e.status} size="sm" />, sortable: true },
  ]

  const bookingColumns: Column<AdminBooking>[] = [
    { key: 'event', label: 'Event', render: (b) => <span className="font-medium text-slate-950">{b.large_events?.title}</span> },
    { key: 'organizer', label: 'Organizer', render: (b) => <span className="text-slate-500">{b.organizer_profiles?.organization_name}</span> },
    { key: 'vendor', label: 'Vendor', render: (b) => <span className="text-slate-500">{b.vendor_profiles?.business_name}</span> },
    { key: 'category', label: 'Category', render: (b) => <span className="text-slate-500">{b.event_requirements?.category}</span> },
    { key: 'budget', label: 'Budget', render: (b) => <span className="text-slate-500">${b.requested_budget ? Number(b.requested_budget).toLocaleString() : 'N/A'}</span>, sortable: true },
    { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} size="sm" />, sortable: true },
    { key: 'actions', label: 'Actions', render: (b) => <Button variant="secondary" onClick={() => onSelectBooking(b)}>Override</Button> },
  ]

  const vendorColumns: Column<AdminVendor>[] = [
    { key: 'name', label: 'Business Name', render: (v) => <span className="font-medium text-slate-950">{v.business_name}</span>, sortable: true },
    { key: 'area', label: 'Service Area', render: (v) => <span className="text-slate-500">{v.service_area || '-'}</span> },
    { key: 'rating', label: 'Rating', render: (v) => <span className="text-slate-500">{v.rating}</span>, sortable: true },
    { key: 'verification', label: 'Verification', render: (v) => <StatusBadge status={v.verification_status} size="sm" />, sortable: true },
    { key: 'actions', label: 'Actions', render: (v) => <Button variant="secondary" onClick={() => onSelectVendor(v)}>Verify</Button> },
  ]

  const filteredEvents = events.filter((event) => {
    const eventTime = new Date(event.event_date).getTime()
    const startOk = eventStartDate ? eventTime >= new Date(eventStartDate).getTime() : true
    const endOk = eventEndDate ? eventTime <= new Date(eventEndDate).getTime() : true
    return startOk && endOk
  })

  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Manage organizers, vendors, events, bookings, contracts, reports, and operational exceptions."
        />

        <RealtimeIndicator
          snapshot={realtimeSnapshot}
          refreshing={realtimeRefreshing || loading}
          onRefresh={() => {
            void onRefreshRealtime()
            void onLoadSummary()
          }}
        />

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center justify-between gap-3">
            <span>{error}</span>
            <button type="button" onClick={onClearError} className="text-rose-500 hover:text-rose-700">Dismiss</button>
          </div>
        )}

        <DashboardCommandPanel
          meta="Operations control"
          title="Resolve approvals, disputes, and platform exceptions"
          description="Use the queue, analytics, and audit trail to keep vendor verification and booking oversight moving."
          action={
            <>
              <Button onClick={() => onSetActiveSection('vendors')}>Verify vendors</Button>
              <Button variant="secondary" onClick={() => onSetActiveSection('bookings')}>Inspect bookings</Button>
            </>
          }
          secondary={
            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Pending verifications</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{summary.pending_verifications}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Pending bookings</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{summary.pending_bookings}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Risk reviews</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{summary.rejected_bookings + summary.cancelled_bookings}</p>
              </div>
            </div>
          }
        />

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_360px]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Organizers" value={summary.total_organizers} color="text-slate-950" sub="Active organizers in the platform" />
            <SummaryCard label="Vendors" value={summary.total_vendors} color="text-indigo-700" sub="Verified and pending vendors" />
            <SummaryCard label="Events" value={summary.total_events} color="text-emerald-700" sub="Large event records under management" />
            <SummaryCard label="Pending bookings" value={summary.pending_bookings} color="text-amber-700" sub="Bookings waiting on action" />
          </div>
          <PlaceholderMedia
            title="Platform overview"
            subtitle="Keep approvals, booking volume, and vendor health visible from the operations command center."
            tone="indigo"
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Operational insights</h2>
            {analytics ? (
              <div className="mt-4 space-y-4">
                <AnalyticsMetricGrid metrics={analytics.metrics} />
                <div className="grid gap-4 lg:grid-cols-2">
                  <StatusDistributionPanel title="Bookings by status" items={analytics.bookingStatus} />
                  <StatusDistributionPanel title="Vendors by verification" items={analytics.vendorVerification} />
                  <StatusDistributionPanel title="Contracts by status" items={analytics.contractStatus} />
                  <StatusDistributionPanel title="Events by timeline stage" items={analytics.eventTimelineStage} />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <OperationsInsightCard insights={analytics.insights} />
                  <AdminTrendPlaceholder />
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Analytics will appear after the summary endpoint resolves.</p>
            )}
          </div>
          <div className="grid gap-4">
            <ActionQueuePanel items={actionQueue} />
            <RiskFlagsPanel flags={riskFlags} />
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Admin activity</h2>
              <p className="text-sm text-slate-500">Recent actions and system changes are recorded here.</p>
            </div>
          </div>
          <div className="mt-4">
            <AuditTimeline activities={auditActivities} emptyText="Recent admin actions will appear here." />
          </div>
        </section>

        <div className="flex gap-2 overflow-x-auto rounded-[20px] border border-slate-200 bg-white p-2 shadow-sm">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onSetActiveSection(item.key)}
              className={`whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${
                activeSection === item.key
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {activeSection === 'summary' && (
          loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-[20px] bg-slate-100" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <SummaryCard label="Accepted" value={summary.accepted_bookings} color="text-indigo-700" sub="Bookings accepted by vendors" />
                  <SummaryCard label="Confirmed" value={summary.confirmed_bookings} color="text-emerald-700" sub="Bookings locked in" />
                  <SummaryCard label="Completed" value={summary.completed_bookings} color="text-slate-950" sub="Bookings fully delivered" />
                  <SummaryCard label="Pending verifications" value={summary.pending_verifications} color="text-amber-700" sub="Vendor approvals waiting" />
                </div>
                <PlaceholderMedia
                  title="Operational signal"
                  subtitle="Use the summary to spot backlog, approvals, and booking momentum quickly."
                  tone="slate"
                />
              </section>
              {analytics && (
                <>
                  <AnalyticsMetricGrid metrics={analytics.metrics} />
                  <div className="grid gap-4 lg:grid-cols-2">
                    <StatusDistributionPanel title="Bookings by status" items={analytics.bookingStatus} />
                    <StatusDistributionPanel title="Vendors by verification" items={analytics.vendorVerification} />
                    <StatusDistributionPanel title="Contracts by status" items={analytics.contractStatus} />
                    <StatusDistributionPanel title="Events by timeline stage" items={analytics.eventTimelineStage} />
                  </div>
                </>
              )}
            </div>
          )
        )}

        {activeSection === 'users' && (
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
              <Select
                label="Role filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { value: '', label: 'All roles' },
                  { value: 'organizer', label: 'Organizer' },
                  { value: 'vendor', label: 'Vendor' },
                  { value: 'admin', label: 'Admin' }
                ]}
              />
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                Use search to find a user and open the detail table with status badges.
              </div>
            </div>
            <div className="mt-4">
              <DataTable
                columns={userColumns}
                data={users}
                keyExtractor={(u) => u.id}
                searchable
                searchPlaceholder="Search by name or email..."
                filterOptions={[]}
                onSearch={handleSearch}
                pageSize={10}
              />
            </div>
          </section>
        )}

        {activeSection === 'events' && (
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
              <Input label="Event date from" type="date" value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)} />
              <Input label="Event date to" type="date" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} />
            </div>
            <div className="mt-4">
              <DataTable
                columns={eventColumns}
                data={filteredEvents}
                keyExtractor={(e) => e.id}
                searchable
                searchPlaceholder="Search events..."
                filterOptions={[
                  { value: '', label: 'All status' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'planning', label: 'Planning' },
                  { value: 'booking', label: 'Booking' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                onSearch={handleSearch}
                pageSize={10}
              />
            </div>
          </section>
        )}

        {activeSection === 'bookings' && (
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                Booking overrides and exceptions sit here for admin review.
              </div>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                Use the status filter to narrow pending, accepted, or disputed records.
              </div>
            </div>
            <div className="mt-4">
              <DataTable
                columns={bookingColumns}
                data={bookings}
                keyExtractor={(b) => b.id}
                searchable
                searchPlaceholder="Search bookings..."
                filterOptions={[
                  { value: '', label: 'All status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'changes_requested', label: 'Changes requested' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                onSearch={handleSearch}
                pageSize={10}
              />
            </div>
          </section>
        )}

        {activeSection === 'vendors' && (
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                Vendor verification records stay separate from event and booking reviews.
              </div>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                Use the status filter to isolate pending, verified, or rejected vendors.
              </div>
            </div>
            <div className="mt-4">
              <DataTable
                columns={vendorColumns}
                data={vendors}
                keyExtractor={(v) => v.id}
                searchable
                searchPlaceholder="Search vendors..."
                filterOptions={[
                  { value: '', label: 'All status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'verified', label: 'Verified' },
                  { value: 'rejected', label: 'Rejected' }
                ]}
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                onSearch={handleSearch}
                pageSize={10}
              />
            </div>
          </section>
        )}

        <Modal
          open={!!selectedVendor}
          onClose={() => { onSelectVendor(null); setVerifyReason('') }}
          title={`Verify vendor: ${selectedVendor?.business_name || ''}`}
        >
          {selectedVendor && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Current status: <StatusBadge status={selectedVendor.verification_status} size="sm" />
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => onUpdateVendorVerification(selectedVendor.id, 'verified', verifyReason)}
                  loading={submitting}
                  disabled={selectedVendor.verification_status === 'verified'}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => onUpdateVendorVerification(selectedVendor.id, 'rejected', verifyReason)}
                  loading={submitting}
                  disabled={selectedVendor.verification_status === 'rejected'}
                >
                  Reject
                </Button>
              </div>
              <Input
                label="Reason (optional)"
                placeholder="Add a note about this decision..."
                value={verifyReason}
                onChange={(e) => setVerifyReason(e.target.value)}
              />
            </div>
          )}
        </Modal>

        <Modal
          open={!!selectedBooking}
          onClose={() => { onSelectBooking(null); setOverrideStatus(''); setOverrideReason('') }}
          title={`Override booking: ${selectedBooking?.large_events?.title || ''}`}
        >
          {selectedBooking && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Current status: <StatusBadge status={selectedBooking.status} size="sm" />
              </p>
              <Select
                label="New status"
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value)}
                placeholder="Select status..."
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'changes_requested', label: 'Changes requested' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
              />
              <Input
                label="Reason"
                placeholder="Why are you overriding this booking?"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                required
              />
              <Button
                onClick={() => {
                  if (overrideStatus && overrideReason) {
                    void onOverrideBookingStatus(selectedBooking.id, overrideStatus, overrideReason)
                    setOverrideStatus('')
                    setOverrideReason('')
                  }
                }}
                loading={submitting}
                disabled={!overrideStatus || !overrideReason}
              >
                Override status
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </DashboardShell>
  )
}
