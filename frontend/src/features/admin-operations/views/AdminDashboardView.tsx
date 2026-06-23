import { useEffect, useState } from 'react'
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
  const [searchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [eventStartDate, setEventStartDate] = useState('')
  const [eventEndDate, setEventEndDate] = useState('')
  const [verifyReason, setVerifyReason] = useState('')
  const [overrideStatus, setOverrideStatus] = useState('')
  const [overrideReason, setOverrideReason] = useState('')

  useEffect(() => { onLoadSummary() }, [])

  useEffect(() => {
    if (activeSection === 'users') onLoadUsers({ role: roleFilter || undefined, search: searchTerm || undefined })
    else if (activeSection === 'events') onLoadEvents({ status: statusFilter || undefined, search: searchTerm || undefined })
    else if (activeSection === 'bookings') onLoadBookings({ status: statusFilter || undefined, search: searchTerm || undefined })
    else if (activeSection === 'vendors') onLoadVendors({ status: statusFilter || undefined, search: searchTerm || undefined })
  }, [activeSection])

  const handleSearch = (term?: string) => {
    const search = term ?? searchTerm
    if (activeSection === 'users') onLoadUsers({ role: roleFilter || undefined, search: search || undefined })
    else if (activeSection === 'events') onLoadEvents({ status: statusFilter || undefined, search: search || undefined })
    else if (activeSection === 'bookings') onLoadBookings({ status: statusFilter || undefined, search: search || undefined })
    else if (activeSection === 'vendors') onLoadVendors({ status: statusFilter || undefined, search: search || undefined })
  }

  const userColumns: Column<AdminUser>[] = [
    { key: 'name', label: 'Name', render: (u) => <span className="font-medium">{u.display_name || '-'}</span>, sortable: true },
    { key: 'email', label: 'Email', render: (u) => <span className="text-gray-500">{u.email}</span>, sortable: true },
    { key: 'role', label: 'Role', render: (u) => <StatusBadge status={u.role} size="sm" />, sortable: true },
    { key: 'created_at', label: 'Joined', render: (u) => <span className="text-gray-500">{new Date(u.created_at).toLocaleDateString()}</span>, sortable: true },
  ]

  const eventColumns: Column<AdminEvent>[] = [
    { key: 'title', label: 'Title', render: (e) => <span className="font-medium">{e.title}</span>, sortable: true },
    { key: 'org', label: 'Organizer', render: (e) => <span className="text-gray-500">{e.organization_name || '-'}</span> },
    { key: 'event_date', label: 'Date', render: (e) => <span className="text-gray-500">{new Date(e.event_date).toLocaleDateString()}</span>, sortable: true },
    { key: 'venue', label: 'Venue', render: (e) => <span className="text-gray-500">{e.venue}</span> },
    { key: 'budget', label: 'Budget', render: (e) => <span className="text-gray-500">${Number(e.budget).toLocaleString()}</span>, sortable: true },
    { key: 'status', label: 'Status', render: (e) => <StatusBadge status={e.status} size="sm" />, sortable: true },
  ]

  const bookingColumns: Column<AdminBooking>[] = [
    { key: 'event', label: 'Event', render: (b) => <span className="font-medium">{b.large_events?.title}</span> },
    { key: 'organizer', label: 'Organizer', render: (b) => <span className="text-gray-500">{b.organizer_profiles?.organization_name}</span> },
    { key: 'vendor', label: 'Vendor', render: (b) => <span className="text-gray-500">{b.vendor_profiles?.business_name}</span> },
    { key: 'category', label: 'Category', render: (b) => <span className="text-gray-500">{b.event_requirements?.category}</span> },
    { key: 'budget', label: 'Budget', render: (b) => <span className="text-gray-500">${b.requested_budget ? Number(b.requested_budget).toLocaleString() : 'N/A'}</span>, sortable: true },
    { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} size="sm" />, sortable: true },
    { key: 'actions', label: 'Actions', render: (b) => <Button variant="secondary" onClick={() => onSelectBooking(b)}>Override</Button> },
  ]

  const vendorColumns: Column<AdminVendor>[] = [
    { key: 'name', label: 'Business Name', render: (v) => <span className="font-medium">{v.business_name}</span>, sortable: true },
    { key: 'area', label: 'Service Area', render: (v) => <span className="text-gray-500">{v.service_area || '-'}</span> },
    { key: 'rating', label: 'Rating', render: (v) => <span className="text-gray-500">{v.rating}</span>, sortable: true },
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
      <PageHeader title="Admin Dashboard" subtitle="Operations overview and management" />
      <div className="mb-4">
        <RealtimeIndicator snapshot={realtimeSnapshot} refreshing={realtimeRefreshing || loading} onRefresh={() => { void onRefreshRealtime(); void onLoadSummary() }} />
      </div>

      <DashboardCommandPanel
        meta="Operations control"
        title="Resolve the highest-impact platform actions"
        description="Use the queue, risk flags, and audit timeline to keep vendor verification and booking oversight moving."
        action={
          <>
            <Button onClick={() => onSetActiveSection('vendors')}>Verify Vendors</Button>
            <Button variant="secondary" onClick={() => onSetActiveSection('bookings')}>Inspect Bookings</Button>
          </>
        }
        secondary={
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div><span className="font-semibold text-slate-900">{summary.pending_verifications}</span> pending verifications</div>
            <div><span className="font-semibold text-slate-900">{summary.pending_bookings}</span> pending bookings</div>
            <div><span className="font-semibold text-slate-900">{summary.rejected_bookings + summary.cancelled_bookings}</span> risk reviews</div>
          </div>
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={onClearError} className="text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b pb-2 overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onSetActiveSection(item.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap ${
              activeSection === item.key
                ? 'bg-white border border-b-0 border-gray-200 text-brand-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {activeSection === 'summary' && (
        loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard label="Organizers" value={summary.total_organizers} color="text-blue-600" />
              <SummaryCard label="Vendors" value={summary.total_vendors} color="text-purple-600" />
              <SummaryCard label="Events (500+)" value={summary.large_events_500plus} color="text-indigo-600" />
              <SummaryCard label="Pending Bookings" value={summary.pending_bookings} color="text-yellow-600" />
              <SummaryCard label="Accepted" value={summary.accepted_bookings} color="text-cyan-600" />
              <SummaryCard label="Confirmed" value={summary.confirmed_bookings} color="text-blue-600" />
              <SummaryCard label="Completed" value={summary.completed_bookings} color="text-emerald-600" />
              <SummaryCard label="Pending Verifications" value={summary.pending_verifications} color="text-orange-600" />
              <SummaryCard label="Draft Contracts" value={summary.draft_contracts} color="text-gray-600" />
              <SummaryCard label="Active Contracts" value={summary.active_contracts} color="text-green-600" />
              <SummaryCard label="Total Events" value={summary.total_events} color="text-slate-600" />
              <SummaryCard label="Rejected Bookings" value={summary.rejected_bookings} color="text-red-600" />
            </div>
            {analytics && (
              <>
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
              </>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
              <ActionQueuePanel items={actionQueue} />
              <RiskFlagsPanel flags={riskFlags} />
            </div>
            <AuditTimeline activities={auditActivities} emptyText="Recent admin actions will appear here." />
          </div>
        )
      )}

      {activeSection === 'users' && (
        <DataTable
          columns={userColumns}
          data={users}
          keyExtractor={(u) => u.id}
          searchable
          searchPlaceholder="Search by name or email..."
          filterOptions={[
            { value: '', label: 'All Roles' },
            { value: 'organizer', label: 'Organizer' },
            { value: 'vendor', label: 'Vendor' },
            { value: 'admin', label: 'Admin' }
          ]}
          filterValue={roleFilter}
          onFilterChange={setRoleFilter}
          onSearch={handleSearch}
          pageSize={10}
        />
      )}

      {activeSection === 'events' && (
        <div className="space-y-4">
          <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
            <Input label="Event date from" type="date" value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)} />
            <Input label="Event date to" type="date" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} />
          </div>
          <DataTable
          columns={eventColumns}
          data={filteredEvents}
          keyExtractor={(e) => e.id}
          searchable
          searchPlaceholder="Search events..."
          filterOptions={[
            { value: '', label: 'All Status' },
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
      )}

      {activeSection === 'bookings' && (
        <DataTable
          columns={bookingColumns}
          data={bookings}
          keyExtractor={(b) => b.id}
          searchable
          searchPlaceholder="Search bookings..."
          filterOptions={[
            { value: '', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'changes_requested', label: 'Changes Requested' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' }
          ]}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          onSearch={handleSearch}
          pageSize={10}
        />
      )}

      {activeSection === 'vendors' && (
        <DataTable
          columns={vendorColumns}
          data={vendors}
          keyExtractor={(v) => v.id}
          searchable
          searchPlaceholder="Search vendors..."
          filterOptions={[
            { value: '', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'verified', label: 'Verified' },
            { value: 'rejected', label: 'Rejected' }
          ]}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          onSearch={handleSearch}
          pageSize={10}
        />
      )}

      <Modal
        open={!!selectedVendor}
        onClose={() => { onSelectVendor(null); setVerifyReason('') }}
        title={`Verify Vendor: ${selectedVendor?.business_name || ''}`}
      >
        {selectedVendor && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
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
        title={`Override Booking: ${selectedBooking?.large_events?.title || ''}`}
      >
        {selectedBooking && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Current status: <StatusBadge status={selectedBooking.status} size="sm" />
            </p>
            <Select
              label="New Status"
              value={overrideStatus}
              onChange={(e) => setOverrideStatus(e.target.value)}
              placeholder="Select status..."
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'changes_requested', label: 'Changes Requested' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />
            <Input
              label="Reason (required)"
              placeholder="Why are you overriding this booking?"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              required
            />
            <Button
              onClick={() => {
                if (overrideStatus && overrideReason) {
                  onOverrideBookingStatus(selectedBooking.id, overrideStatus, overrideReason)
                  setOverrideStatus('')
                  setOverrideReason('')
                }
              }}
              loading={submitting}
              disabled={!overrideStatus || !overrideReason}
            >
              Override Status
            </Button>
          </div>
        )}
      </Modal>
    </DashboardShell>
  )
}
