import { useVendorB2BDashboard } from '../viewmodels/useVendorB2BDashboard'
import { VendorB2BDashboardView } from './VendorB2BDashboardView'

export default function VendorB2BDashboardViewWrapper() {
  const vm = useVendorB2BDashboard()

  return (
    <VendorB2BDashboardView
      bookings={vm.bookings}
      selectedBooking={vm.selectedBooking}
      activeTab={vm.activeTab}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      onLoadBookings={vm.loadBookings}
      onSetTab={vm.setTab}
      onSelectBooking={vm.selectBooking}
      onUpdateStatus={vm.updateStatus}
      onClearError={vm.clearError}
    />
  )
}
