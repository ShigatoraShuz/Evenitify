import { useEffect } from 'react'
import { useEventPortfolio } from '../viewmodels/useEventPortfolio'
import { EventPortfolioView } from './EventPortfolioView'

export default function EventPortfolioViewWrapper() {
  const vm = useEventPortfolio()
  const params = new URLSearchParams(window.location.search)
  const eventId = params.get('eventId')

  useEffect(() => {
    if (eventId) vm.loadPortfolio(eventId)
  }, [eventId])

  return (
    <EventPortfolioView
      eventId={eventId}
      portfolio={vm.portfolio}
      loading={vm.loading}
      submitting={vm.submitting}
      contractLoading={vm.contractLoading}
      error={vm.error}
      userRole={vm.userRole}
      detailedContract={vm.detailedContract}
      expandedBookingId={vm.expandedBookingId}
      activeTab={vm.activeTab}
      vendors={vm.vendors}
      contracts={vm.contracts}
      activity={vm.activity}
      onLoadPortfolio={vm.loadPortfolio}
      onSetActiveTab={vm.setActiveTab}
      onExpandBooking={vm.expandBooking}
      onCreateContract={vm.createContract}
      onSendContract={vm.sendContract}
      onSignOrganizer={vm.signContractAsOrganizer}
      onSignVendor={vm.signContractAsVendor}
      onClearError={vm.clearError}
    />
  )
}
