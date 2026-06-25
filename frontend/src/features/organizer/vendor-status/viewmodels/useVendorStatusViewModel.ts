import { useState, useCallback, useMemo, useEffect } from 'react'
import { buildViewModelStateMeta } from '../../../../shared/types/viewModelState'
import {
  type VendorRequest,
  type VendorMessage,
  type VendorRequestStatus,
  type StatusFilterTab,
  type VendorStatusHistoryEntry,
  buildTimeline,
} from '../models/vendorStatus.model'
import { vendorTrackingService } from '../../../../services/vendorTrackingService'

interface VendorStatusViewModelState {
  requests: VendorRequest[]
  searchQuery: string
  activeTab: StatusFilterTab
  selectedRequest: VendorRequest | null
  showDetailDrawer: boolean
  messages: VendorMessage[]
  messageInput: string
  sending: boolean
  loading: boolean
  refreshing: boolean
  error: string | null
}

function mapTrackingRequestToModel(r: import('../../../../services/vendorTrackingService').VendorTrackingRequest): VendorRequest {
  return {
    id: r.id,
    eventBriefId: '',
    organizerId: '',
    vendorId: '',
    vendorName: r.vendorName,
    vendorCategory: r.vendorCategory,
    eventName: r.eventName,
    eventDate: r.eventDate || '',
    location: r.location || '',
    status: r.status as VendorRequestStatus,
    quotedPrice: r.quotedPrice,
    packageName: r.packageName,
    lastMessage: r.lastMessage,
    lastUpdatedAt: r.lastUpdatedAt,
    createdAt: r.createdAt,
  }
}

function mapTrackingMessageToModel(m: import('../../../../services/vendorTrackingService').VendorTrackingMessage): VendorMessage {
  return {
    id: m.id,
    requestId: m.requestId,
    senderId: m.senderId,
    senderRole: m.isOrganizer ? 'organizer' : 'vendor',
    message: m.text,
    createdAt: m.timestamp,
  }
}

