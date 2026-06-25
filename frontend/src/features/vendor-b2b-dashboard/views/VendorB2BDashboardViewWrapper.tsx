import { useVendorB2BDashboard } from '../viewmodels/useVendorB2BDashboard'
import { VendorB2BDashboardView } from './VendorB2BDashboardView'
import { useRealtimeSnapshot } from '../../../shared/hooks/useRealtimeSnapshot'

export default function VendorB2BDashboardViewWrapper() {
  const vm = useVendorB2BDashboard()
  const realtime = useRealtimeSnapshot('vendor:bookings')

  return (
    <VendorB2BDashboardView
      bookings={vm.bookings}
      selectedBooking={vm.selectedBooking}
      activeTab={vm.activeTab}
      activeTypeTab={vm.activeTypeTab}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      realtimeSnapshot={realtime.snapshot}
      realtimeRefreshing={realtime.refreshing}
      onLoadBookings={vm.loadBookings}
      onRefreshRealtime={realtime.refresh}
      onSetTab={(tab: string) => vm.setTab(tab as Parameters<typeof vm.setTab>[0])}
      onSetTypeTab={vm.setTypeTab}
      onSelectBooking={vm.selectBooking}
      onUpdateStatus={vm.updateStatus}
      onSubmitQuote={vm.submitQuote}
      onClearError={vm.clearError}
    />
  )
}
