import { useNavigate } from 'react-router-dom'
import { useOrganizerDashboard } from '../viewmodels/useOrganizerDashboard'
import { OrganizerDashboardView } from './OrganizerDashboardView'
import { useRealtimeSnapshot } from '../../../shared/hooks/useRealtimeSnapshot'
import type { DashboardEventPreview } from '../models/organizer-dashboard.model'

export default function OrganizerDashboardViewWrapper() {
  const navigate = useNavigate()
  const vm = useOrganizerDashboard()
  const realtime = useRealtimeSnapshot('organizer:dashboard')

  // Map the VM events (LargeEvent[]) to the view's DashboardEventPreview[]
  const events: DashboardEventPreview[] = vm.events.map((e) => ({
    id: e.id,
    name: e.title,
    eventType: 'custom',
    status: (e.status as any) || 'planning',
    progress: 50,
    date: e.event_date || '',
    location: e.venue,
    guestCount: e.expected_guests ?? 0,
    budget: e.budget,
  }))

  const drafts = events.filter((e) => e.status === 'draft').map((e) => ({
    id: e.id,
    name: e.name,
    eventType: e.eventType,
    lastEdited: new Date().toISOString(),
    lastCompletedStep: 2,
    progress: e.progress,
  }))

  // Map the summary stats
  const summaryStats = {
    totalEvents: vm.summary?.eventStatusSummary?.total ?? 0,
    draftEvents: vm.summary?.eventStatusSummary?.draft ?? 0,
    activeVendorRequests: vm.summary?.requirementSummary?.total ?? 0,
    pendingResponses: vm.summary?.bookingSummary?.pending ?? 0,
    acceptedBookings: vm.summary?.bookingSummary?.accepted ?? 0,
    confirmedBookings: vm.summary?.bookingSummary?.confirmed ?? 0,
  }

  const vendorRequestCounts = {
    sent: vm.summary?.bookingSummary?.total ?? 0,
    pending: vm.summary?.bookingSummary?.pending ?? 0,
    accepted: vm.summary?.bookingSummary?.accepted ?? 0,
    rejected: vm.summary?.bookingSummary?.rejected ?? 0,
    confirmed: vm.summary?.bookingSummary?.confirmed ?? 0,
    contract_pending: vm.summary?.bookingSummary?.contractSent ?? 0,
  }

  // Map recent activities
  const activities = (vm.summary?.recentActivity || []).map((act) => ({
    id: act.id,
    type: act.new_status === 'pending' ? 'request_sent' : act.new_status === 'accepted' ? 'vendor_accepted' : act.new_status === 'rejected' ? 'vendor_rejected' : 'booking_confirmed',
    description: `Booking status changed to ${act.new_status}${act.reason ? `: ${act.reason}` : ''}`,
    timestamp: act.created_at,
  }))

  return (
    <OrganizerDashboardView
      events={events}
      drafts={drafts}
      vendorRequests={[]}
      bookings={[]}
      recommendedVendors={[]}
      activities={activities}
      notifications={[]}
      summaryStats={summaryStats}
      vendorRequestCounts={vendorRequestCounts}
    />
  )
}
