import { useState, useCallback, useRef, useMemo } from 'react'
import { useAuthSession } from '../../auth/viewmodels/useAuthSession'
import { eventService, type EventPortfolio } from '../../../services/eventService'
import { contractService, type ContractDetail } from '../../../services/contractService'
import { auditService, type AuditActivity } from '../../../services/auditService'
import { documentService, type DocumentMetadata } from '../../../services/documentService'
import { buildViewModelStateMeta } from '../../../shared/types/viewModelState'

export type PortfolioTab = 'overview' | 'requirements' | 'vendors' | 'bookings' | 'contracts' | 'documents' | 'activity'

interface EventPortfolioState {
  portfolio: EventPortfolio | null
  loading: boolean
  submitting: boolean
  error: string | null
  expandedBookingId: string | null
  detailedContract: ContractDetail | null
  contractLoading: boolean
  activeTab: PortfolioTab
  documents: DocumentMetadata[]
  auditActivities: AuditActivity[]
}

export function useEventPortfolio() {
  const { user } = useAuthSession()
  const submittingRef = useRef(false)
  const [state, setState] = useState<EventPortfolioState>({
    portfolio: null,
    loading: false,
    submitting: false,
    error: null,
    expandedBookingId: null,
    detailedContract: null,
    contractLoading: false,
    activeTab: 'overview',
    documents: [],
    auditActivities: []
  })

  const loadPortfolio = useCallback(async (eventId: string) => {
    setState((s) => ({ ...s, loading: true, error: null, expandedBookingId: null, detailedContract: null }))
    try {
      const [portfolio, documents, auditActivities] = await Promise.all([
        eventService.getEventPortfolio(eventId),
        documentService.listDocuments(eventId),
        auditService.listActivities(`event:${eventId}`)
      ])
      setState((s) => ({ ...s, portfolio, documents, auditActivities, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  const setActiveTab = useCallback((tab: PortfolioTab) => {
    setState((s) => ({ ...s, activeTab: tab, expandedBookingId: null, detailedContract: null }))
  }, [])

  const expandBooking = useCallback(async (bookingId: string) => {
    const expanded = state.expandedBookingId === bookingId ? null : bookingId
    setState((s) => ({ ...s, expandedBookingId: expanded, detailedContract: null }))

    if (expanded) {
      setState((s) => ({ ...s, contractLoading: true, error: null }))
      try {
        const contract = await contractService.getContractByBooking(bookingId)
        setState((s) => ({ ...s, contractLoading: false, detailedContract: contract }))
      } catch (err) {
        setState((s) => ({ ...s, contractLoading: false, error: (err as Error).message }))
      }
    }
  }, [state.expandedBookingId])

  const createContract = useCallback(async (bookingId: string, termsSummary?: string) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await contractService.createContract(bookingId, { termsSummary })
      const contract = await contractService.getContractByBooking(bookingId)
      setState((s) => ({ ...s, submitting: false, detailedContract: contract }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    } finally {
      submittingRef.current = false
    }
  }, [])

  const mockUploadDocument = useCallback(async (fileName: string) => {
    const ownerId = state.portfolio?.event.id || 'system'
    const document = await documentService.mockUpload(ownerId, fileName, 'Contract attachment')
    setState((s) => ({ ...s, documents: [document, ...s.documents] }))
  }, [state.portfolio?.event.id])

  const sendContract = useCallback(async (contractId: string) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      const updated = await contractService.updateContractStatus(contractId, { status: 'sent' })
      setState((s) => ({ ...s, submitting: false, detailedContract: updated }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    } finally {
      submittingRef.current = false
    }
  }, [])

  const signContractAsOrganizer = useCallback(async (contractId: string) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      const updated = await contractService.signContractOrganizer(contractId, { termsAccepted: true })
      setState((s) => ({ ...s, submitting: false, detailedContract: updated }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    } finally {
      submittingRef.current = false
    }
  }, [])

  const signContractAsVendor = useCallback(async (contractId: string) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      const updated = await contractService.signContractVendor(contractId, { termsAccepted: true })
      setState((s) => ({ ...s, submitting: false, detailedContract: updated }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    } finally {
      submittingRef.current = false
    }
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  const vendors = useMemo(() => state.portfolio?.bookings
    ? [...new Map(state.portfolio.bookings.map((b) => [b.vendor_id, b.vendor_profiles])).entries()]
        .map(([vendorId, profile]) => ({ vendorId, ...profile }))
    : [], [state.portfolio?.bookings])

  const contracts = useMemo(() => state.portfolio?.bookings
    ? state.portfolio.bookings.flatMap((b) =>
        (b.contracts || []).map((c) => ({
          ...c,
          bookingId: b.id,
          vendorName: b.vendor_profiles?.business_name,
          category: b.event_requirements?.category
        }))
      )
    : [], [state.portfolio?.bookings])

  const activity = useMemo(() => state.portfolio?.bookings
    ? state.portfolio.bookings.flatMap((b) =>
        (b.statusHistory || []).map((h) => ({
          ...h,
          vendorName: b.vendor_profiles?.business_name,
          category: b.event_requirements?.category
        }))
      ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : [], [state.portfolio?.bookings])

  return {
    ...state,
    ...buildViewModelStateMeta({
      loading: state.loading,
      submitting: state.submitting,
      refreshing: state.contractLoading,
      error: state.error,
      empty: !state.loading && !state.portfolio,
      loaded: !state.loading && !!state.portfolio
    }),
    userRole: user?.role || null,
    vendors,
    contracts,
    activity,
    loadPortfolio,
    setActiveTab,
    expandBooking,
    createContract,
    mockUploadDocument,
    sendContract,
    signContractAsOrganizer,
    signContractAsVendor,
    clearError
  }
}
