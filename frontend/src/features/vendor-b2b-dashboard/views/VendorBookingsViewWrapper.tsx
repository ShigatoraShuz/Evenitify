import { useVendorB2BDashboard } from '../viewmodels/useVendorB2BDashboard'
import { VendorBookingsView } from './VendorBookingsView'
import type { VendorB2BBookingStatus } from '../models/vendor-b2b-dashboard.model'
import { useRealtimeSnapshot } from '../../../shared/hooks/useRealtimeSnapshot'

export default function VendorBookingsViewWrapper() {
  const vm = useVendorB2BDashboard()
  const realtime = useRealtimeSnapshot('vendor:bookings')

  return (
    <VendorBookingsView
      bookings={vm.bookings}
      selectedBooking={vm.selectedBooking}
      activeTab={vm.activeTab}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      contract={vm.contract}
      contractLoading={vm.contractLoading}
      auditActivities={vm.auditActivities}
      bookingMessages={vm.bookingMessages}
      realtimeSnapshot={realtime.snapshot}
      realtimeRefreshing={realtime.refreshing}
      onRefreshRealtime={realtime.refresh}
      onLoadBookings={vm.loadBookings}
      onSetTab={(tab: string) => vm.setTab(tab as VendorB2BBookingStatus | 'all')}
      onSelectBooking={vm.selectBooking}
      onUpdateStatus={vm.updateStatus}
      onClearError={vm.clearError}
      onLoadContract={vm.loadContract}
      onSignVendorContract={vm.signVendorContract}
      onSendBookingMessage={vm.sendBookingMessage}
      userRole={vm.userRole}
    />
  )
}
