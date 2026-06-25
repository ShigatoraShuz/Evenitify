import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildViewModelStateMeta } from '../../../../shared/types/viewModelState'
import {
  type EventBrief,
  type EventTypeId,
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
  type MatchLevel,
  type SetupMode,
  DEFAULT_VENDOR_FILTERS,
} from '../models/vendorMarketplace.model'
import { vendorMarketplaceService } from '../../../../services/vendorMarketplaceService'
import { eventBriefService } from '../../../../services/eventBriefService'
import { vendorRequestService } from '../../../../services/vendorRequestService'
import type { VendorMarketplaceItem } from '../../../../services/vendorMarketplaceService'

const BRIEF_STORAGE_KEY = 'eventify:marketplace-brief'
const SAVED_VENDORS_KEY = 'eventify:saved-vendors'
const LAST_VENDOR_REQUEST_KEY = 'eventify:last-vendor-request'

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
  requestForm: RequestFormData
  selectedDate: string | null
  selectedTimeSlot: TimeSlotType | null
  showSelectBriefModal: boolean
  showRequestSuccessModal: boolean
  requestSuccessVendorName: string
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
    availabilityStatus: item.availabilityStatus as 'available' | 'limited' | 'unavailable',
    matchScore: 0,
    matchLevel: 'none',
    packageHighlights: item.packageHighlights,
    packageTiers: item.packageTiers,
    verified: item.verified,
    description: item.description,
    services: item.services.map((service) => ({
      id: service.id,
      category: service.category,
      serviceName: service.serviceName,
      description: service.description,
      basePrice: service.basePrice,
      availabilityStatus: service.availabilityStatus,
    })),
    memberSince: item.memberSince,
  }
}

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { label: 'Morning (8AM - 12PM)', value: 'morning', isOccupied: false },
  { label: 'Afternoon (12PM - 5PM)', value: 'afternoon', isOccupied: false },
  { label: 'Evening (5PM - 10PM)', value: 'evening', isOccupied: false },
  { label: 'Full Day', value: 'full_day', isOccupied: false },
]

function categoriesMatch(cat1: string, cat2: string): boolean {
  const c1 = cat1.toLowerCase().trim()
  const c2 = cat2.toLowerCase().trim()

  if (c1 === c2) return true
  if (c1.includes(c2) || c2.includes(c1)) return true

  const synonyms: Array<[string[], string[]]> = [
    [['photography', 'videography', 'photo', 'video'], ['photo/video', 'photography', 'videography']],
    [['transport', 'transportation'], ['transport', 'transportation', 'shuttle']],
    [['lights and sounds', 'av', 'lighting', 'sound'], ['lights and sounds', 'audio', 'visual']],
    [['event staff', 'staff', 'security', 'cleanup crew'], ['staff', 'security']],
    [['venue', 'venue decoration', 'event styling', 'florist'], ['venue', 'decoration', 'decor']]
  ]

  for (const [group1, group2] of synonyms) {
    const inGroup1 = group1.some(item => c1.includes(item) || item.includes(c1))
    const inGroup2 = group2.some(item => c2.includes(item) || item.includes(c2))
    if (inGroup1 && inGroup2) return true
  }

  return false
}

function calculateMatchScore(vendor: VendorMarketplaceVendor, brief: EventBrief | null): { score: number, level: MatchLevel } {
  if (!brief) return { score: 0, level: 'none' }

  let score = 0

  // 1. Service Category Match (up to 40 points)
  const matchingServices = vendor.serviceCategory.filter(cat =>
    brief.selectedVendorServices.some(s => categoriesMatch(cat, s))
  )
  if (matchingServices.length > 0) {
    score += 40
  }

  // 2. Rating Match (up to 30 points)
  score += Math.round((vendor.rating / 5) * 30)

  // 3. Location Match (up to 20 points)
  const locMatch = !!(vendor.location && brief.location && (
    vendor.location.toLowerCase().includes(brief.location.toLowerCase()) ||
    vendor.serviceArea.toLowerCase().includes(brief.location.toLowerCase()) ||
    brief.location.toLowerCase().includes(vendor.location.toLowerCase())
  ))
  if (locMatch) {
    score += 20
  }

  // 4. Budget Match (up to 10 points)
  if (vendor.startingPrice <= brief.budget) {
    score += 10
  }

  let level: MatchLevel = 'none'
  if (score >= 75) level = 'recommended'
  else if (score >= 40) level = 'partial'

  return { score, level }
}

