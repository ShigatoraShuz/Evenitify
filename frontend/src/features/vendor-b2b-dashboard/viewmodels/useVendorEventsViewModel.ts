import { useCallback, useEffect, useRef, useState } from 'react'
import { bookingService, type BookingRequest } from '../../../services/bookingService'
import { contractService, type ContractDetail } from '../../../services/contractService'
import { buildViewModelStateMeta } from '../../../shared/types/viewModelState'
import { useAuthSession } from '../../auth/viewmodels/useAuthSession'
import { useToast } from '../../../shared/components/ToastContext'

export interface VendorEventCard {
  booking: BookingRequest
  contract: ContractDetail | null
  title: string
  organizer: string
  eventDateLabel: string
  venueLabel: string
  guestsLabel: string
  budgetLabel: string
  requirementStatus: string
  contractStatus: string
  requestedServices: Array<{
    id: string
    label: string
  }>
  organizerNotes: string
  completionHint: string
  canComplete: boolean
}

interface VendorEventsState {
  events: VendorEventCard[]
  loading: boolean
  refreshing: boolean
  submitting: boolean
  error: string | null
  finishingEventId: string | null
  loadedOnce: boolean
}

function formatDateLabel(value?: string | null) {
  if (!value) return 'TBD'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'TBD'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatMoneyLabel(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return 'Not set'
  return `$${Number(value).toLocaleString()}`
}

function formatGuestsLabel(value?: number | null) {
  if (!value || Number.isNaN(Number(value))) return 'Not set'
  return Number(value).toLocaleString()
}

function buildServiceLabels(booking: BookingRequest) {
  const services = booking.requestedServices ?? []
  if (services.length > 0) {
    return services.map((service) => ({
      id: service.id,
      label: service.serviceName || service.category || 'Service'
    }))
  }

  const fallback = booking.event_requirements?.category || booking.booking_type || 'Service request'
  return [{ id: booking.requirement_id || booking.id, label: fallback }]
}

function mapEventCard(booking: BookingRequest, contract: ContractDetail | null): VendorEventCard {
  const contractStatus = contract?.contract_status || 'contract_pending'
  const canComplete = contractStatus === 'active'

  return {
    booking,
    contract,
    title: booking.large_events?.title || booking.event_requirements?.category || 'Confirmed event',
    organizer: booking.organizer_profiles?.organization_name || 'Organizer',
    eventDateLabel: formatDateLabel(booking.large_events?.event_date || booking.requested_at),
    venueLabel: booking.large_events?.venue || 'Venue pending',
    guestsLabel: formatGuestsLabel(booking.large_events?.expected_guests),
    budgetLabel: formatMoneyLabel(booking.requested_budget ?? booking.large_events?.budget ?? null),
    requirementStatus: booking.event_requirements?.requirement_status || 'pending',
    contractStatus,
    requestedServices: buildServiceLabels(booking),
    organizerNotes: booking.event_requirements?.notes || booking.notes || 'No organizer notes provided.',
    completionHint: canComplete
      ? 'Active contract ready to close.'
      : contract
        ? `Contract is ${contractStatus.replace(/_/g, ' ')}.`
        : 'No contract is linked to this booking yet.',
    canComplete
  }
}

export function useVendorEventsViewModel() {
  const { user } = useAuthSession()
  const { addToast } = useToast()
  const loadInFlightRef = useRef<Promise<void> | null>(null)
  const hasLoadedRef = useRef(false)
  const submittingRef = useRef(false)
  const [state, setState] = useState<VendorEventsState>({
    events: [],
    loading: true,
    refreshing: false,
    submitting: false,
    error: null,
    finishingEventId: null,
    loadedOnce: false
  })

  const loadEvents = useCallback(async () => {
    if (!user) return
    if (!user.hasVendorProfile && !user.vendorProfile) {
      setState((current) => ({ ...current, loading: false, refreshing: false, error: 'VENDOR_NOT_FOUND' }))
      return
    }

    if (loadInFlightRef.current) return loadInFlightRef.current

    const isInitialLoad = !hasLoadedRef.current
    setState((current) => ({
      ...current,
      loading: isInitialLoad,
      refreshing: !isInitialLoad,
      error: null
    }))

    loadInFlightRef.current = (async () => {
      try {
        const bookings = await bookingService.listVendorB2BBookings('confirmed')
        const sortedBookings = [...bookings].sort((left, right) => {
          const leftTime = new Date(left.large_events?.event_date || left.requested_at).getTime()
          const rightTime = new Date(right.large_events?.event_date || right.requested_at).getTime()
          return leftTime - rightTime
        })

        const events = await Promise.all(
          sortedBookings.map(async (booking) => {
            const contract = await contractService.getContractByBooking(booking.id).catch(() => null)
            return mapEventCard(booking, contract)
          })
        )

        setState((current) => ({
          ...current,
          events,
          loading: false,
          refreshing: false,
          loadedOnce: true
        }))
      } catch (err) {
        setState((current) => ({
          ...current,
          loading: false,
          refreshing: false,
          error: err instanceof Error ? err.message : 'Failed to load events',
          loadedOnce: true
        }))
      } finally {
        hasLoadedRef.current = true
        loadInFlightRef.current = null
      }
    })()

    return loadInFlightRef.current
  }, [user])

  useEffect(() => {
    void loadEvents()
  }, [loadEvents])

  const completeEvent = useCallback(async (bookingId: string) => {
    if (submittingRef.current) return

    const event = state.events.find((item) => item.booking.id === bookingId)
    if (!event) return

    if (!event.contract || !event.canComplete) {
      const message = event.contract
        ? 'This event needs an active contract before it can be finished.'
        : 'No contract was found for this confirmed booking.'
      setState((current) => ({ ...current, error: message }))
      addToast('error', message)
      return
    }

    submittingRef.current = true
    setState((current) => ({
      ...current,
      submitting: true,
      finishingEventId: bookingId,
      error: null
    }))

    try {
      await contractService.completeContract(event.contract.id)
      setState((current) => ({
        ...current,
        events: current.events.filter((item) => item.booking.id !== bookingId)
      }))
      addToast('success', 'Event marked as finished')
      await loadEvents()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to finish event'
      setState((current) => ({ ...current, error: message }))
      addToast('error', message)
    } finally {
      submittingRef.current = false
      setState((current) => ({
        ...current,
        submitting: false,
        finishingEventId: null
      }))
    }
  }, [addToast, loadEvents, state.events])

  const clearError = useCallback(() => {
    setState((current) => ({ ...current, error: null }))
  }, [])

  return {
    ...state,
    userRole: user?.role || null,
    ...buildViewModelStateMeta({
      loading: state.loading,
      refreshing: state.refreshing,
      submitting: state.submitting,
      error: state.error,
      empty: state.loadedOnce && state.events.length === 0,
      loaded: state.loadedOnce && !state.loading && !state.refreshing
    }),
    loadEvents,
    completeEvent,
    clearError
  }
}
