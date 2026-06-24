import { useState, useCallback, useMemo, useEffect } from 'react'
import { buildViewModelStateMeta } from '../../../../shared/types/viewModelState'
import {
  type VendorRequest,
  type VendorMessage,
  type VendorRequestStatus,
  type StatusFilterTab,
  MOCK_VENDOR_REQUESTS,
  MOCK_MESSAGES,
  buildTimeline,
} from '../models/vendorStatus.model'

const REQUESTS_STORAGE_KEY = 'eventify:vendor-requests'

interface VendorStatusViewModelState {
  requests: VendorRequest[]
  searchQuery: string
  activeTab: StatusFilterTab
  selectedRequest: VendorRequest | null
  showDetailDrawer: boolean
  messages: VendorMessage[]
  messageInput: string
  sending: boolean
}

export function useVendorStatusViewModel() {
  const [state, setState] = useState<VendorStatusViewModelState>(() => {
    const stored = sessionStorage.getItem(REQUESTS_STORAGE_KEY)
    const persisted: VendorRequest[] = stored ? JSON.parse(stored) : []
    return {
      requests: [...MOCK_VENDOR_REQUESTS, ...persisted],
      searchQuery: '',
      activeTab: 'all',
      selectedRequest: null,
      showDetailDrawer: false,
      messages: [],
      messageInput: '',
      sending: false,
    }
  })

  useEffect(() => {
    const stored = sessionStorage.getItem(REQUESTS_STORAGE_KEY)
    const persisted: VendorRequest[] = stored ? JSON.parse(stored) : []
    if (persisted.length > 0) {
      setState((s) => {
        const existingIds = new Set(s.requests.map((r) => r.id))
        const newOnes = persisted.filter((r) => !existingIds.has(r.id))
        if (newOnes.length === 0) return s
        return { ...s, requests: [...s.requests, ...newOnes] }
      })
    }
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

  const openRequestDetail = useCallback((requestId: string) => {
    const req = state.requests.find((r) => r.id === requestId)
    if (!req) return
    const messages = MOCK_MESSAGES[requestId] || []
    setState((s) => ({
      ...s,
      selectedRequest: req,
      showDetailDrawer: true,
      messages,
      messageInput: '',
    }))
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

  const sendMessage = useCallback(() => {
    const text = state.messageInput.trim()
    if (!text || !state.selectedRequest) return

    const newMsg: VendorMessage = {
      id: `msg-${Date.now()}`,
      requestId: state.selectedRequest.id,
      senderId: 'org-1',
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
  }, [state.messageInput, state.selectedRequest])

  const updateRequestStatus = useCallback((requestId: string, newStatus: VendorRequestStatus) => {
    setState((s) => {
      const req = s.requests.find((r) => r.id === requestId)
      if (!req) return s

      const statusMsg: VendorMessage = {
        id: `sys-${Date.now()}`,
        requestId,
        senderId: 'system',
        senderRole: 'system',
        message: `Status changed to ${newStatus}`,
        createdAt: new Date().toISOString(),
      }

      return {
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
      }
    })
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
      loading: false,
      submitting: state.sending,
      error: null,
      empty: filteredRequests.length === 0,
      loaded: true,
    }),
  }
}
