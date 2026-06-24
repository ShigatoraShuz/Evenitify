import { useState, useCallback, useMemo, useEffect } from 'react'
import { buildViewModelStateMeta } from '../../../../shared/types/viewModelState'
import {
  type EventBrief,
  type VendorMarketplaceVendor,
  type VendorFilterState,
  type ProcurementRequest,
  type RequestFormData,
  type CompareEntry,
  type ProcurementStatus,
  type VendorAvailability,
  type TimeSlotType,
  type TimeSlot,
  type EventBriefReference,
  DEFAULT_VENDOR_FILTERS,
} from '../models/vendorMarketplace.model'
import { vendorMarketplaceService } from '../../../../services/vendorMarketplaceService'
import { eventBriefService } from '../../../../services/eventBriefService'
import { vendorRequestService } from '../../../../services/vendorRequestService'
import type { VendorMarketplaceItem } from '../../../../services/vendorMarketplaceService'

const BRIEF_STORAGE_KEY = 'eventify:marketplace-brief'
const SAVED_VENDORS_KEY = 'eventify:saved-vendors'

interface VendorMarketplaceViewModelState {
  brief: EventBrief | null
  allVendors: VendorMarketplaceVendor[]
  filteredVendors: VendorMarketplaceVendor[]
  filters: VendorFilterState
  compareList: CompareEntry[]
  savedVendorIds: string[]
  procurementRequests: ProcurementRequest[]
  selectedVendor: VendorMarketplaceVendor | null
  showCompareDrawer: boolean
  showRequestModal: boolean
  showVendorDetail: boolean
  selectedGalleryImage: string
  requestForm: RequestFormData
  selectedDate: string | null
  selectedTimeSlot: TimeSlotType | null
  showSelectBriefModal: boolean
  showGeneralInquiry: boolean
  generalInquiryMessage: string
  eventBriefs: EventBriefReference[]
  currentAvailability: VendorAvailability | null
  loading: boolean
  error: string | null
}

function loadSavedVendors(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(SAVED_VENDORS_KEY) || '[]')
  } catch { return [] }
}

function saveSavedVendors(ids: string[]) {
  sessionStorage.setItem(SAVED_VENDORS_KEY, JSON.stringify(ids))
}

function mapVendorItemToModel(item: VendorMarketplaceItem): VendorMarketplaceVendor {
  return {
    id: item.id,
    businessName: item.businessName,
    serviceCategory: item.serviceCategory,
    location: item.location,
    serviceArea: item.serviceArea,
    startingPrice: item.startingPrice,
    rating: item.rating,
    completedBookings: item.completedBookings,
    capacity: item.capacity,
    availabilityStatus: item.availabilityStatus as 'available' | 'limited' | 'unavailable',
    matchScore: 0,
    matchLevel: 'none',
    eventTypeExperience: item.eventTypeExperience as VendorMarketplaceVendor['eventTypeExperience'],
    packageHighlights: item.packageHighlights,
    packageTiers: item.packageTiers,
    verified: item.verified,
    responseTime: item.responseTime,
    description: item.description,
    galleryImages: item.galleryImages.map((g) => ({ url: g.url, label: g.label })),
    reviews: item.reviews.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      authorAvatar: '',
      rating: r.rating,
      date: r.date,
      text: r.text,
      eventType: r.eventType,
    })),
    inclusions: item.inclusions,
    addOns: item.addOns,
    cancellationPolicy: item.cancellationPolicy,
    bookingNotes: item.bookingNotes,
    memberSince: item.memberSince,
    responseRate: item.responseRate,
    totalReviews: item.totalReviews,
  }
}

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { label: 'Morning (8AM - 12PM)', value: 'morning', isOccupied: false },
  { label: 'Afternoon (12PM - 5PM)', value: 'afternoon', isOccupied: false },
  { label: 'Evening (5PM - 10PM)', value: 'evening', isOccupied: false },
  { label: 'Full Day', value: 'full_day', isOccupied: false },
]

