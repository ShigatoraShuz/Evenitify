import { useState, useCallback, useRef } from 'react'
import { bookingService, type BookingRequest } from '../../../services/bookingService'
import { contractService, type ContractDetail } from '../../../services/contractService'
import type { VendorB2BBookingStatus } from '../models/vendor-b2b-dashboard.model'

interface VendorB2BDashboardState {
  bookings: BookingRequest[]
  selectedBooking: BookingRequest | null
  activeTab: VendorB2BBookingStatus | 'all'
  loading: boolean
  submitting: boolean
  error: string | null
  contract: ContractDetail | null
  contractLoading: boolean
}

export function useVendorB2BDashboard() {
  const submittingRef = useRef(false)
  const [state, setState] = useState<VendorB2BDashboardState>({
    bookings: [],
    selectedBooking: null,
    activeTab: 'all',
    loading: false,
    submitting: false,
    error: null,
    contract: null,
    contractLoading: false
  })

  const loadBookings = useCallback(async (status?: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const bookings = await bookingService.listVendorB2BBookings(status)
      setState((s) => ({ ...s, bookings, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  const setTab = useCallback((tab: VendorB2BBookingStatus | 'all') => {
    setState((s) => ({ ...s, activeTab: tab, selectedBooking: null }))
    const statusFilter = tab === 'all' ? undefined : tab
    loadBookings(statusFilter)
  }, [loadBookings])

  const selectBooking = useCallback(async (bookingId: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const booking = await bookingService.getVendorBookingDetail(bookingId)
      setState((s) => ({ ...s, selectedBooking: booking, loading: false }))
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
      const bookings = await bookingService.listVendorB2BBookings(statusFilter)
      setState((s) => ({ ...s, bookings, selectedBooking: null, submitting: false }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    } finally {
      submittingRef.current = false
    }
  }, [state.activeTab])

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

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    ...state,
    loadBookings,
    setTab,
    selectBooking,
    updateStatus,
    loadContract,
    signVendorContract,
    clearError
  }
}