export function useVendorStatusViewModel() {
  const { requestIdFromUrl, tabFromUrl } = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return {
      requestIdFromUrl: params.get('requestId'),
      tabFromUrl: params.get('tab'),
    }
  }, [])
  const initialTab: StatusFilterTab = tabFromUrl === 'pending' || tabFromUrl === 'negotiating' || tabFromUrl === 'accepted' || tabFromUrl === 'rejected' || tabFromUrl === 'confirmed' ? tabFromUrl : 'all'
  const [state, setState] = useState<VendorStatusViewModelState>({
    requests: [],
    searchQuery: '',
    activeTab: initialTab,
    selectedRequest: null,
    showDetailDrawer: false,
    messages: [],
    messageInput: '',
    sending: false,
    loading: true,
    refreshing: false,
    error: null,
  })
  const [timelineHistory, setTimelineHistory] = useState<VendorStatusHistoryEntry[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const data = await vendorTrackingService.getAll()
        if (cancelled) return
        const mappedRequests = data.map(mapTrackingRequestToModel)
        const nextSelected = requestIdFromUrl ? mappedRequests.find((r) => r.id === requestIdFromUrl) || null : null
        setState((s) => ({
          ...s,
          requests: mappedRequests,
          selectedRequest: nextSelected,
          showDetailDrawer: !!nextSelected,
          activeTab: initialTab,
          loading: false,
          error: null,
        }))
      } catch (err) {
        if (cancelled) return
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load vendor requests',
        }))
      }
    }
    load()
    return () => { cancelled = true }
  }, [requestIdFromUrl, initialTab])

  useEffect(() => {
    let cancelled = false
    async function loadTimeline() {
      if (!state.selectedRequest) {
        setTimelineHistory([])
        return
      }

      try {
        const timelineData = await vendorTrackingService.getTimeline(state.selectedRequest.id)
        if (cancelled) return
        setTimelineHistory(timelineData.map((item) => ({
          status: item.status as VendorRequestStatus,
          timestamp: item.timestamp,
          description: item.description,
        })))
      } catch {
        if (cancelled) return
        setTimelineHistory([])
      }
    }

    void loadTimeline()
    return () => { cancelled = true }
  }, [state.selectedRequest?.id])

  const filteredRequests = useMemo(() => {
    let result = [...state.requests]

    const q = state.searchQuery.toLowerCase().trim()
    if (q) {
      result = result.filter(
        (r) =>
          r.vendorName.toLowerCase().includes(q) ||
          r.eventName.toLowerCase().includes(q) ||
          r.vendorCategory.toLowerCase().includes(q)
      )
    }

    if (state.activeTab === 'pending') {
      result = result.filter((r) => ['sent', 'pending', 'viewed', 'quoted'].includes(r.status))
    } else if (state.activeTab === 'negotiating') {
      result = result.filter((r) => r.status === 'negotiating')
    } else if (state.activeTab === 'accepted') {
      result = result.filter((r) => r.status === 'accepted')
    } else if (state.activeTab === 'rejected') {
      result = result.filter((r) => r.status === 'rejected' || r.status === 'cancelled')
    } else if (state.activeTab === 'confirmed') {
      result = result.filter((r) => r.status === 'confirmed' || r.status === 'contract_pending')
    }

    return result.sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime())
  }, [state.requests, state.searchQuery, state.activeTab])

  const summaryCounts = useMemo(() => {
    const all = state.requests
    return {
      pending: all.filter((r) => ['sent', 'pending', 'viewed', 'quoted'].includes(r.status)).length,
      negotiating: all.filter((r) => r.status === 'negotiating').length,
      accepted: all.filter((r) => r.status === 'accepted').length,
      rejected: all.filter((r) => r.status === 'rejected' || r.status === 'cancelled').length,
      confirmed: all.filter((r) => r.status === 'confirmed' || r.status === 'contract_pending').length,
    }
  }, [state.requests])

  const setSearchQuery = useCallback((q: string) => {
    setState((s) => ({ ...s, searchQuery: q }))
  }, [])

  const setActiveTab = useCallback((tab: StatusFilterTab) => {
    setState((s) => ({ ...s, activeTab: tab }))
  }, [])

  const openRequestDetail = useCallback(async (requestId: string) => {
    const req = state.requests.find((r) => r.id === requestId)
    if (!req) return

    setState((s) => ({
      ...s,
      selectedRequest: req,
      showDetailDrawer: true,
      messages: [],
      messageInput: '',
    }))

    try {
      const [requestData, messagesData] = await Promise.all([
        vendorTrackingService.getById(requestId),
        vendorTrackingService.getMessages(requestId)
      ])
      const normalized = mapTrackingRequestToModel(requestData)
      setState((s) => ({
        ...s,
        requests: s.requests.map((item) => item.id === requestId ? normalized : item),
        selectedRequest: normalized,
        messages: messagesData.map(mapTrackingMessageToModel),
      }))
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Failed to load request detail',
      }))
    }
  }, [state.requests])

  const closeRequestDetail = useCallback(() => {
    setState((s) => ({
      ...s,
      showDetailDrawer: false,
      selectedRequest: null,
      messages: [],
      messageInput: '',
    }))
  }, [])

  const setMessageInput = useCallback((value: string) => {
    setState((s) => ({ ...s, messageInput: value }))
  }, [])

  const sendMessage = useCallback(async () => {
    const text = state.messageInput.trim()
    if (!text || !state.selectedRequest) return

    try {
      setState((s) => ({ ...s, sending: true, error: null }))
      await vendorTrackingService.sendMessage(state.selectedRequest.id, text)
      const [requestData, messagesData] = await Promise.all([
        vendorTrackingService.getById(state.selectedRequest.id),
        vendorTrackingService.getMessages(state.selectedRequest.id)
      ])
      const normalized = mapTrackingRequestToModel(requestData)
      setState((s) => ({
        ...s,
        sending: false,
        messageInput: '',
        requests: s.requests.map((r) => r.id === normalized.id ? normalized : r),
        selectedRequest: normalized,
        messages: messagesData.map(mapTrackingMessageToModel),
      }))
    } catch (err) {
      setState((s) => ({
        ...s,
        sending: false,
        error: err instanceof Error ? err.message : 'Failed to send message',
      }))
    }
  }, [state.messageInput, state.selectedRequest])

  const updateRequestStatus = useCallback(async (requestId: string, newStatus: VendorRequestStatus) => {
    try {
      setState((s) => ({ ...s, sending: true, error: null }))
      let updatedRequest: import('../../../../services/vendorTrackingService').VendorTrackingRequest | null = null
      if (newStatus === 'accepted') {
        updatedRequest = await vendorTrackingService.acceptOffer(requestId)
      } else if (newStatus === 'rejected') {
        updatedRequest = await vendorTrackingService.rejectOffer(requestId)
      } else if (newStatus === 'confirmed') {
        updatedRequest = await vendorTrackingService.confirmBooking(requestId)
      }

      if (updatedRequest) {
        const normalized = mapTrackingRequestToModel(updatedRequest)
        const timelineData = await vendorTrackingService.getTimeline(requestId)
        setState((s) => ({
          ...s,
          sending: false,
          requests: s.requests.map((r) => (r.id === requestId ? normalized : r)),
          selectedRequest: s.selectedRequest?.id === requestId ? normalized : s.selectedRequest,
        }))
        setTimelineHistory(timelineData.map((item) => ({
          status: item.status as VendorRequestStatus,
          timestamp: item.timestamp,
          description: item.description,
        })))
        return
      }
      setState((s) => ({ ...s, sending: false }))
    } catch (err) {
      setState((s) => ({
        ...s,
        sending: false,
        error: err instanceof Error ? err.message : 'Failed to update request status',
      }))
    }
  }, [])

  const timelineItems = useMemo(() => {
    if (!state.selectedRequest) return []
    return buildTimeline(state.selectedRequest.status, timelineHistory)
  }, [state.selectedRequest, timelineHistory])

  return {
    requests: filteredRequests,
    allRequests: state.requests,
    searchQuery: state.searchQuery,
    activeTab: state.activeTab,
    selectedRequest: state.selectedRequest,
    showDetailDrawer: state.showDetailDrawer,
    timelineHistory,
    messages: state.messages,
    messageInput: state.messageInput,
    sending: state.sending,
    summaryCounts,
    timelineItems,
    setSearchQuery,
    setActiveTab,
    openRequestDetail,
    closeRequestDetail,
    setMessageInput,
    sendMessage,
    updateRequestStatus,
    ...buildViewModelStateMeta({
      loading: state.loading,
      submitting: state.sending,
      error: state.error,
      empty: !state.loading && filteredRequests.length === 0,
      loaded: !state.loading,
    }),
  }
}