export function useVendorMarketplaceViewModel(eventIdFromUrl: string | null) {
  const [state, setState] = useState<VendorMarketplaceViewModelState>({
    brief: null,
    allVendors: [],
    filteredVendors: [],
    filters: DEFAULT_VENDOR_FILTERS,
    compareList: [],
    savedVendorIds: loadSavedVendors(),
    procurementRequests: [],
    selectedVendor: null,
    showCompareDrawer: false,
    showRequestModal: false,
    showVendorDetail: false,
    selectedGalleryImage: '',
    requestForm: { vendorId: '', vendorName: '', serviceCategory: '', requestedBudget: '', notes: '' },
    selectedDate: null,
    selectedTimeSlot: null,
    showSelectBriefModal: false,
    showGeneralInquiry: false,
    generalInquiryMessage: '',
    eventBriefs: [],
    currentAvailability: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const [vendorsData, briefsData] = await Promise.all([
          vendorMarketplaceService.getAll(),
          eventBriefService.getAll(),
        ])
        if (cancelled) return
        const vendors = vendorsData.map(mapVendorItemToModel)
        const briefs: EventBriefReference[] = briefsData.map((b) => ({
          id: b.id,
          eventName: b.eventName,
          eventType: b.eventType,
          eventDate: b.eventDate,
        }))
        setState((s) => ({
          ...s,
          allVendors: vendors,
          filteredVendors: vendors,
          eventBriefs: briefs,
          loading: false,
          error: null,
        }))
      } catch (err) {
        if (cancelled) return
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load marketplace data',
        }))
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const vendorsRefined = useMemo(() => {
    let result = [...state.allVendors]
    const f = state.filters

    if (f.service.length > 0) {
      result = result.filter((v) =>
        v.serviceCategory.some((cat) =>
          f.service.some((s) => cat.toLowerCase().includes(s.toLowerCase()))
        )
      )
    }

    if (f.location.trim()) {
      const loc = f.location.toLowerCase()
      result = result.filter(
        (v) =>
          v.location.toLowerCase().includes(loc) ||
          v.serviceArea.toLowerCase().includes(loc)
      )
    }

    if (f.budgetMin !== null) {
      result = result.filter((v) => v.startingPrice >= f.budgetMin!)
    }
    if (f.budgetMax !== null) {
      result = result.filter((v) => v.startingPrice <= f.budgetMax!)
    }

    if (f.availability.length > 0) {
      result = result.filter((v) => f.availability.includes(v.availabilityStatus))
    }

    if (f.capacityMin !== null) {
      result = result.filter((v) => v.capacity >= f.capacityMin!)
    }

    if (f.ratingMin !== null) {
      result = result.filter((v) => v.rating >= f.ratingMin!)
    }

    if (f.matchLevel) {
      result = result.filter((v) => v.matchLevel === f.matchLevel)
    }

    if (f.eventTypeExperience.length > 0) {
      result = result.filter((v) =>
        v.eventTypeExperience.some((et) => f.eventTypeExperience.includes(et))
      )
    }

    return result
  }, [state.allVendors, state.filters])

  useEffect(() => {
    setState((s) => ({ ...s, filteredVendors: vendorsRefined }))
  }, [vendorsRefined])

  useEffect(() => {
    if (!eventIdFromUrl) return
    const stored = sessionStorage.getItem(BRIEF_STORAGE_KEY)
    if (!stored) return
    const brief = JSON.parse(stored) as EventBrief
    if (brief.eventId !== eventIdFromUrl) return
    setState((s) => ({ ...s, brief }))
  }, [eventIdFromUrl])

  const setBrief = useCallback((brief: EventBrief) => {
    sessionStorage.setItem(BRIEF_STORAGE_KEY, JSON.stringify(brief))
    setState((s) => ({
      ...s,
      brief,
      filters: DEFAULT_VENDOR_FILTERS,
      compareList: [],
    }))
  }, [])

  const clearBrief = useCallback(() => {
    sessionStorage.removeItem(BRIEF_STORAGE_KEY)
    setState((s) => ({
      ...s,
      brief: null,
      filters: DEFAULT_VENDOR_FILTERS,
      compareList: [],
      selectedDate: null,
      selectedTimeSlot: null,
    }))
  }, [])

  const updateFilters = useCallback((next: Partial<VendorFilterState>) => {
    setState((s) => ({ ...s, filters: { ...s.filters, ...next } }))
  }, [])

  const resetFilters = useCallback(() => {
    setState((s) => ({ ...s, filters: DEFAULT_VENDOR_FILTERS }))
  }, [])

  const hasActiveFilters = useMemo(() => {
    const f = state.filters
    return (
      f.service.length > 0 ||
      f.location.trim() !== '' ||
      f.budgetMin !== null ||
      f.budgetMax !== null ||
      f.availability.length > 0 ||
      f.capacityMin !== null ||
      f.ratingMin !== null ||
      f.matchLevel !== null ||
      f.eventTypeExperience.length > 0
    )
  }, [state.filters])

  const toggleCompare = useCallback((vendorId: string) => {
    setState((s) => {
      const exists = s.compareList.find((e) => e.vendorId === vendorId)
      if (exists) {
        return { ...s, compareList: s.compareList.filter((e) => e.vendorId !== vendorId) }
      }
      if (s.compareList.length >= 4) return s
      return { ...s, compareList: [...s.compareList, { vendorId, addedAt: new Date().toISOString() }] }
    })
  }, [])

  const isInCompare = useCallback((vendorId: string) => {
    return state.compareList.some((e) => e.vendorId === vendorId)
  }, [state.compareList])

  const clearCompare = useCallback(() => {
    setState((s) => ({ ...s, compareList: [] }))
  }, [])

  const toggleSaveVendor = useCallback((vendorId: string) => {
    setState((s) => {
      const exists = s.savedVendorIds.includes(vendorId)
      const next = exists ? s.savedVendorIds.filter((id) => id !== vendorId) : [...s.savedVendorIds, vendorId]
      saveSavedVendors(next)
      return { ...s, savedVendorIds: next }
    })
  }, [])

  const isSaved = useCallback((vendorId: string) => {
    return state.savedVendorIds.includes(vendorId)
  }, [state.savedVendorIds])

  const openRequestModal = useCallback((vendor: VendorMarketplaceVendor) => {
    setState((s) => ({
      ...s,
      selectedVendor: vendor,
      showRequestModal: true,
      requestForm: {
        vendorId: vendor.id,
        vendorName: vendor.businessName,
        serviceCategory: vendor.serviceCategory[0] || '',
        requestedBudget: s.brief ? String(Math.round(s.brief.budget / Math.max(s.brief.selectedVendorServices.length, 1))) : '',
        notes: '',
      },
    }))
  }, [])

  const closeRequestModal = useCallback(() => {
    setState((s) => ({ ...s, showRequestModal: false }))
  }, [])

  const openVendorDetail = useCallback(async (vendorId: string) => {
    const vendor = state.allVendors.find((v) => v.id === vendorId)
    if (!vendor) return
    setState((s) => ({
      ...s,
      selectedVendor: vendor,
      showVendorDetail: true,
      selectedGalleryImage: vendor.galleryImages[0]?.url || '',
      selectedDate: null,
      selectedTimeSlot: null,
      currentAvailability: null,
    }))
    try {
      const now = new Date()
      const availability = await vendorMarketplaceService.getAvailability(vendorId, now.getFullYear(), now.getMonth() + 1)
      setState((s) => ({
        ...s,
        currentAvailability: {
          vendorId: availability.vendorId,
          year: availability.year,
          month: availability.month,
          days: availability.days.map((d) => ({
            date: d.date,
            status: d.status,
            slots: d.slots.map((sl) => ({
              label: sl.label,
              value: sl.value as TimeSlotType,
              isOccupied: sl.isOccupied,
            })),
          })),
        },
      }))
    } catch {
      // Availability not critical; show vendor detail without it
    }
  }, [state.allVendors])

  const closeVendorDetail = useCallback(() => {
    setState((s) => ({ ...s, showVendorDetail: false, selectedVendor: null, currentAvailability: null }))
  }, [])

  const selectGalleryImage = useCallback((url: string) => {
    setState((s) => ({ ...s, selectedGalleryImage: url }))
  }, [])

  const selectDate = useCallback((date: string) => {
    setState((s) => ({ ...s, selectedDate: date, selectedTimeSlot: null }))
  }, [])

  const selectTimeSlot = useCallback((slot: TimeSlotType) => {
    setState((s) => ({ ...s, selectedTimeSlot: slot }))
  }, [])

  const updateRequestForm = useCallback((next: Partial<RequestFormData>) => {
    setState((s) => ({ ...s, requestForm: { ...s.requestForm, ...next } }))
  }, [])

  const getSelectedDateSlots = useCallback(() => {
    if (!state.currentAvailability || !state.selectedDate) return DEFAULT_TIME_SLOTS
    const day = state.currentAvailability.days.find((d) => d.date === state.selectedDate)
    return day ? day.slots : DEFAULT_TIME_SLOTS
  }, [state.currentAvailability, state.selectedDate])

  const openSelectBriefModal = useCallback(() => {
    setState((s) => ({ ...s, showSelectBriefModal: true, showGeneralInquiry: false, generalInquiryMessage: '' }))
  }, [])

  const closeSelectBriefModal = useCallback(() => {
    setState((s) => ({ ...s, showSelectBriefModal: false, showGeneralInquiry: false, generalInquiryMessage: '' }))
  }, [])

  const setGeneralInquiryMessage = useCallback((msg: string) => {
    setState((s) => ({ ...s, generalInquiryMessage: msg }))
  }, [])

  const toggleGeneralInquiry = useCallback(() => {
    setState((s) => ({ ...s, showGeneralInquiry: !s.showGeneralInquiry, generalInquiryMessage: '' }))
  }, [])

  const submitRequest = useCallback(async () => {
    const req = state.requestForm
    if (!req.vendorId || !state.brief) return

    const newRequest: ProcurementRequest = {
      id: `pr-${Date.now()}`,
      eventId: state.brief.eventId,
      vendorId: req.vendorId,
      vendorName: req.vendorName,
      serviceCategory: req.serviceCategory,
      status: 'sent',
      requestedBudget: req.requestedBudget ? Number(req.requestedBudget) : null,
      notes: req.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      await vendorRequestService.sendBookingRequest({
        eventBriefId: state.brief.eventId,
        vendorId: req.vendorId,
        packageName: state.selectedTimeSlot || undefined,
        selectedDate: state.selectedDate || undefined,
        selectedTimeSlot: state.selectedTimeSlot || undefined,
        message: req.notes,
      })
    } catch {
      // Continue with local state even if API fails
    }

    setState((s) => ({
      ...s,
      procurementRequests: [...s.procurementRequests, newRequest],
      showRequestModal: false,
      selectedVendor: null,
      selectedDate: null,
      selectedTimeSlot: null,
    }))
  }, [state.requestForm, state.brief, state.selectedDate, state.selectedTimeSlot])

  const sendGeneralInquiry = useCallback(async () => {
    const vendor = state.selectedVendor
    if (!vendor) return

    try {
      await vendorRequestService.sendGeneralInquiry({
        vendorId: vendor.id,
        message: state.generalInquiryMessage || 'General inquiry',
      })
    } catch {
      // Continue with local state even if API fails
    }

    setState((s) => ({
      ...s,
      showSelectBriefModal: false,
      showGeneralInquiry: false,
      generalInquiryMessage: '',
    }))
  }, [state.selectedVendor, state.generalInquiryMessage])

  const getRequestStatus = useCallback((vendorId: string): ProcurementStatus | null => {
    const req = state.procurementRequests.find((r) => r.vendorId === vendorId)
    return req ? req.status : null
  }, [state.procurementRequests])

  const compareVendors = useMemo(() => {
    return state.allVendors.filter((v) => state.compareList.some((e) => e.vendorId === v.id))
  }, [state.allVendors, state.compareList])

  const sortedVendors = useMemo(() => {
    return [...state.filteredVendors].sort((a, b) => {
      if (state.brief) return b.matchScore - a.matchScore || b.rating - a.rating
      return b.rating - a.rating
    })
  }, [state.filteredVendors, state.brief])

  const handleSendRequest = useCallback((vendor: VendorMarketplaceVendor) => {
    if (state.brief) {
      openRequestModal(vendor)
    } else {
      setState((s) => ({
        ...s,
        selectedVendor: vendor,
        showSelectBriefModal: true,
        showGeneralInquiry: false,
        generalInquiryMessage: '',
      }))
    }
  }, [state.brief, openRequestModal])

  return {
    brief: state.brief,
    allVendors: state.allVendors,
    filteredVendors: sortedVendors,
    filters: state.filters,
    compareList: state.compareList,
    compareVendors,
    savedVendorIds: state.savedVendorIds,
    procurementRequests: state.procurementRequests,
    selectedVendor: state.selectedVendor,
    showCompareDrawer: state.showCompareDrawer,
    showRequestModal: state.showRequestModal,
    showVendorDetail: state.showVendorDetail,
    selectedGalleryImage: state.selectedGalleryImage,
    requestForm: state.requestForm,
    selectedDate: state.selectedDate,
    selectedTimeSlot: state.selectedTimeSlot,
    showSelectBriefModal: state.showSelectBriefModal,
    showGeneralInquiry: state.showGeneralInquiry,
    generalInquiryMessage: state.generalInquiryMessage,
    eventBriefs: state.eventBriefs,
    currentAvailability: state.currentAvailability,
    loading: state.loading,
    error: state.error,
    hasActiveFilters,
    eventFilterActive: !!state.brief,
    setBrief,
    clearBrief,
    updateFilters,
    resetFilters,
    toggleCompare,
    isInCompare,
    clearCompare,
    toggleSaveVendor,
    isSaved,
    openRequestModal,
    closeRequestModal,
    openVendorDetail,
    closeVendorDetail,
    selectGalleryImage,
    selectDate,
    selectTimeSlot,
    getSelectedDateSlots,
    updateRequestForm,
    submitRequest,
    getRequestStatus,
    openSelectBriefModal,
    closeSelectBriefModal,
    setGeneralInquiryMessage,
    toggleGeneralInquiry,
    sendGeneralInquiry,
    handleSendRequest,
    setShowCompareDrawer: (v: boolean) => setState((s) => ({ ...s, showCompareDrawer: v })),
    ...buildViewModelStateMeta({
      loading: state.loading,
      submitting: false,
      error: state.error,
      empty: !state.loading && sortedVendors.length === 0,
      loaded: !state.loading,
    }),
  }
}