function normalizeEventType(value: string | null | undefined): EventTypeId {
  const normalized = (value || '').toLowerCase().trim()
  if (normalized === 'product launch') return 'product-launch'
  if (normalized === 'wedding' || normalized === 'concert' || normalized === 'corporate' ||
      normalized === 'conference' || normalized === 'festival' || normalized === 'birthday' ||
      normalized === 'expo' || normalized === 'private' || normalized === 'custom') {
    return normalized as EventTypeId
  }
  return 'custom'
}

function normalizeSetupMode(value: string | null | undefined): SetupMode {
  const normalized = (value || '').toLowerCase().trim()
  if (normalized === 'indoor' || normalized === 'outdoor' || normalized === 'hybrid') return normalized
  return 'hybrid'
}

function getDefaultSelectedServiceIds(
  vendor: VendorMarketplaceVendor,
  brief: EventBrief | null,
): string[] {
  if (vendor.services.length === 0) return []

  if (!brief || brief.selectedVendorServices.length === 0) {
    return [vendor.services[0].id]
  }

  const selected = vendor.services
    .filter((service) =>
      brief.selectedVendorServices.some((serviceName) => categoriesMatch(service.category, serviceName)),
    )
    .map((service) => service.id)

  return selected.length > 0 ? selected : [vendor.services[0].id]
}

