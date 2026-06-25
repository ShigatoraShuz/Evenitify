import { useEffect } from 'react'
import { useVendorB2BDashboard } from '../viewmodels/useVendorB2BDashboard'
import { VendorAvailabilityView } from './VendorAvailabilityView'

export default function VendorAvailabilityViewWrapper() {
  const vm = useVendorB2BDashboard()

  useEffect(() => {
    void vm.loadBookings() // Fetches current availability as part of the loading process
  }, [vm.loadBookings])

  return (
    <VendorAvailabilityView
      availability={vm.availability}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      onUpdateAvailabilityStatus={vm.updateAvailabilityStatus}
      onClearError={vm.clearError}
    />
  )
}
