import { useOrganizerDashboard } from '../viewmodels/useOrganizerDashboard'
import { OrganizerDashboardView } from './OrganizerDashboardView'

export default function OrganizerDashboardViewWrapper() {
  const vm = useOrganizerDashboard()

  return <OrganizerDashboardView {...vm} />
}
