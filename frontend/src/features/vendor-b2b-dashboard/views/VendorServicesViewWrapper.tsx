import { useEffect, useRef } from 'react'
import { useVendorB2BDashboard } from '../viewmodels/useVendorB2BDashboard'
import { VendorServicesView } from './VendorServicesView'

export default function VendorServicesViewWrapper() {
  const vm = useVendorB2BDashboard()
  const loaded = useRef(false)

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true
      void vm.loadBookings() // loads services as part of its Promise.all
    }
  }, []) // Run once on mount

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
