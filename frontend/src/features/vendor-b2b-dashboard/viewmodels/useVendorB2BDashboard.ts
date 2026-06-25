import { useState, useCallback, useRef } from 'react'
import { bookingService, type BookingRequest } from '../../../services/bookingService'
import { contractService, type ContractDetail } from '../../../services/contractService'
import { auditService, type AuditActivity } from '../../../services/auditService'
import { availabilityService, type AvailabilityStatus, type VendorAvailabilityPreview } from '../../../services/availabilityService'
import { communicationService, type BookingMessage } from '../../../services/communicationService'
import { vendorService, type VendorService } from '../../../services/vendorService'
import type { VendorB2BBookingStatus, RequestType } from '../models/vendor-b2b-dashboard.model'
import { buildViewModelStateMeta } from '../../../shared/types/viewModelState'
import { useAuthSession } from '../../auth/viewmodels/useAuthSession'

interface VendorB2BDashboardState {
  bookings: BookingRequest[]
  services: VendorService[]
  selectedBooking: BookingRequest | null
  activeTab: VendorB2BBookingStatus | 'all'
  activeTypeTab: RequestType
  loading: boolean
  submitting: boolean
  error: string | null
  contract: ContractDetail | null
  contractLoading: boolean
  auditActivities: AuditActivity[]
  availability: VendorAvailabilityPreview | null
  bookingMessages: BookingMessage[]
}

export function useVendorB2BDashboard() {
  const { user } = useAuthSession()
  const submittingRef = useRef(false)
  const [state, setState] = useState<VendorB2BDashboardState>({
    bookings: [],
    services: [],
    selectedBooking: null,
    activeTab: 'all',
    activeTypeTab: 'all',
    loading: false,
    submitting: false,
    error: null,
    contract: null,
    contractLoading: false,
    auditActivities: [],
    availability: null,
    bookingMessages: []
  })

  const loadBookings = useCallback(async (status?: string, type?: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    if (user && !user.hasVendorProfile && !user.vendorProfile) {
      setState((s) => ({ ...s, loading: false, error: 'VENDOR_NOT_FOUND' }))
      return
    }
    try {
      const [bookings, availability, services] = await Promise.all([
        bookingService.listVendorB2BBookings(status, type),
        availabilityService.getMyAvailability(),
        vendorService.listServices()
      ])
      setState((s) => ({ ...s, bookings, availability, services, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [user])

  const setTab = useCallback((tab: VendorB2BBookingStatus | 'all') => {
    setState((s) => ({ ...s, activeTab: tab, selectedBooking: null, bookingMessages: [] }))
    const statusFilter = tab === 'all' ? undefined : tab
    loadBookings(statusFilter, state.activeTypeTab === 'all' ? undefined : state.activeTypeTab)
  }, [loadBookings, state.activeTypeTab])

  const setTypeTab = useCallback((tab: RequestType) => {
    setState((s) => ({ ...s, activeTypeTab: tab, selectedBooking: null, bookingMessages: [] }))
    const typeFilter = tab === 'all' ? undefined : tab
    loadBookings(state.activeTab === 'all' ? undefined : state.activeTab, typeFilter)
  }, [loadBookings, state.activeTab])

  const selectBooking = useCallback(async (bookingId: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const [booking, auditActivities, bookingMessages] = await Promise.all([
        bookingService.getVendorBookingDetail(bookingId),
        auditService.listActivities(`vendor-booking:${bookingId}`),
        communicationService.listBookingMessages(bookingId)
      ])
      setState((s) => ({ ...s, selectedBooking: booking, auditActivities, bookingMessages, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  const updateStatus = useCallback(async (
    bookingId: string,
    status: 'accepted' | 'rejected' | 'changes_requested',
    reason?: string
  ) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await bookingService.updateBookingStatus(bookingId, { status, reason })
      const statusFilter = state.activeTab === 'all' ? undefined : state.activeTab
      const typeFilter = state.activeTypeTab === 'all' ? undefined : state.activeTypeTab
      const bookings = await bookingService.listVendorB2BBookings(statusFilter, typeFilter)
      setState((s) => ({ ...s, bookings, selectedBooking: null, submitting: false }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    } finally {
      submittingRef.current = false
    }
  }, [state.activeTab, state.activeTypeTab])

  const submitQuote = useCallback(async (bookingId: string, payload: {
    price: number
    notes?: string | null
    validUntil?: string | null
  }) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await bookingService.submitQuote(bookingId, payload)
      const statusFilter = state.activeTab === 'all' ? undefined : state.activeTab
      const typeFilter = state.activeTypeTab === 'all' ? undefined : state.activeTypeTab
      const bookings = await bookingService.listVendorB2BBookings(statusFilter, typeFilter)
      setState((s) => ({ ...s, bookings, submitting: false }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    } finally {
      submittingRef.current = false
    }
  }, [state.activeTab, state.activeTypeTab])

  const loadContract = useCallback(async (bookingId: string) => {
    setState((s) => ({ ...s, contractLoading: true, error: null }))
    try {
      const contract = await contractService.getContractByBooking(bookingId)
      setState((s) => ({ ...s, contract, contractLoading: false }))
    } catch (err) {
      setState((s) => ({ ...s, contractLoading: false, error: (err as Error).message }))
    }
  }, [])

  const signVendorContract = useCallback(async (contractId: string) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      const updated = await contractService.signContractVendor(contractId, { termsAccepted: true })
      setState((s) => ({ ...s, submitting: false, contract: updated }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    } finally {
      submittingRef.current = false
    }
  }, [])

  const updateAvailabilityStatus = useCallback(async (status: AvailabilityStatus) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      const availability = await availabilityService.updateMyAvailabilityStatus(status)
      setState((s) => ({ ...s, availability, submitting: false }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    } finally {
      submittingRef.current = false
    }
  }, [])

  const createServicePackage = useCallback(async (data: { category: string; serviceName: string; description: string; basePrice: number; availabilityStatus: string }, imageFile?: File) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      let finalDescription = data.description

      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        const { imageUrl } = await vendorService.uploadServiceImage(formData)
        finalDescription = JSON.stringify({
          text: data.description,
          image: imageUrl
        })
      } else {
        finalDescription = JSON.stringify({ text: data.description })
      }

      await vendorService.createService({
        category: data.category,
        serviceName: data.serviceName,
        description: finalDescription,
        basePrice: data.basePrice,
        availabilityStatus: data.availabilityStatus
      })

      const services = await vendorService.listServices()
      setState((s) => ({ ...s, services, submitting: false }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: null })) // Don't set global error – form handles it
      throw err // Re-throw so the form can show its own error message
    } finally {
      submittingRef.current = false
    }
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    ...state,
    ...buildViewModelStateMeta({
      loading: state.loading,
      submitting: state.submitting,
      refreshing: state.contractLoading,
      error: state.error,
      empty: !state.loading && state.bookings.length === 0,
      loaded: !state.loading
    }),
    loadBookings,
    setTab,
    setTypeTab,
    selectBooking,
    updateStatus,
    submitQuote,
    loadContract,
    signVendorContract,
    updateAvailabilityStatus,
    createServicePackage,
    clearError
  }
}
