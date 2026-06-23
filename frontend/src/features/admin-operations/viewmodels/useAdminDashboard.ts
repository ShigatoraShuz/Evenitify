import { useState, useCallback, useMemo, useRef } from 'react'
import { adminService } from '../../../services/adminService'
import { auditService, type AuditActivity } from '../../../services/auditService'
import type { OperationQueueItem } from '../../../shared/components/OperationsPanels'
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
  activeSection: string
  selectedVendor: AdminVendor | null
  selectedBooking: AdminBooking | null
  auditActivities: AuditActivity[]
}

export function useAdminDashboard() {
  const submittingRef = useRef(false)
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
    selectedBooking: null,
    auditActivities: []
  })

  const loadSummary = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const [summary, auditActivities] = await Promise.all([
        adminService.getDashboardSummary(),
        auditService.listActivities('admin:operations')
      ])
      setState((s) => ({ ...s, summary, auditActivities, loading: false }))
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
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await adminService.updateVendorVerification(vendorId, { verificationStatus, reason })
      const vendors = await adminService.getVendors()
      setState((s) => ({ ...s, vendors, submitting: false, selectedVendor: null }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    } finally {
      submittingRef.current = false
    }
  }, [])

  const overrideBookingStatus = useCallback(async (
    bookingId: string,
    status: string,
    reason: string
  ) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await adminService.overrideBookingStatus(bookingId, { status, reason })
      const bookings = await adminService.getBookings()
      setState((s) => ({ ...s, bookings, submitting: false, selectedBooking: null }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    } finally {
      submittingRef.current = false
    }
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  const actionQueue = useMemo<OperationQueueItem[]>(() => [
    ...state.vendors
      .filter((vendor) => vendor.verification_status === 'pending')
      .slice(0, 4)
      .map((vendor) => ({
        id: `vendor-${vendor.id}`,
        title: `Verify ${vendor.business_name}`,
        detail: vendor.service_area || 'No service area provided',
        status: vendor.verification_status,
        priority: 'high' as const
      })),
    ...state.bookings
      .filter((booking) => ['pending', 'changes_requested'].includes(booking.status))
      .slice(0, 4)
      .map((booking) => ({
        id: `booking-${booking.id}`,
        title: `Review ${booking.large_events?.title || 'booking'}`,
        detail: `${booking.vendor_profiles?.business_name || 'Vendor'} | ${booking.event_requirements?.category || 'Category'}`,
        status: booking.status,
        priority: booking.status === 'pending' ? 'medium' as const : 'low' as const
      }))
  ], [state.bookings, state.vendors])

  const riskFlags = useMemo<OperationQueueItem[]>(() => [
    ...state.bookings
      .filter((booking) => ['rejected', 'cancelled'].includes(booking.status))
      .slice(0, 3)
      .map((booking) => ({
        id: `risk-booking-${booking.id}`,
        title: `Booking ${booking.status}`,
        detail: `${booking.large_events?.title || 'Event'} needs operations review`,
        status: booking.status,
        priority: 'medium' as const
      })),
    ...state.vendors
      .filter((vendor) => vendor.verification_status === 'rejected')
      .slice(0, 3)
      .map((vendor) => ({
        id: `risk-vendor-${vendor.id}`,
        title: `Rejected vendor: ${vendor.business_name}`,
        detail: 'Verification decision may affect open procurement.',
        status: vendor.verification_status,
        priority: 'high' as const
      }))
  ], [state.bookings, state.vendors])

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
    clearError,
    actionQueue,
    riskFlags
  }
}
