import { GitCompare, ShoppingBag, X, Calendar, Clock } from 'lucide-react'
import { DashboardShell } from '../../../../shared/components/DashboardShell'
import { Button } from '../../../../shared/components/Button'
import { OrganizerPage, OrganizerPageHeader } from '../../../../shared/components/OrganizerUI'
import { VendorMarketplaceFilters } from '../components/VendorMarketplaceFilters'
import { VendorMarketplaceFilterRow } from '../components/VendorMarketplaceFilterRow'
import { VendorGrid } from '../components/VendorGrid'
import { VendorCompareDrawer } from '../components/VendorCompareDrawer'
import { VendorDetailModal } from '../components/VendorDetailModal'
import { SelectEventBriefModal } from '../components/SelectEventBriefModal'
import { RequestVendorModal } from '../components/RequestVendorModal'
import { RequestSuccessModal } from '../components/RequestSuccessModal'
import type {
  EventBrief,
  VendorMarketplaceVendor,
  VendorFilterState,
  RequestFormData,
  ProcurementStatus,
  VendorAvailability,
  TimeSlotType,
  EventBriefReference,
} from '../models/vendorMarketplace.model'

interface VendorMarketplaceViewProps {
  brief: EventBrief | null
  vendorCount: number
  filteredVendors: VendorMarketplaceVendor[]
  filters: VendorFilterState
  hasActiveFilters: boolean
  eventFilterActive: boolean
  compareVendors: VendorMarketplaceVendor[]
  showCompareDrawer: boolean
  showRequestModal: boolean
  showVendorDetail: boolean
  showSelectBriefModal: boolean
  showRequestSuccessModal: boolean
  showGeneralInquiry: boolean
  requestForm: RequestFormData
  selectedVendor: VendorMarketplaceVendor | null
  selectedDate: string | null
  selectedTimeSlot: TimeSlotType | null
  generalInquiryMessage: string
  eventBriefs: EventBriefReference[]
  currentAvailability: VendorAvailability | null
  savedVendorIds: string[]
  isInCompare: (id: string) => boolean
  isSaved: (id: string) => boolean
  getRequestStatus: (vendorId: string) => ProcurementStatus | null
  onVendorClick: (vendor: VendorMarketplaceVendor) => void
  onToggleCompare: (id: string) => void
  onToggleSave: (id: string) => void
  onSendRequest: (vendor: VendorMarketplaceVendor) => void
  onUpdateFilters: (next: Partial<VendorFilterState>) => void
  onResetFilters: () => void
  onCloseVendorDetail: () => void
  onSelectDate: (date: string) => void
  onSelectTimeSlot: (slot: TimeSlotType) => void
  onCloseRequestModal: () => void
  onUpdateRequestForm: (next: Partial<RequestFormData>) => void
  onSubmitRequest: () => void
  onSetShowCompareDrawer: (v: boolean) => void
  onClearCompare: () => void
  onClearEventFilter: () => void
  onChangeEventBrief: () => void
  onCloseSelectBriefModal: () => void
  onCloseRequestSuccessModal: () => void
  onGoToVendorTracker: () => void
  onSelectExistingEvent: (id: string) => void
  onPlanNewEvent: () => void
  onToggleGeneralInquiry: () => void
  onSetGeneralInquiryMessage: (msg: string) => void
  onSendGeneralInquiry: () => void
}

