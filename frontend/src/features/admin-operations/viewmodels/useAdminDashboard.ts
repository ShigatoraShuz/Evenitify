import { useState, useCallback } from 'react'
import { adminService } from '../../../services/adminService'
import type {
  AdminDashboardSummary,
  AdminUser,
  AdminEvent,
  AdminBooking,
  AdminVendor
} from '../models/admin-operations.model'
import { DEFAULT_DASHBOARD_SUMMARY } from '../models/admin-operations.model'

interface AdminDashboardState {
  summary: AdminDashboardSummary
  users: AdminUser[]
  events: AdminEvent[]
  bookings: AdminBooking[]
  vendors: AdminVendor[]
  loading: boolean
  submitting: boolean
  error: string | null
  activeSection: 'summary' | 'users' | 'events' | 'bookings' | 'vendors'
  selectedVendor: AdminVendor | null
  selectedBooking: AdminBooking | null
}

export function useAdminDashboard() {
  const [state, setState] = useState<AdminDashboardState>({
    summary: DEFAULT_DASHBOARD_SUMMARY,
    users: [],
    events: [],
    bookings: [],
    vendors: [],
    loading: false,
    submitting: false,
    error: null,
    activeSection: 'summary',
    selectedVendor: null,
    selectedBooking: null
  })

  const loadSummary = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const summary = await adminService.getDashboardSummary()
      setState((s) => ({ ...s, summary, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  const loadUsers = useCallback(async (params?: { role?: string; search?: string }) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const users = await adminService.getUsers(params)
      setState((s) => ({ ...s, users, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  const loadEvents = useCallback(async (params?: { status?: string; search?: string }) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const events = await adminService.getEvents(params)
      setState((s) => ({ ...s, events, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  const loadBookings = useCallback(async (params?: { status?: string; search?: string }) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const bookings = await adminService.getBookings(params)
      setState((s) => ({ ...s, bookings, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  const loadVendors = useCallback(async (params?: { status?: string; search?: string }) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const vendors = await adminService.getVendors(params)
      setState((s) => ({ ...s, vendors, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  const setActiveSection = useCallback((section: AdminDashboardState['activeSection']) => {
    setState((s) => ({ ...s, activeSection: section, error: null }))
  }, [])

  const selectVendor = useCallback((vendor: AdminVendor | null) => {
    setState((s) => ({ ...s, selectedVendor: vendor }))
  }, [])

  const selectBooking = useCallback((booking: AdminBooking | null) => {
    setState((s) => ({ ...s, selectedBooking: booking }))
  }, [])

  const updateVendorVerification = useCallback(async (
    vendorId: string,
    verificationStatus: string,
    reason?: string
  ) => {
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await adminService.updateVendorVerification(vendorId, { verificationStatus, reason })
      const vendors = await adminService.getVendors()
      setState((s) => ({ ...s, vendors, submitting: false, selectedVendor: null }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [])

  const overrideBookingStatus = useCallback(async (
    bookingId: string,
    status: string,
    reason: string
  ) => {
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await adminService.overrideBookingStatus(bookingId, { status, reason })
      const bookings = await adminService.getBookings()
      setState((s) => ({ ...s, bookings, submitting: false, selectedBooking: null }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    ...state,
    loadSummary,
    loadUsers,
    loadEvents,
    loadBookings,
    loadVendors,
    setActiveSection,
    selectVendor,
    selectBooking,
    updateVendorVerification,
    overrideBookingStatus,
    clearError
  }
}
