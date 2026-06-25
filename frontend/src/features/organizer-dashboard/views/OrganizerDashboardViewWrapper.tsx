import { useOrganizerDashboard } from '../viewmodels/useOrganizerDashboard'
import { OrganizerDashboardView } from './OrganizerDashboardView'
import { useRealtimeSnapshot } from '../../../shared/hooks/useRealtimeSnapshot'

export default function OrganizerDashboardViewWrapper() {
  const vm = useOrganizerDashboard()

  return (
    <OrganizerDashboardView
      events={vm.events}
      drafts={vm.drafts}
      vendorRequests={vm.vendorRequests}
      bookings={vm.bookings}
      recommendedVendors={vm.recommendedVendors}
      activities={vm.activities}
      notifications={vm.notifications}
      summaryStats={vm.summaryStats}
      vendorRequestCounts={vm.vendorRequestCounts}
    />
  )
}