export function VendorMarketplaceView({
  brief,
  vendorCount,
  filteredVendors,
  filters,
  hasActiveFilters,
  eventFilterActive,
  compareVendors,
  showCompareDrawer,
  showRequestModal,
  showVendorDetail,
  showSelectBriefModal,
  showRequestSuccessModal,
  showGeneralInquiry,
  requestForm,
  selectedVendor,
  selectedDate,
  selectedTimeSlot,
  generalInquiryMessage,
  eventBriefs,
  currentAvailability,
  isInCompare,
  isSaved,
  getRequestStatus,
  onVendorClick,
  onToggleCompare,
  onToggleSave,
  onSendRequest,
  onUpdateFilters,
  onResetFilters,
  onCloseVendorDetail,
  onSelectDate,
  onSelectTimeSlot,
  onCloseRequestModal,
  onUpdateRequestForm,
  onSubmitRequest,
  onSetShowCompareDrawer,
  onClearCompare,
  onClearEventFilter,
  onChangeEventBrief,
  onCloseSelectBriefModal,
  onCloseRequestSuccessModal,
  onGoToVendorTracker,
  onSelectExistingEvent,
  onPlanNewEvent,
  onToggleGeneralInquiry,
  onSetGeneralInquiryMessage,
  onSendGeneralInquiry,
}: VendorMarketplaceViewProps) {
  return (
    <DashboardShell>
      <OrganizerPage>
        <OrganizerPageHeader
          title="Vendor Marketplace"
          description="Browse real vendor records, compare services, check availability, and send requests."
          action={
            compareVendors.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => onSetShowCompareDrawer(true)}
                className="flex items-center gap-2"
              >
                <GitCompare className="h-4 w-4" />
                Compare ({compareVendors.length})
              </Button>
            )
          }
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Marketplace Filters</span>
              <p className="text-xs text-slate-500">Use real vendor fields to narrow category, area, price, capacity, and availability.</p>
            </div>
            <div className="mt-3">
              <VendorMarketplaceFilterRow
                filters={filters}
                onUpdateFilters={onUpdateFilters}
              />
            </div>
            <div className="mt-4">
              <VendorMarketplaceFilters
                filters={filters}
                hasActiveFilters={hasActiveFilters}
                onUpdateFilters={onUpdateFilters}
                onResetFilters={onResetFilters}
              />
            </div>
          </div>
        </OrganizerPageHeader>

        {eventFilterActive && brief && (
          <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Showing vendors matched for {brief.eventName}
                  </h2>
                  <p className="text-sm text-brand-100">
                    Vendors are automatically filtered based on your event brief.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={onClearEventFilter}
                  className="flex items-center gap-1.5 bg-white/15 text-white border-white/25 hover:bg-white/25"
                >
                  <X className="h-4 w-4" />
                  Clear Event Filter
                </Button>
                <Button
                  variant="secondary"
                  onClick={onChangeEventBrief}
                  className="flex items-center gap-1.5 bg-white/15 text-white border-white/25 hover:bg-white/25"
                >
                  Change Event Brief
                </Button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-brand-100">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{brief.eventDate}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{brief.startTime} - {brief.endTime}</span>
              <span>{brief.location} · {brief.guestCount} guests</span>
            </div>
          </div>
        )}

        <div className="text-sm text-slate-500 mb-2">
          Showing {filteredVendors.length} of {vendorCount} vendors
          {eventFilterActive && brief && ` · Matched for ${brief.eventName}`}
        </div>

        <VendorGrid
          vendors={filteredVendors}
          hasActiveFilters={hasActiveFilters}
          eventFilterActive={eventFilterActive}
          isInCompare={isInCompare}
          isSaved={isSaved}
          onVendorClick={onVendorClick}
          onToggleCompare={onToggleCompare}
          onToggleSave={onToggleSave}
          onSendRequest={onSendRequest}
          onResetFilters={onResetFilters}
          onClearEventFilter={onClearEventFilter}
        />
      </OrganizerPage>

      <VendorDetailModal
        open={showVendorDetail}
        vendor={selectedVendor}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
        currentAvailability={currentAvailability}
        requestForm={requestForm}
        eventFilterActive={eventFilterActive}
        isInCompare={isInCompare}
        isSaved={isSaved}
        requestStatus={selectedVendor ? getRequestStatus(selectedVendor.id) : null}
        onClose={onCloseVendorDetail}
        onSelectDate={onSelectDate}
        onSelectTimeSlot={onSelectTimeSlot}
        onUpdateRequestForm={onUpdateRequestForm}
        onSendRequest={onSendRequest}
        onToggleCompare={onToggleCompare}
        onToggleSave={onToggleSave}
      />

      <RequestVendorModal
        open={showRequestModal}
        vendor={selectedVendor}
        brief={brief}
        requestForm={requestForm}
        onClose={onCloseRequestModal}
        onUpdateRequestForm={onUpdateRequestForm}
        onSubmitRequest={onSubmitRequest}
      />

      <VendorCompareDrawer
        open={showCompareDrawer}
        vendors={compareVendors}
        onClose={() => onSetShowCompareDrawer(false)}
        onRemove={(id) => onToggleCompare(id)}
        onClear={onClearCompare}
        onSendRequest={onSendRequest}
      />

      <SelectEventBriefModal
        open={showSelectBriefModal}
        showGeneralInquiry={showGeneralInquiry}
        generalInquiryMessage={generalInquiryMessage}
        eventBriefs={eventBriefs}
        onClose={onCloseSelectBriefModal}
        onSelectEvent={onSelectExistingEvent}
        onPlanEvent={onPlanNewEvent}
        onToggleGeneralInquiry={onToggleGeneralInquiry}
        onSetGeneralInquiryMessage={onSetGeneralInquiryMessage}
        onSendGeneralInquiry={onSendGeneralInquiry}
      />

      <RequestSuccessModal
        open={showRequestSuccessModal}
        vendorName={selectedVendor?.businessName || 'the vendor'}
        eventName={brief?.eventName || 'your event'}
        onClose={onCloseRequestSuccessModal}
        onGoToTracker={onGoToVendorTracker}
      />
    </DashboardShell>
  )
}
