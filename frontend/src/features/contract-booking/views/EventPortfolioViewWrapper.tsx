import { useEffect } from 'react'
import { useEventPortfolio } from '../viewmodels/useEventPortfolio'
import { EventPortfolioView } from './EventPortfolioView'
import { useRealtimeSnapshot } from '../../../shared/hooks/useRealtimeSnapshot'

export default function EventPortfolioViewWrapper() {
  const vm = useEventPortfolio()
  const params = new URLSearchParams(window.location.search)
  const eventId = params.get('eventId')
  const realtime = useRealtimeSnapshot(`organizer:portfolio:${eventId || 'none'}`)

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
      documents={vm.documents}
      auditActivities={vm.auditActivities}
      planningTimeline={vm.planningTimeline}
      budgetSummary={vm.budgetSummary}
      bookingMessages={vm.bookingMessages}
      realtimeSnapshot={realtime.snapshot}
      realtimeRefreshing={realtime.refreshing}
      onLoadPortfolio={vm.loadPortfolio}
      onRefreshRealtime={realtime.refresh}
      onSetActiveTab={vm.setActiveTab}
      onExpandBooking={vm.expandBooking}
      onCreateContract={vm.createContract}
      onSendContract={vm.sendContract}
      onSignOrganizer={vm.signContractAsOrganizer}
      onSignVendor={vm.signContractAsVendor}
      onUploadDocument={vm.uploadDocument}
      onSendMessage={vm.sendBookingMessage}
      onClearError={vm.clearError}
    />
  )
}
