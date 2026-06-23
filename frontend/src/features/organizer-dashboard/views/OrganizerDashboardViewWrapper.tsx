import { useNavigate } from 'react-router-dom'
import { useOrganizerDashboard } from '../viewmodels/useOrganizerDashboard'
import { OrganizerDashboardView } from './OrganizerDashboardView'
import { useRealtimeSnapshot } from '../../../shared/hooks/useRealtimeSnapshot'

export default function OrganizerDashboardViewWrapper() {
  const navigate = useNavigate()
  const vm = useOrganizerDashboard()
  const realtime = useRealtimeSnapshot('organizer:dashboard')

  return (
    <OrganizerDashboardView
      events={vm.events}
      summary={vm.summary}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      realtimeSnapshot={realtime.snapshot}
      realtimeRefreshing={realtime.refreshing}
      onLoadEvents={vm.loadEvents}
      onRefreshRealtime={realtime.refresh}
      onCreateEvent={vm.createEvent}
      onSelectEvent={(eventId) => {
        vm.selectEvent(eventId)
        navigate(`/organizer/procurement?eventId=${eventId}`)
      }}
      onNavigateToPortfolio={(eventId) => {
        navigate(`/organizer/portfolio?eventId=${eventId}`)
      }}
    />
  )
}
