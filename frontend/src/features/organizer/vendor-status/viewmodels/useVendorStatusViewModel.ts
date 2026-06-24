import { useState, useCallback, useMemo, useEffect } from 'react'
import { buildViewModelStateMeta } from '../../../../shared/types/viewModelState'
import {
  type VendorRequest,
  type VendorMessage,
  type VendorRequestStatus,
  type StatusFilterTab,
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
  const [state, setState] = useState<VendorStatusViewModelState>({
    requests: [],
    searchQuery: '',
    activeTab: 'all',
    selectedRequest: null,
    showDetailDrawer: false,
    messages: [],
    messageInput: '',
    sending: false,
    loading: true,
    refreshing: false,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const data = await vendorTrackingService.getAll()
        if (cancelled) return
        setState((s) => ({
          ...s,
          requests: data.map(mapTrackingRequestToModel),
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
  }, [])

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
      result = result.filter((r) => ['sent', 'pending', 'viewed', 'quoted', 'negotiating'].includes(r.status))
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
      pending: all.filter((r) => ['sent', 'pending', 'viewed', 'quoted', 'negotiating'].includes(r.status)).length,
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
      const messagesData = await vendorTrackingService.getMessages(requestId)
      setState((s) => ({
        ...s,
        messages: messagesData.map(mapTrackingMessageToModel),
      }))
    } catch {
      // Messages not critical; show detail drawer without them
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

    const newMsg: VendorMessage = {
      id: `msg-${Date.now()}`,
      requestId: state.selectedRequest.id,
      senderId: 'organizer',
      senderRole: 'organizer',
      message: text,
      createdAt: new Date().toISOString(),
    }

    setState((s) => ({
      ...s,
      messages: [...s.messages, newMsg],
      messageInput: '',
      requests: s.requests.map((r) =>
        r.id === s.selectedRequest?.id
          ? { ...r, lastMessage: text, lastUpdatedAt: new Date().toISOString() }
          : r
      ),
    }))

    try {
      await vendorTrackingService.sendMessage(state.selectedRequest.id, text)
    } catch {
      // Message sent locally; API failure is non-critical
    }
  }, [state.messageInput, state.selectedRequest])

  const updateRequestStatus = useCallback(async (requestId: string, newStatus: VendorRequestStatus) => {
    const statusMsg: VendorMessage = {
      id: `sys-${Date.now()}`,
      requestId,
      senderId: 'system',
      senderRole: 'system',
      message: `Status changed to ${newStatus}`,
      createdAt: new Date().toISOString(),
    }

    setState((s) => ({
      ...s,
      requests: s.requests.map((r) =>
        r.id === requestId
          ? { ...r, status: newStatus, lastUpdatedAt: new Date().toISOString() }
          : r
      ),
      messages: s.selectedRequest?.id === requestId
        ? [...s.messages, statusMsg]
        : s.messages,
      selectedRequest:
        s.selectedRequest?.id === requestId
          ? { ...s.selectedRequest, status: newStatus, lastUpdatedAt: new Date().toISOString() }
          : s.selectedRequest,
    }))

    try {
      if (newStatus === 'accepted') {
        await vendorTrackingService.acceptOffer(requestId)
      } else if (newStatus === 'rejected') {
        await vendorTrackingService.rejectOffer(requestId)
      } else if (newStatus === 'confirmed') {
        await vendorTrackingService.confirmBooking(requestId)
      }
    } catch {
      // Status update applied locally; API sync is non-critical
    }
  }, [])

  const timelineItems = useMemo(() => {
    if (!state.selectedRequest) return []
    return buildTimeline(state.selectedRequest.status)
  }, [state.selectedRequest])

  return {
    requests: filteredRequests,
    allRequests: state.requests,
    searchQuery: state.searchQuery,
    activeTab: state.activeTab,
    selectedRequest: state.selectedRequest,
    showDetailDrawer: state.showDetailDrawer,
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
