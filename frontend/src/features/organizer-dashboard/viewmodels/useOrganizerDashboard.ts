import { useState, useCallback } from 'react'
import { eventService, type LargeEvent, type EventPortfolio, type DashboardSummary } from '../../../services/eventService'
import type { EventStatus } from '../models/organizer-dashboard.model'

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

  const createEvent = useCallback(async (payload: {
    title: string
    eventDate: string
    venue: string
    budget: number
    expectedGuests: number
  }) => {
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await eventService.createEvent(payload)
      await loadEvents()
      setState((s) => ({ ...s, submitting: false }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [loadEvents])

  const updateEventStatus = useCallback(async (eventId: string, status: EventStatus) => {
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
    }
  }, [state.selectedEvent, selectEvent, loadEvents])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    ...state,
    loadEvents,
    selectEvent,
    createEvent,
    updateEventStatus,
    clearError
  }
}
