import { useState, useCallback, useMemo, useEffect } from 'react'
import { buildViewModelStateMeta } from '../../../shared/types/viewModelState'
import { hasAuthToken } from '../../../services/apiClient'
import { organizerDashboardService } from '../../../services/organizerDashboardService'
import type {
  DashboardEventPreview as ModelEventPreview,
  DashboardDraft as ModelDraft,
  DashboardVendorRequest as ModelVendorRequest,
  DashboardBooking as ModelBooking,
  RecommendedVendorPreview as ModelRecommendedVendor,
  DashboardActivity as ModelActivity,
  DashboardNotification as ModelNotification,
} from '../models/organizer-dashboard.model'

interface DashboardViewModelState {
  events: ModelEventPreview[]
  drafts: ModelDraft[]
  vendorRequests: ModelVendorRequest[]
  bookings: ModelBooking[]
  recommendedVendors: ModelRecommendedVendor[]
  activities: ModelActivity[]
  notifications: ModelNotification[]
  loading: boolean
  error: string | null
}

export function useOrganizerDashboard() {
  const [state, setState] = useState<DashboardViewModelState>({
    events: [],
    drafts: [],
    vendorRequests: [],
    bookings: [],
    recommendedVendors: [],
    activities: [],
    notifications: [],
    loading: true,
    error: null,
  })

  const applyDashboardState = useCallback((payload: Awaited<ReturnType<typeof organizerDashboardService.getDashboardData>>) => {
    setState({
      events: payload.events as ModelEventPreview[],
      drafts: payload.drafts as ModelDraft[],
      vendorRequests: payload.vendorRequests as ModelVendorRequest[],
      bookings: payload.bookings as ModelBooking[],
      recommendedVendors: payload.recommendedVendors as ModelRecommendedVendor[],
      activities: payload.activities as ModelActivity[],
      notifications: payload.notifications as ModelNotification[],
      loading: false,
      error: null,
    })
  }, [])

  const loadDashboard = useCallback(async (cancelled?: () => boolean) => {
    if (!hasAuthToken()) {
      setState({
        events: [],
        drafts: [],
        vendorRequests: [],
        bookings: [],
        recommendedVendors: [],
        activities: [],
        notifications: [],
        loading: false,
        error: null,
      })
      return
    }
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const payload = await organizerDashboardService.getDashboardData()
      if (cancelled?.()) return
      applyDashboardState(payload)
    } catch (err) {
      if (cancelled?.()) return
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load dashboard data',
      }))
    }
  }, [applyDashboardState])

  useEffect(() => {
    let cancelled = false
    void loadDashboard(() => cancelled)
    return () => { cancelled = true }
  }, [loadDashboard])

  const summaryStats = useMemo(() => {
    const totalEvents = state.events.length
    const draftEvents = state.drafts.length
    const activeVendorRequests = state.vendorRequests.length
    const pendingResponses = state.vendorRequests.filter(
      (r) => r.status === 'sent' || r.status === 'pending' || r.status === 'viewed' || r.status === 'quoted' || r.status === 'negotiating'
    ).length
    const acceptedBookings = state.bookings.filter((b) => b.status === 'accepted' || b.status === 'confirmed').length
    const confirmedBookings = state.bookings.filter((b) => b.status === 'confirmed').length

    return {
      totalEvents,
      draftEvents,
      activeVendorRequests,
      pendingResponses,
      acceptedBookings,
      confirmedBookings,
    }
  }, [state.events, state.drafts, state.vendorRequests, state.bookings])

  const vendorRequestCounts = useMemo(() => {
    const all = state.vendorRequests
    return {
      sent: all.filter((r) => r.status === 'sent').length,
      pending: all.filter((r) => ['pending', 'viewed', 'quoted', 'negotiating'].includes(r.status)).length,
      accepted: all.filter((r) => r.status === 'accepted').length,
      rejected: all.filter((r) => r.status === 'rejected').length,
      confirmed: all.filter((r) => r.status === 'confirmed').length,
      contract_pending: all.filter((r) => r.status === 'contract_pending').length,
    }
  }, [state.vendorRequests])

  const refresh = useCallback(async () => {
    await loadDashboard()
  }, [loadDashboard])

  const meta = buildViewModelStateMeta({
    loading: state.loading,
    submitting: false,
    error: state.error,
    empty: state.events.length === 0 && state.drafts.length === 0,
    loaded: !state.loading,
  })

  return {
    events: state.events,
    drafts: state.drafts,
    vendorRequests: state.vendorRequests,
    bookings: state.bookings,
    recommendedVendors: state.recommendedVendors,
    activities: state.activities,
    notifications: state.notifications,
    summaryStats,
    vendorRequestCounts,
    refresh,
    ...meta,
  }
}
