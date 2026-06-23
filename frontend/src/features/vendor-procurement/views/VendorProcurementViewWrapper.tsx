import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVendorProcurement } from '../viewmodels/useVendorProcurement'
import { VendorProcurementView } from './VendorProcurementView'

export default function VendorProcurementViewWrapper() {
  const navigate = useNavigate()
  const vm = useVendorProcurement()
  const params = new URLSearchParams(window.location.search)
  const eventId = params.get('eventId')

  useEffect(() => {
    if (vm.eventId || eventId) {
      vm.loadDraft()
    }
  }, [vm.eventId, eventId])

  return (
    <VendorProcurementView
      eventId={vm.eventId || eventId}
      requirements={vm.requirements}
      vendors={vm.vendors}
      selectedRequirement={vm.selectedRequirement}
      selectedVendor={vm.selectedVendor}
      currentStep={vm.currentStep}
      filters={vm.filters}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      draftSaved={vm.draftSaved}
      validationErrors={vm.validationErrors}
      recommendations={vm.recommendations}
      selectedVendorAvailability={vm.selectedVendorAvailability}
      onInitEvent={vm.initEvent}
      onSetStep={vm.setStep}
      onSelectRequirement={vm.selectRequirement}
      onSearchVendors={vm.searchVendors}
      onSelectVendor={async (vendor) => {
        await vm.selectVendor(vendor)
      }}
      onCreateRequirement={vm.createRequirement}
      onDeleteRequirement={vm.deleteRequirement}
      onUpdateFilters={vm.updateFilters}
      onSubmitBooking={vm.submitBookingRequest}
      onSaveDraft={vm.saveDraft}
      onClearError={vm.clearError}
      onNavigateToCompare={() => navigate('/organizer/compare')}
      onNavigateToPortfolio={() => {
        const id = vm.eventId || eventId
        if (id) navigate(`/organizer/portfolio?eventId=${id}`)
      }}
    />
  )
}
