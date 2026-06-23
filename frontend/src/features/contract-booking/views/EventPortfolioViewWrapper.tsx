import { useOrganizerDashboard } from '../../organizer-dashboard/viewmodels/useOrganizerDashboard'
import { EventPortfolioView } from './EventPortfolioView'

export default function EventPortfolioViewWrapper() {
  const vm = useOrganizerDashboard()

  return (
    <EventPortfolioView
      portfolio={vm.portfolio}
      loading={vm.portfolioLoading}
      error={vm.error}
      onLoadPortfolio={vm.selectEvent}
      onClearError={vm.clearError}
    />
  )
}