export function useVendorMarketplaceViewModel(eventIdFromUrl: string | null) {
  const navigate = useNavigate()
  const storedBrief = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(BRIEF_STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as EventBrief
    } catch {
      return null
    }
  }, [eventIdFromUrl])
  const [state, setState] = useState<VendorMarketplaceViewModelState>({
    brief: eventIdFromUrl ? null : storedBrief,
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

    requestForm: { vendorId: '', vendorName: '', serviceCategory: '', requestedBudget: '', notes: '', selectedServiceIds: [] },
    selectedDate: null,
    selectedTimeSlot: null,
    showSelectBriefModal: false,
    showRequestSuccessModal: false,
    requestSuccessVendorName: '',
    showGeneralInquiry: false,
    generalInquiryMessage: '',
    eventBriefs: [],
    currentAvailability: null,
    loading: true,
    error: null,
  })

  const loadMarketplace = useCallback(async (cancelled?: () => boolean) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const briefsPromise = eventBriefService.getAll()
      const vendorsData = eventIdFromUrl
        ? await vendorMarketplaceService.getMatched(eventIdFromUrl)
        : await vendorMarketplaceService.getAll()

      const briefsData = await briefsPromise
      const resolvedVendors = vendorsData.length > 0 || !eventIdFromUrl
        ? vendorsData
        : await vendorMarketplaceService.getAll()

      if (cancelled?.()) return
      const vendors = resolvedVendors.map(mapVendorItemToModel)
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
        brief: eventIdFromUrl ? s.brief : (s.brief ?? storedBrief),
        filters: eventIdFromUrl
          ? s.filters
          : {
            ...DEFAULT_VENDOR_FILTERS,
          },
        loading: false,
        error: null,
      }))
    } catch (err) {
      if (cancelled?.()) return
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load marketplace data',
      }))
    }
  }, [eventIdFromUrl])

  useEffect(() => {
    let cancelled = false
    if (!eventIdFromUrl && !storedBrief) {
      sessionStorage.removeItem(BRIEF_STORAGE_KEY)
    }
    void loadMarketplace(() => cancelled)
    return () => { cancelled = true }
  }, [loadMarketplace, eventIdFromUrl, storedBrief])

  const vendorsRefined = useMemo(() => {
    let result = [...state.allVendors]

    result = result.map(v => {
      const { score, level } = calculateMatchScore(v, state.brief)
      return { ...v, matchScore: score, matchLevel: level }
    })

    const f = state.filters

    if (f.service.length > 0) {
      result = result.filter((v) =>
        v.serviceCategory.some((cat) =>
          f.service.some((s) => categoriesMatch(cat, s))
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

    if (f.ratingMin !== null) {
      result = result.filter((v) => v.rating >= f.ratingMin!)
    }

    if (f.matchLevel) {
      result = result.filter((v) => v.matchLevel === f.matchLevel)
    }

    return result
  }, [state.allVendors, state.filters, state.brief])

  useEffect(() => {
    setState((s) => ({ ...s, filteredVendors: vendorsRefined }))
  }, [vendorsRefined])

  useEffect(() => {
    if (!eventIdFromUrl) {
      if (storedBrief) {
        setState((s) => ({
          ...s,
          brief: storedBrief,
          filters: {
            ...s.filters,
            service: storedBrief.selectedVendorServices || []
          }
        }))
      }
      return
    }

    const stored = sessionStorage.getItem(BRIEF_STORAGE_KEY)
    if (stored) {
      try {
        const brief = JSON.parse(stored) as EventBrief
        if (brief.eventId === eventIdFromUrl) {
          setState((s) => ({
            ...s,
            brief,
            filters: {
              ...s.filters,
              service: brief.selectedVendorServices || []
            }
          }))
          return
        }
      } catch (e) {
        console.error('Failed to parse event brief from session storage', e)
      }
    }

    let cancelled = false
    async function fetchBrief() {
      try {
        const backendBrief = await eventBriefService.getById(eventIdFromUrl!)
        if (cancelled) return

        const brief: EventBrief = {
          eventId: backendBrief.id,
          eventType: normalizeEventType(backendBrief.eventType),
          eventName: backendBrief.eventName,
          location: backendBrief.location,
          eventDate: backendBrief.eventDate,
          startTime: backendBrief.startTime || '',
          endTime: backendBrief.endTime || '',
          guestCount: backendBrief.guestCount,
          budget: backendBrief.budget,
          selectedTheme: backendBrief.selectedTheme || '',
          setupStyle: normalizeSetupMode(backendBrief.setupStyle),
          selectedVendorServices: backendBrief.selectedVendorServices || [],
          indoorOutdoorType: normalizeSetupMode(backendBrief.setupStyle),
          specialRequirements: backendBrief.specialRequirements || '',
          preferredPackageTier: 'premium',
        }

        sessionStorage.setItem(BRIEF_STORAGE_KEY, JSON.stringify(brief))
        setState((s) => ({
          ...s,
          brief,
          filters: {
            ...s.filters,
            service: brief.selectedVendorServices || []
          }
        }))
      } catch (err) {
        console.error('Failed to fetch event brief from backend', err)
      }
    }

    fetchBrief()
    return () => { cancelled = true }
  }, [eventIdFromUrl, storedBrief])

  const setBrief = useCallback((brief: EventBrief) => {
    sessionStorage.setItem(BRIEF_STORAGE_KEY, JSON.stringify(brief))
    setState((s) => ({
      ...s,
      brief,
      filters: {
        ...DEFAULT_VENDOR_FILTERS,
        service: brief.selectedVendorServices || []
      },
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
      f.ratingMin !== null ||
      f.matchLevel !== null
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
        selectedServiceIds:
          s.requestForm.vendorId === vendor.id && s.requestForm.selectedServiceIds.length > 0
            ? s.requestForm.selectedServiceIds
            : getDefaultSelectedServiceIds(vendor, s.brief),
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

  const closeRequestSuccessModal = useCallback(() => {
    setState((s) => ({ ...s, showRequestSuccessModal: false, requestSuccessVendorName: '' }))
  }, [])

  const goToVendorTracker = useCallback(() => {
    setState((s) => ({ ...s, showRequestSuccessModal: false, requestSuccessVendorName: '' }))
    navigate('/organizer/vendor-status', { replace: true })
  }, [navigate])

  const setGeneralInquiryMessage = useCallback((msg: string) => {
    setState((s) => ({ ...s, generalInquiryMessage: msg }))
  }, [])

  const toggleGeneralInquiry = useCallback(() => {
    setState((s) => ({ ...s, showGeneralInquiry: !s.showGeneralInquiry, generalInquiryMessage: '' }))
  }, [])

  const submitRequest = useCallback(async () => {
    const req = state.requestForm
    if (!req.vendorId || !state.brief) return

    const requestedBudget = req.requestedBudget ? Number(req.requestedBudget) : null
    const selectedServiceIds = req.selectedServiceIds.length > 0
      ? req.selectedServiceIds
      : state.selectedVendor?.services[0]
        ? [state.selectedVendor.services[0].id]
        : []

    setState((s) => ({ ...s, submitting: true, error: null }))

    try {
      const createdRequest = await vendorRequestService.sendBookingRequest({
        eventBriefId: state.brief.eventId,
        vendorId: req.vendorId,
        vendorServiceIds: selectedServiceIds,
        packageName: state.selectedTimeSlot || req.serviceCategory || undefined,
        selectedDate: state.selectedDate || undefined,
        selectedTimeSlot: state.selectedTimeSlot || undefined,
        budgetMin: requestedBudget,
        budgetMax: requestedBudget,
        message: req.notes,
      })

      sessionStorage.setItem(LAST_VENDOR_REQUEST_KEY, JSON.stringify({
        requestId: createdRequest.id,
        vendorName: req.vendorName,
        eventName: state.brief.eventName,
      }))

      await loadMarketplace()
      setState((s) => ({
        ...s,
        showRequestModal: false,
        selectedVendor: null,
        selectedDate: null,
        selectedTimeSlot: null,
        showRequestSuccessModal: true,
        requestSuccessVendorName: req.vendorName,
        submitting: false,
      }))
      navigate(`/organizer/vendor-status?tab=pending&requestId=${createdRequest.id}`, { replace: true })
    } catch (err) {
      setState((s) => ({
        ...s,
        submitting: false,
        error: err instanceof Error ? err.message : 'Failed to send booking request.',
      }))
    }
  }, [navigate, state.requestForm, state.brief, state.selectedDate, state.selectedTimeSlot, state.selectedVendor, loadMarketplace])

  const sendGeneralInquiry = useCallback(async () => {
    const vendor = state.selectedVendor
    if (!vendor) return

    setState((s) => ({ ...s, submitting: true, error: null }))

    try {
      await vendorRequestService.sendGeneralInquiry({
        vendorId: vendor.id,
        message: state.generalInquiryMessage || 'General inquiry',
      })
    } catch (err) {
      setState((s) => ({
        ...s,
        submitting: false,
        error: err instanceof Error ? err.message : 'Failed to send inquiry.',
      }))
      return
    }

    setState((s) => ({
      ...s,
      showSelectBriefModal: false,
      showGeneralInquiry: false,
      generalInquiryMessage: '',
      submitting: false,
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

    requestForm: state.requestForm,
    selectedDate: state.selectedDate,
    selectedTimeSlot: state.selectedTimeSlot,
    showSelectBriefModal: state.showSelectBriefModal,
    showRequestSuccessModal: state.showRequestSuccessModal,
    requestSuccessVendorName: state.requestSuccessVendorName,
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
    selectDate,
    selectTimeSlot,
    getSelectedDateSlots,
    updateRequestForm,
    submitRequest,
    getRequestStatus,
    openSelectBriefModal,
    closeSelectBriefModal,
    closeRequestSuccessModal,
    goToVendorTracker,
    setGeneralInquiryMessage,
    toggleGeneralInquiry,
    sendGeneralInquiry,
    handleSendRequest,
    refresh: loadMarketplace,
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
