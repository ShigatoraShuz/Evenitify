import { useState, useCallback } from 'react'
import { bookingService, type BookingRequest } from '../../../services/bookingService'
import type { VendorB2BBookingStatus } from '../models/vendor-b2b-dashboard.model'

interface VendorB2BDashboardState {
  bookings: BookingRequest[]
  selectedBooking: BookingRequest | null
  activeTab: VendorB2BBookingStatus | 'all'
  loading: boolean
  submitting: boolean
  error: string | null
}

export function useVendorB2BDashboard() {
  const [state, setState] = useState<VendorB2BDashboardState>({
    bookings: [],
    selectedBooking: null,
    activeTab: 'all',
    loading: false,
    submitting: false,
    error: null
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
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await bookingService.updateBookingStatus(bookingId, { status, reason })
      const statusFilter = state.activeTab === 'all' ? undefined : state.activeTab
      const bookings = await bookingService.listVendorB2BBookings(statusFilter)
      setState((s) => ({ ...s, bookings, selectedBooking: null, submitting: false }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [state.activeTab])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    ...state,
    loadBookings,
    setTab,
    selectBooking,
    updateStatus,
    clearError
  }
}
