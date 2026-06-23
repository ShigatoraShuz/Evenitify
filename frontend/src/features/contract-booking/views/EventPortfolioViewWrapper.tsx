import { useEventPortfolio } from '../viewmodels/useEventPortfolio'
import { EventPortfolioView } from './EventPortfolioView'

export default function EventPortfolioViewWrapper() {
  const vm = useEventPortfolio()

  return (
    <EventPortfolioView
      portfolio={vm.portfolio}
      loading={vm.loading}
      submitting={vm.submitting}
      contractLoading={vm.contractLoading}
      error={vm.error}
      userRole={vm.userRole}
      detailedContract={vm.detailedContract}
      expandedBookingId={vm.expandedBookingId}
      onLoadPortfolio={vm.loadPortfolio}
      onExpandBooking={vm.expandBooking}
      onCreateContract={vm.createContract}
      onSendContract={vm.sendContract}
      onSignOrganizer={vm.signContractAsOrganizer}
      onSignVendor={vm.signContractAsVendor}
      onClearError={vm.clearError}
    />
  )
}
