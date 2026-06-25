import { useEffect } from 'react'
import { useVendorB2BDashboard } from '../viewmodels/useVendorB2BDashboard'
import { VendorServicesView } from './VendorServicesView'

export default function VendorServicesViewWrapper() {
  const vm = useVendorB2BDashboard()

  useEffect(() => {
    void vm.loadBookings()
  }, [vm.loadBookings])

  return (
    <VendorServicesView
      services={vm.services}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      onCreateServicePackage={vm.createServicePackage}
      onClearError={vm.clearError}
    />
  )
}
