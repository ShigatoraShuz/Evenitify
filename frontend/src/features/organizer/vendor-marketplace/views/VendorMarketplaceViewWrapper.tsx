import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVendorMarketplaceViewModel } from '../viewmodels/useVendorMarketplaceViewModel'
import { VendorMarketplaceView } from './VendorMarketplaceView'
import { buildBriefFromForm } from '../models/vendorMarketplace.model'

const BRIEF_STORAGE_KEY = 'eventify:marketplace-brief'

export default function VendorMarketplaceViewWrapper() {
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search)
  const eventId = params.get('eventId')

  const vm = useVendorMarketplaceViewModel(eventId)

  const handleChangeEventBrief = useCallback(() => {
    if (eventId) {
      navigate(`/organizer/plan-event?edit=${eventId}`)
    } else {
      navigate('/organizer/plan-event')
    }
  }, [navigate, eventId])

  const handleClearEventFilter = useCallback(() => {
    vm.clearBrief()
    navigate('/organizer/vendor-marketplace', { replace: true })
  }, [vm.clearBrief, navigate])

  const handleVendorClick = useCallback((vendor: any) => {
    vm.openVendorDetail(vendor.id)
  }, [vm.openVendorDetail])

  const handleSelectExistingEvent = useCallback((eventBriefId: string) => {
    const stored = sessionStorage.getItem(BRIEF_STORAGE_KEY)
    if (stored) {
      navigate(`/organizer/vendor-marketplace?eventId=${eventBriefId}`)
    } else {
      navigate(`/organizer/vendor-marketplace?eventId=${eventBriefId}`)
    }
    vm.closeSelectBriefModal()
  }, [navigate, vm.closeSelectBriefModal])

  const handlePlanNewEvent = useCallback(() => {
    vm.closeSelectBriefModal()
    navigate('/organizer/plan-event')
  }, [navigate, vm.closeSelectBriefModal])

  return (
    <VendorMarketplaceView
      brief={vm.brief}
      vendorCount={vm.allVendors.length}
      filteredVendors={vm.filteredVendors}
      filters={vm.filters}
      hasActiveFilters={vm.hasActiveFilters}
      eventFilterActive={vm.eventFilterActive}
      compareVendors={vm.compareVendors}
      showCompareDrawer={vm.showCompareDrawer}
      showRequestModal={vm.showRequestModal}
      showVendorDetail={vm.showVendorDetail}
      showSelectBriefModal={vm.showSelectBriefModal}
      showGeneralInquiry={vm.showGeneralInquiry}
      requestForm={vm.requestForm}
      selectedVendor={vm.selectedVendor}
      selectedGalleryImage={vm.selectedGalleryImage}
      selectedDate={vm.selectedDate}
      selectedTimeSlot={vm.selectedTimeSlot}
      generalInquiryMessage={vm.generalInquiryMessage}
      eventBriefs={vm.eventBriefs}
      currentAvailability={vm.currentAvailability}
      savedVendorIds={vm.savedVendorIds}
      isInCompare={vm.isInCompare}
      isSaved={vm.isSaved}
      getRequestStatus={vm.getRequestStatus}
      onVendorClick={handleVendorClick}
      onToggleCompare={vm.toggleCompare}
      onToggleSave={vm.toggleSaveVendor}
      onSendRequest={vm.handleSendRequest}
      onUpdateFilters={vm.updateFilters}
      onResetFilters={vm.resetFilters}
      onCloseVendorDetail={vm.closeVendorDetail}
      onSelectGalleryImage={vm.selectGalleryImage}
      onSelectDate={vm.selectDate}
      onSelectTimeSlot={vm.selectTimeSlot}
      onCloseRequestModal={vm.closeRequestModal}
      onUpdateRequestForm={vm.updateRequestForm}
      onSubmitRequest={vm.submitRequest}
      onSetShowCompareDrawer={vm.setShowCompareDrawer}
      onClearCompare={vm.clearCompare}
      onClearEventFilter={handleClearEventFilter}
      onChangeEventBrief={handleChangeEventBrief}
      onCloseSelectBriefModal={vm.closeSelectBriefModal}
      onSelectExistingEvent={handleSelectExistingEvent}
      onPlanNewEvent={handlePlanNewEvent}
      onToggleGeneralInquiry={vm.toggleGeneralInquiry}
      onSetGeneralInquiryMessage={vm.setGeneralInquiryMessage}
      onSendGeneralInquiry={vm.sendGeneralInquiry}
    />
  )
}
