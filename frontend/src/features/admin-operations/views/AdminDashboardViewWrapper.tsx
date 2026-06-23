import { useAdminDashboard } from '../viewmodels/useAdminDashboard'
import { AdminDashboardView } from './AdminDashboardView'
import { useRealtimeSnapshot } from '../../../shared/hooks/useRealtimeSnapshot'

export default function AdminDashboardViewWrapper() {
  const vm = useAdminDashboard()
  const realtime = useRealtimeSnapshot('admin:dashboard')

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
      auditActivities={vm.auditActivities}
      actionQueue={vm.actionQueue}
      riskFlags={vm.riskFlags}
      realtimeSnapshot={realtime.snapshot}
      realtimeRefreshing={realtime.refreshing}
      onLoadSummary={vm.loadSummary}
      onRefreshRealtime={realtime.refresh}
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
