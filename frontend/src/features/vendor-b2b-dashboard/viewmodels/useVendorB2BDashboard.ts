import { useState, useCallback, useRef, useEffect } from 'react'
import { bookingService, type BookingRequest } from '../../../services/bookingService'
import { contractService, type ContractDetail } from '../../../services/contractService'
import { auditService, type AuditActivity } from '../../../services/auditService'
import { availabilityService, type AvailabilityStatus, type VendorAvailabilityPreview } from '../../../services/availabilityService'
import { communicationService, type BookingMessage } from '../../../services/communicationService'
import { vendorService, type VendorService } from '../../../services/vendorService'
import type { VendorB2BBookingStatus, RequestType } from '../models/vendor-b2b-dashboard.model'
import { buildViewModelStateMeta } from '../../../shared/types/viewModelState'
import { useAuthSession } from '../../auth/viewmodels/useAuthSession'
import { useToast } from '../../../shared/components/ToastContext'

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
  const { addToast } = useToast()
  const submittingRef = useRef(false)
  const loadInFlightRef = useRef<Promise<void> | null>(null)
  const [state, setState] = useState<VendorB2BDashboardState>({
    bookings: [],
    services: [],
    selectedBooking: null,
    activeTab: 'all',
    activeTypeTab: 'all',
    loading: true,
    submitting: false,
    error: null,
    contract: null,
    contractLoading: false,
    auditActivities: [],
    availability: null,
    bookingMessages: []
  })

  const loadBookings = useCallback(async (status?: string, type?: string) => {
    if (!user) return
    if (!user.hasVendorProfile && !user.vendorProfile) {
      setState((s) => ({ ...s, error: 'VENDOR_NOT_FOUND' }))
      return
    }
    if (loadInFlightRef.current) return loadInFlightRef.current
    setState((s) => ({ ...s, loading: true, error: null }))
    loadInFlightRef.current = (async () => {
      try {
      const [bookings, availability, services] = await Promise.all([
        bookingService.listVendorB2BBookings(status, type),
        availabilityService.getMyAvailability().catch((err) => {
          addToast('error', `Availability load failed: ${(err as Error).message}`)
          return null
        }),
        vendorService.listServices().catch((err) => {
          addToast('error', `Services load failed: ${(err as Error).message}`)
          return []
        })
      ])
      setState((s) => ({ ...s, bookings, availability, services, loading: false }))
      } catch (err) {
        setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
      } finally {
        loadInFlightRef.current = null
      }
    })()
    return loadInFlightRef.current
  }, [user])

  useEffect(() => {
    void loadBookings()
  }, [loadBookings])

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
      const selected = state.bookings.find((booking) => booking.id === bookingId)
      if (selected?.status === 'pending' || selected?.status === 'sent') {
        await bookingService.viewVendorRequest(bookingId)
        addToast('info', 'Request marked as viewed')
      }

      const isProcurementRequest = selected?.request_vendors != null
      const messagesPromise = isProcurementRequest
        ? communicationService.listVendorRequestMessages(bookingId)
        : communicationService.listBookingMessages(bookingId)

      const [booking, auditActivities, bookingMessages] = await Promise.all([
        bookingService.getVendorBookingDetail(bookingId),
        auditService.listActivities(`booking:${bookingId}`),
        messagesPromise
      ])

      const statusFilter = state.activeTab === 'all' ? undefined : state.activeTab
      const typeFilter = state.activeTypeTab === 'all' ? undefined : state.activeTypeTab
      const bookings = await bookingService.listVendorB2BBookings(statusFilter, typeFilter)

      setState((s) => ({ ...s, bookings, selectedBooking: booking, auditActivities, bookingMessages, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [state.bookings, state.activeTab, state.activeTypeTab])

  const updateStatus = useCallback(async (
    bookingId: string,
    status: 'accepted' | 'rejected' | 'changes_requested',
    reason?: string
  ) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      if (status === 'accepted') {
        await bookingService.acceptVendorRequest(bookingId)
      } else if (status === 'rejected') {
        await bookingService.rejectVendorRequest(bookingId)
      } else if (status === 'changes_requested') {
        await bookingService.requestChangesVendorRequest(bookingId, reason || 'Requested changes')
      }
      const statusFilter = state.activeTab === 'all' ? undefined : state.activeTab
      const typeFilter = state.activeTypeTab === 'all' ? undefined : state.activeTypeTab
      const bookings = await bookingService.listVendorB2BBookings(statusFilter, typeFilter)
      setState((s) => ({ ...s, bookings, selectedBooking: null, submitting: false }))
      addToast(
        'success',
        status === 'accepted'
          ? 'Request accepted successfully'
          : status === 'rejected'
            ? 'Request declined successfully'
            : 'Negotiation request sent successfully'
      )
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    } finally {
      submittingRef.current = false
    }
  }, [addToast, state.activeTab, state.activeTypeTab])

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

  const createServicePackage = useCallback(async (data: { category: string; serviceName: string; description: string; basePrice: number; availabilityStatus: string; capacity?: number; serviceAddress?: string }, imageFile?: File) => {
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
        availabilityStatus: data.availabilityStatus,
        capacity: data.capacity,
        serviceAddress: data.serviceAddress
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

  const sendBookingMessage = useCallback(async (body: string) => {
    const booking = state.selectedBooking
    const bookingId = booking?.id
    if (!bookingId) return
    try {
      const message = booking?.request_vendors
        ? await communicationService.createVendorRequestMessage(bookingId, body)
        : await communicationService.createBookingMessage(bookingId, body)
      setState((s) => ({ ...s, bookingMessages: [...s.bookingMessages, message] }))
    } catch (err) {
      setState((s) => ({ ...s, error: (err as Error).message }))
    }
  }, [state.selectedBooking])

  return {
    ...state,
    userRole: user?.role || null,
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
    clearError,
    sendBookingMessage
  }
}
