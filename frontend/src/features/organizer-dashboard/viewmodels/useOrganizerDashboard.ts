import { useMemo } from 'react'
import { buildViewModelStateMeta } from '../../../shared/types/viewModelState'
import {
  MOCK_EVENT_PREVIEWS,
  MOCK_DRAFTS,
  MOCK_VENDOR_REQUESTS,
  MOCK_BOOKINGS,
  MOCK_RECOMMENDED_VENDORS,
  MOCK_ACTIVITIES,
  MOCK_NOTIFICATIONS,
  type DashboardEventPreview,
  type DashboardDraft,
  type DashboardVendorRequest,
  type DashboardBooking,
  type RecommendedVendorPreview,
  type DashboardActivity,
  type DashboardNotification,
} from '../models/organizer-dashboard.model'

const REQUESTS_STORAGE_KEY = 'eventify:vendor-requests'

export function useOrganizerDashboard() {
  const allVendorRequests = useMemo(() => {
    const stored = sessionStorage.getItem(REQUESTS_STORAGE_KEY)
    const persisted: DashboardVendorRequest[] = stored ? JSON.parse(stored) : []
    return [...MOCK_VENDOR_REQUESTS, ...persisted]
  }, [])

  const summaryStats = useMemo(() => {
    const totalEvents = MOCK_EVENT_PREVIEWS.length
    const draftEvents = MOCK_DRAFTS.length
    const activeVendorRequests = allVendorRequests.length
    const pendingResponses = allVendorRequests.filter(
      (r) => r.status === 'sent' || r.status === 'pending' || r.status === 'viewed' || r.status === 'quoted' || r.status === 'negotiating'
    ).length
    const acceptedBookings = MOCK_BOOKINGS.filter((b) => b.status === 'accepted' || b.status === 'confirmed').length
    const confirmedBookings = MOCK_BOOKINGS.filter((b) => b.status === 'confirmed').length

    return {
      totalEvents,
      draftEvents,
      activeVendorRequests,
      pendingResponses,
      acceptedBookings,
      confirmedBookings,
    }
  }, [allVendorRequests])

  const vendorRequestCounts = useMemo(() => {
    const all = allVendorRequests
    return {
      sent: all.filter((r) => r.status === 'sent').length,
      pending: all.filter((r) => ['pending', 'viewed', 'quoted', 'negotiating'].includes(r.status)).length,
      accepted: all.filter((r) => r.status === 'accepted').length,
      rejected: all.filter((r) => r.status === 'rejected').length,
      confirmed: all.filter((r) => r.status === 'confirmed').length,
      contract_pending: all.filter((r) => r.status === 'contract_pending').length,
    }
  }, [allVendorRequests])

  const events = MOCK_EVENT_PREVIEWS
  const drafts = MOCK_DRAFTS
  const vendorRequests = allVendorRequests
  const bookings = MOCK_BOOKINGS
  const recommendedVendors = MOCK_RECOMMENDED_VENDORS
  const activities = MOCK_ACTIVITIES
  const notifications = MOCK_NOTIFICATIONS

  const meta = buildViewModelStateMeta({
    loading: false,
    submitting: false,
    error: null,
    empty: events.length === 0 && drafts.length === 0,
    loaded: true,
  })

  return {
    events,
    drafts,
    vendorRequests,
    bookings,
    recommendedVendors,
    activities,
    notifications,
    summaryStats,
    vendorRequestCounts,
    ...meta,
  }
}
