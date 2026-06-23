import { useVendorProcurement } from '../viewmodels/useVendorProcurement'
import { VendorProcurementView } from './VendorProcurementView'

export default function VendorProcurementViewWrapper() {
  const vm = useVendorProcurement()
  const params = new URLSearchParams(window.location.search)
  const eventId = params.get('eventId')

  return (
    <VendorProcurementView
      eventId={vm.eventId || eventId}
      requirements={vm.requirements}
      vendors={vm.vendors}
      selectedRequirement={vm.selectedRequirement}
      selectedVendor={vm.selectedVendor}
      currentStep={vm.currentStep}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      onInitEvent={vm.initEvent}
      onSetStep={vm.setStep}
      onSelectRequirement={vm.selectRequirement}
      onSearchVendors={vm.searchVendors}
      onSelectVendor={(vendor) => {
        vm.selectVendor(vendor)
      }}
      onCreateRequirement={vm.createRequirement}
      onDeleteRequirement={vm.deleteRequirement}
      onSubmitBooking={vm.submitBookingRequest}
      onClearError={vm.clearError}
    />
  )
}
