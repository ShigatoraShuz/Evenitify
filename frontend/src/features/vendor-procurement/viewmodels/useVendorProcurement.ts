import { useState, useCallback } from 'react'
import { vendorService, type VendorSearchResult } from '../../../services/vendorService'
import { bookingService } from '../../../services/bookingService'
import { eventService, type EventRequirement } from '../../../services/eventService'
import type {
  RequirementCategory,
  VendorFilterState,
  ProcurementStep
} from '../models/vendor-procurement.model'
import { DEFAULT_VENDOR_FILTERS } from '../models/vendor-procurement.model'

interface VendorProcurementState {
  eventId: string | null
  requirements: EventRequirement[]
  vendors: VendorSearchResult[]
  filters: VendorFilterState
  selectedRequirement: EventRequirement | null
  selectedVendor: VendorSearchResult | null
  currentStep: ProcurementStep
  loading: boolean
  submitting: boolean
  error: string | null
}

export function useVendorProcurement() {
  const [state, setState] = useState<VendorProcurementState>({
    eventId: null,
    requirements: [],
    vendors: [],
    filters: DEFAULT_VENDOR_FILTERS,
    selectedRequirement: null,
    selectedVendor: null,
    currentStep: 'requirements',
    loading: false,
    submitting: false,
    error: null
  })

  const initEvent = useCallback(async (eventId: string) => {
    setState((s) => ({ ...s, eventId, loading: true, error: null }))
    try {
      const requirements = await vendorService.listRequirements(eventId)
      setState((s) => ({ ...s, eventId, requirements, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  const setStep = useCallback((step: ProcurementStep) => {
    setState((s) => ({ ...s, currentStep: step }))
  }, [])

  const selectRequirement = useCallback((req: EventRequirement) => {
    setState((s) => ({ ...s, selectedRequirement: req, currentStep: 'vendors' }))
  }, [])

  const updateFilters = useCallback((next: Partial<VendorFilterState>) => {
    setState((s) => ({ ...s, filters: { ...s.filters, ...next } }))
  }, [])

  const searchVendors = useCallback(async () => {
    if (!state.selectedRequirement) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const vendors = await vendorService.searchVendors({
        category: state.selectedRequirement.category,
        minBudget: state.filters.minBudget || undefined,
        maxBudget: state.filters.maxBudget || undefined,
        minRating: state.filters.minRating || undefined,
        location: state.filters.location || undefined
      })
      setState((s) => ({ ...s, vendors, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [state.selectedRequirement, state.filters])

  const selectVendor = useCallback((vendor: VendorSearchResult) => {
    setState((s) => ({ ...s, selectedVendor: vendor, currentStep: 'booking' }))
  }, [])

  const createRequirement = useCallback(async (payload: {
    category: RequirementCategory
    quantity: number
    minBudget?: number | null
    maxBudget?: number | null
    notes?: string | null
  }) => {
    if (!state.eventId) return
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await vendorService.createRequirement(state.eventId, payload)
      const requirements = await vendorService.listRequirements(state.eventId)
      setState((s) => ({ ...s, requirements, submitting: false }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [state.eventId])

  const deleteRequirement = useCallback(async (requirementId: string) => {
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await vendorService.deleteRequirement(requirementId)
      if (state.eventId) {
        const requirements = await vendorService.listRequirements(state.eventId)
        setState((s) => ({ ...s, requirements, submitting: false }))
      }
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [state.eventId])

  const submitBookingRequest = useCallback(async (payload: {
    notes?: string
    requestedBudget?: number
  }) => {
    if (!state.eventId || !state.selectedRequirement || !state.selectedVendor) {
      setState((s) => ({ ...s, error: 'Cannot submit booking: missing event, requirement, or vendor' }))
      return
    }
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await bookingService.createBookingRequest({
        eventId: state.eventId,
        requirementId: state.selectedRequirement.id,
        vendorId: state.selectedVendor.id,
        notes: payload.notes,
        requestedBudget: payload.requestedBudget
      })
      setState((s) => ({ ...s, submitting: false, currentStep: 'confirm' }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [state.eventId, state.selectedRequirement, state.selectedVendor])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    ...state,
    initEvent,
    setStep,
    selectRequirement,
    updateFilters,
    searchVendors,
    selectVendor,
    createRequirement,
    deleteRequirement,
    submitBookingRequest,
    clearError
  }
}
