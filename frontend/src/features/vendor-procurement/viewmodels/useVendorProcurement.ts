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
  draftSaved: boolean
  validationErrors: string[]
}

const DRAFT_KEY_PREFIX = 'procurement_draft_'

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
    error: null,
    draftSaved: false,
    validationErrors: []
  })

  const getDraftKey = useCallback(() => {
    return state.eventId ? `${DRAFT_KEY_PREFIX}${state.eventId}` : null
  }, [state.eventId])

  const saveDraft = useCallback(() => {
    const key = getDraftKey()
    if (!key) return
    const draft = {
      currentStep: state.currentStep,
      selectedRequirementId: state.selectedRequirement?.id || null,
      selectedVendorId: state.selectedVendor?.id || null,
      filters: state.filters
    }
    sessionStorage.setItem(key, JSON.stringify(draft))
    setState((s) => ({ ...s, draftSaved: true }))
    setTimeout(() => {
      setState((s) => ({ ...s, draftSaved: false }))
    }, 3000)
  }, [getDraftKey, state.currentStep, state.selectedRequirement, state.selectedVendor, state.filters])

  const loadDraft = useCallback(async () => {
    const key = getDraftKey()
    if (!key) return
    try {
      const raw = sessionStorage.getItem(key)
      if (!raw) return
      const draft = JSON.parse(raw)
      setState((s) => ({
        ...s,
        currentStep: draft.currentStep || 'requirements',
        filters: draft.filters || DEFAULT_VENDOR_FILTERS
      }))
    } catch {}
  }, [getDraftKey])

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
    setState((s) => ({ ...s, currentStep: step, validationErrors: [] }))
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
        location: state.filters.location || undefined,
        businessName: state.filters.businessName || undefined,
        availability: state.filters.availability || undefined,
        sortBy: state.filters.sortBy || undefined,
        sortOrder: state.filters.sortBy === 'name' ? 'asc' : 'desc'
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

  const validateStep = useCallback((): string[] => {
    const errors: string[] = []
    if (state.currentStep === 'vendors' && !state.selectedRequirement) {
      errors.push('Please select a requirement first.')
    }
    if (state.currentStep === 'booking') {
      if (!state.selectedRequirement) errors.push('No requirement selected.')
      if (!state.selectedVendor) errors.push('No vendor selected.')
    }
    return errors
  }, [state.currentStep, state.selectedRequirement, state.selectedVendor])

  const submitBookingRequest = useCallback(async (payload: {
    notes?: string
    requestedBudget?: number
  }) => {
    const errors = validateStep()
    if (errors.length > 0) {
      setState((s) => ({ ...s, validationErrors: errors }))
      return
    }
    if (!state.eventId || !state.selectedRequirement || !state.selectedVendor) {
      setState((s) => ({ ...s, error: 'Cannot submit booking: missing event, requirement, or vendor' }))
      return
    }
    setState((s) => ({ ...s, submitting: true, error: null, validationErrors: [] }))
    try {
      await bookingService.createBookingRequest({
        eventId: state.eventId,
        requirementId: state.selectedRequirement.id,
        vendorId: state.selectedVendor.id,
        notes: payload.notes,
        requestedBudget: payload.requestedBudget
      })
      const key = getDraftKey()
      if (key) sessionStorage.removeItem(key)
      setState((s) => ({ ...s, submitting: false, currentStep: 'confirm' }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [state.eventId, state.selectedRequirement, state.selectedVendor, validateStep, getDraftKey])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null, validationErrors: [] }))
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
    saveDraft,
    loadDraft,
    clearError
  }
}
