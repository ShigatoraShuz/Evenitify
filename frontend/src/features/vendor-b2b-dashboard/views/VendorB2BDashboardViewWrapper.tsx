import { useVendorB2BDashboard } from '../viewmodels/useVendorB2BDashboard'
import { VendorB2BDashboardView } from './VendorB2BDashboardView'
import { useRealtimeSnapshot } from '../../../shared/hooks/useRealtimeSnapshot'

export default function VendorB2BDashboardViewWrapper() {
  const vm = useVendorB2BDashboard()
  const realtime = useRealtimeSnapshot('vendor:bookings')

  return (
    <VendorB2BDashboardView
      bookings={vm.bookings}
      loading={vm.loading}
      error={vm.error}
      realtimeSnapshot={realtime.snapshot}
      realtimeRefreshing={realtime.refreshing}
      onLoadBookings={vm.loadBookings}
      onRefreshRealtime={realtime.refresh}
      onClearError={vm.clearError}
    />
  )
}
