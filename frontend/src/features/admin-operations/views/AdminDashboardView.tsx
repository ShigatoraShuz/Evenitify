import { useEffect, useState } from 'react'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { PageHeader } from '../../../shared/components/PageHeader'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { SummaryCard } from '../../../shared/components/SummaryCard'
import { Modal } from '../../../shared/components/Modal'
import { EmptyState } from '../../../shared/components/EmptyState'
import { Input } from '../../../shared/components/Input'
import { Select } from '../../../shared/components/Select'
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
  onLoadSummary: () => Promise<void>
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
  onLoadSummary,
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
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
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

  const handleSearch = () => {
    if (activeSection === 'users') onLoadUsers({ role: roleFilter || undefined, search: searchTerm || undefined })
    else if (activeSection === 'events') onLoadEvents({ status: statusFilter || undefined, search: searchTerm || undefined })
    else if (activeSection === 'bookings') onLoadBookings({ status: statusFilter || undefined, search: searchTerm || undefined })
    else if (activeSection === 'vendors') onLoadVendors({ status: statusFilter || undefined, search: searchTerm || undefined })
  }

  return (
    <DashboardShell>
      <PageHeader title="Admin Dashboard" subtitle="Operations overview and management" />

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

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {activeSection === 'summary' && (
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
          )}

          {activeSection === 'users' && (
            <div>
              <div className="flex gap-3 mb-4">
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Roles' },
                    { value: 'organizer', label: 'Organizer' },
                    { value: 'vendor', label: 'Vendor' },
                    { value: 'admin', label: 'Admin' }
                  ]}
                  className="w-40"
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
              {users.length === 0 ? (
                <EmptyState title="No users found" description="Try adjusting your search or filters" />
              ) : (
                <div className="bg-white rounded-xl border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{user.display_name || '-'}</td>
                          <td className="px-4 py-3 text-gray-500">{user.email}</td>
                          <td className="px-4 py-3"><StatusBadge status={user.role} size="sm" /></td>
                          <td className="px-4 py-3 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === 'events' && (
            <div>
              <div className="flex gap-3 mb-4">
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'planning', label: 'Planning' },
                    { value: 'booking', label: 'Booking' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' }
                  ]}
                  className="w-40"
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
              {events.length === 0 ? (
                <EmptyState title="No events found" description="Try adjusting your search or filters" />
              ) : (
                <div className="bg-white rounded-xl border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Organizer</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Venue</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Budget</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{event.title}</td>
                          <td className="px-4 py-3 text-gray-500">{(event as any).organizer_profiles?.organization_name || '-'}</td>
                          <td className="px-4 py-3 text-gray-500">{new Date(event.event_date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-gray-500">{event.venue}</td>
                          <td className="px-4 py-3 text-gray-500">${Number(event.budget).toLocaleString()}</td>
                          <td className="px-4 py-3"><StatusBadge status={event.status} size="sm" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === 'bookings' && (
            <div>
              <div className="flex gap-3 mb-4">
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'accepted', label: 'Accepted' },
                    { value: 'rejected', label: 'Rejected' },
                    { value: 'changes_requested', label: 'Changes Requested' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' }
                  ]}
                  className="w-40"
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
              {bookings.length === 0 ? (
                <EmptyState title="No bookings found" description="Try adjusting your search or filters" />
              ) : (
                <div className="bg-white rounded-xl border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Event</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Organizer</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Vendor</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Budget</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{booking.large_events?.title}</td>
                          <td className="px-4 py-3 text-gray-500">{booking.organizer_profiles?.organization_name}</td>
                          <td className="px-4 py-3 text-gray-500">{booking.vendor_profiles?.business_name}</td>
                          <td className="px-4 py-3 text-gray-500">{booking.event_requirements?.category}</td>
                          <td className="px-4 py-3 text-gray-500">${booking.requested_budget ? Number(booking.requested_budget).toLocaleString() : 'N/A'}</td>
                          <td className="px-4 py-3"><StatusBadge status={booking.status} size="sm" /></td>
                          <td className="px-4 py-3">
                            <Button variant="secondary" onClick={() => onSelectBooking(booking)}>
                              Override
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === 'vendors' && (
            <div>
              <div className="flex gap-3 mb-4">
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'verified', label: 'Verified' },
                    { value: 'rejected', label: 'Rejected' }
                  ]}
                  className="w-40"
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
              {vendors.length === 0 ? (
                <EmptyState title="No vendors found" description="Try adjusting your search or filters" />
              ) : (
                <div className="bg-white rounded-xl border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Business Name</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Service Area</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Rating</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Verification</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {vendors.map((vendor) => (
                        <tr key={vendor.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{vendor.business_name}</td>
                          <td className="px-4 py-3 text-gray-500">{vendor.service_area || '-'}</td>
                          <td className="px-4 py-3 text-gray-500">{vendor.rating}</td>
                          <td className="px-4 py-3"><StatusBadge status={vendor.verification_status} size="sm" /></td>
                          <td className="px-4 py-3">
                            <Button variant="secondary" onClick={() => onSelectVendor(vendor)}>
                              Verify
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
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


