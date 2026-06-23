import { useState, useCallback } from 'react'
import { useAuthSession } from '../../auth/viewmodels/useAuthSession'
import { eventService, type EventPortfolio } from '../../../services/eventService'
import { contractService, type ContractDetail } from '../../../services/contractService'

interface EventPortfolioState {
  portfolio: EventPortfolio | null
  loading: boolean
  submitting: boolean
  error: string | null
  expandedBookingId: string | null
  detailedContract: ContractDetail | null
  contractLoading: boolean
}

export function useEventPortfolio() {
  const { user } = useAuthSession()
  const [state, setState] = useState<EventPortfolioState>({
    portfolio: null,
    loading: false,
    submitting: false,
    error: null,
    expandedBookingId: null,
    detailedContract: null,
    contractLoading: false
  })

  const loadPortfolio = useCallback(async (eventId: string) => {
    setState((s) => ({ ...s, loading: true, error: null, expandedBookingId: null, detailedContract: null }))
    try {
      const portfolio = await eventService.getEventPortfolio(eventId)
      setState((s) => ({ ...s, portfolio, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
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
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await contractService.createContract(bookingId, { termsSummary })
      const contract = await contractService.getContractByBooking(bookingId)
      setState((s) => ({ ...s, submitting: false, detailedContract: contract }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [])

  const sendContract = useCallback(async (contractId: string) => {
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      const updated = await contractService.updateContractStatus(contractId, { status: 'sent' })
      setState((s) => ({ ...s, submitting: false, detailedContract: updated }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [])

  const signContractAsOrganizer = useCallback(async (contractId: string) => {
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      const updated = await contractService.signContractOrganizer(contractId, { termsAccepted: true })
      setState((s) => ({ ...s, submitting: false, detailedContract: updated }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [])

  const signContractAsVendor = useCallback(async (contractId: string) => {
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      const updated = await contractService.signContractVendor(contractId, { termsAccepted: true })
      setState((s) => ({ ...s, submitting: false, detailedContract: updated }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    ...state,
    userRole: user?.role || null,
    loadPortfolio,
    expandBooking,
    createContract,
    sendContract,
    signContractAsOrganizer,
    signContractAsVendor,
    clearError
  }
}
