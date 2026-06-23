import { useState, useCallback, useRef } from 'react'
import { eventService, type LargeEvent, type EventPortfolio, type DashboardSummary } from '../../../services/eventService'
import { vendorService } from '../../../services/vendorService'
import type { EventStatus } from '../models/organizer-dashboard.model'
import { buildViewModelStateMeta } from '../../../shared/types/viewModelState'
import type { EventSetupPayload } from '../models/event-setup-builder.model'

interface OrganizerDashboardState {
  events: LargeEvent[]
  selectedEvent: LargeEvent | null
  portfolio: EventPortfolio | null
  summary: DashboardSummary | null
  loading: boolean
  submitting: boolean
  portfolioLoading: boolean
  error: string | null
}

export function useOrganizerDashboard() {
  const [state, setState] = useState<OrganizerDashboardState>({
    events: [],
    selectedEvent: null,
    portfolio: null,
    summary: null,
    loading: false,
    submitting: false,
    portfolioLoading: false,
    error: null
  })

  const loadEvents = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const [events, summary] = await Promise.all([
        eventService.listEvents(),
        eventService.getDashboardSummary()
      ])
      setState((s) => ({ ...s, events, summary, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  const selectEvent = useCallback(async (eventId: string) => {
    setState((s) => ({ ...s, portfolioLoading: true, error: null }))
    try {
      const portfolio = await eventService.getEventPortfolio(eventId)
      const events = await eventService.listEvents()
      const selectedEvent = events.find((e) => e.id === eventId) || null
      setState((s) => ({ ...s, events, selectedEvent, portfolio, portfolioLoading: false }))
    } catch (err) {
      setState((s) => ({ ...s, portfolioLoading: false, error: (err as Error).message }))
    }
  }, [])

  const submittingRef = useRef(false)

  const createEvent = useCallback(async (payload: EventSetupPayload) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      const createdEvent = await eventService.createEvent({
        title: payload.title,
        eventDate: payload.eventDate,
        venue: payload.venue,
        budget: payload.budget,
        expectedGuests: payload.guests
      })

      await Promise.all(
        payload.selectedServices.map((service) =>
          vendorService.createRequirement(createdEvent.id, {
            category: service,
            quantity: 1,
            notes: [
              payload.description,
              `Theme: ${payload.theme}`,
              `Mood: ${payload.mood}`,
              payload.specialRequirements,
              payload.vendorNotes
            ].filter(Boolean).join(' · ')
          })
        )
      )

      await loadEvents()
      setState((s) => ({ ...s, submitting: false }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    } finally {
      submittingRef.current = false
    }
  }, [loadEvents])

  const updateEventStatus = useCallback(async (eventId: string, status: EventStatus) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await eventService.updateEvent(eventId, { status } as Partial<LargeEvent>)
      if (state.selectedEvent?.id === eventId) {
        await selectEvent(eventId)
      } else {
        await loadEvents()
      }
      setState((s) => ({ ...s, submitting: false }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    } finally {
      submittingRef.current = false
    }
  }, [state.selectedEvent, selectEvent, loadEvents])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    ...state,
    ...buildViewModelStateMeta({
      loading: state.loading,
      submitting: state.submitting,
      error: state.error,
      empty: !state.loading && state.events.length === 0,
      loaded: !state.loading
    }),
    loadEvents,
    selectEvent,
    createEvent,
    updateEventStatus,
    clearError
  }
}
