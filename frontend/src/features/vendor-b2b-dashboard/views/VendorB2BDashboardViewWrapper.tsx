import { useVendorB2BDashboard } from '../viewmodels/useVendorB2BDashboard'
import { VendorB2BDashboardView } from './VendorB2BDashboardView'
import type { VendorB2BBookingStatus } from '../models/vendor-b2b-dashboard.model'
import { useRealtimeSnapshot } from '../../../shared/hooks/useRealtimeSnapshot'

export default function VendorB2BDashboardViewWrapper() {
  const vm = useVendorB2BDashboard()
  const realtime = useRealtimeSnapshot('vendor:bookings')

  return (
    <VendorB2BDashboardView
      bookings={vm.bookings}
      selectedBooking={vm.selectedBooking}
      activeTab={vm.activeTab}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      contract={vm.contract}
      contractLoading={vm.contractLoading}
      auditActivities={vm.auditActivities}
      availability={vm.availability}
      bookingMessages={vm.bookingMessages}
      realtimeSnapshot={realtime.snapshot}
      realtimeRefreshing={realtime.refreshing}
      onLoadBookings={vm.loadBookings}
      onRefreshRealtime={realtime.refresh}
      onSetTab={(tab: string) => vm.setTab(tab as VendorB2BBookingStatus | 'all')}
      onSelectBooking={vm.selectBooking}
      onUpdateStatus={vm.updateStatus}
      onClearError={vm.clearError}
      onLoadContract={vm.loadContract}
      onSignVendorContract={vm.signVendorContract}
      onUpdateAvailabilityStatus={vm.updateAvailabilityStatus}
      activeTypeTab={vm.activeTypeTab}
      onSetTypeTab={vm.setTypeTab}
      onSubmitQuote={vm.submitQuote}
    />
  )
}
