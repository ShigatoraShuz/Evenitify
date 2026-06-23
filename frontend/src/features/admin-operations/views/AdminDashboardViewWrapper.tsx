import { useAdminDashboard } from '../viewmodels/useAdminDashboard'
import { AdminDashboardView } from './AdminDashboardView'

export default function AdminDashboardViewWrapper() {
  const vm = useAdminDashboard()

  return (
    <AdminDashboardView
      summary={vm.summary}
      users={vm.users}
      events={vm.events}
      bookings={vm.bookings}
      vendors={vm.vendors}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      activeSection={vm.activeSection}
      selectedVendor={vm.selectedVendor}
      selectedBooking={vm.selectedBooking}
      onLoadSummary={vm.loadSummary}
      onLoadUsers={vm.loadUsers}
      onLoadEvents={vm.loadEvents}
      onLoadBookings={vm.loadBookings}
      onLoadVendors={vm.loadVendors}
      onSetActiveSection={vm.setActiveSection}
      onSelectVendor={vm.selectVendor}
      onSelectBooking={vm.selectBooking}
      onUpdateVendorVerification={vm.updateVendorVerification}
      onOverrideBookingStatus={vm.overrideBookingStatus}
      onClearError={vm.clearError}
    />
  )
}
