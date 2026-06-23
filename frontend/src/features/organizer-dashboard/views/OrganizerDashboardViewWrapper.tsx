import { useNavigate } from 'react-router-dom'
import { useOrganizerDashboard } from '../viewmodels/useOrganizerDashboard'
import { OrganizerDashboardView } from './OrganizerDashboardView'

export default function OrganizerDashboardViewWrapper() {
  const navigate = useNavigate()
  const vm = useOrganizerDashboard()

  return (
    <OrganizerDashboardView
      events={vm.events}
      summary={vm.summary}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      onLoadEvents={vm.loadEvents}
      onCreateEvent={vm.createEvent}
      onSelectEvent={(eventId) => {
        vm.selectEvent(eventId)
        navigate(`/organizer/procurement?eventId=${eventId}`)
      }}
    />
  )
}
