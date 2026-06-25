import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { eventService } from '../../../../services/eventService'
import { vendorService } from '../../../../services/vendorService'
import { buildViewModelStateMeta } from '../../../../shared/types/viewModelState'
import {
  INITIAL_FORM_STATE,
  EVENT_TYPE_OPTIONS,
  STORAGE_KEY,
  TOTAL_STEPS,
  type EventTypeId,
  type PlanEventFormState
} from '../models/planEvent.model'
import type { EventSetupPayload } from '../models/planEvent.model'

interface PlanEventViewModelState {
  currentStep: number
  form: PlanEventFormState
  events: Awaited<ReturnType<typeof eventService.listEvents>>
  drafts: SavedDraft[]
  completedBriefs: CompletedBrief[]
  draftEventId: string | null
  errors: string[]
  submitted: boolean
  createdEventId: string | null
  submitting: boolean
  loading: boolean
  error: string | null
}

interface SavedDraft {
  id: string
  title: string
  eventType: string
  venue: string
  eventDate: string
  guests: string
  budget: string
  progress: number
  lastSaved: string
  currentStep: number
  form: PlanEventFormState
}

interface CompletedBrief {
  id: string
  title: string
  eventType: string
  status: string
  venue: string
  eventDate: string
  guests: number
  budget: number
  servicesRequested: number
  servicesConfirmed: number
  completedAt: string
}

function createDraftSnapshot(form: PlanEventFormState, currentStep: number): SavedDraft {
  return {
    id: crypto.randomUUID(),
    title: form.title.trim() || `${form.eventType} planning draft`,
    eventType: form.eventType,
    venue: form.venue.trim(),
    eventDate: form.eventDate,
    guests: form.guests,
    budget: form.budget,
    progress: Math.max(10, Math.min(95, Math.round(((currentStep + 1) / TOTAL_STEPS) * 100))),
    lastSaved: new Date().toISOString(),
    currentStep,
    form
  }
}

function mapEventToDraft(event: Awaited<ReturnType<typeof eventService.listEvents>>[number]): SavedDraft {
  const isDraftLike = event.status === 'draft' || event.status === 'planning'
  return {
    id: event.id,
    title: event.title,
    eventType: 'custom',
    venue: event.venue,
    eventDate: event.event_date,
    guests: String(event.expected_guests),
    budget: String(event.budget),
    progress: isDraftLike ? 25 : Math.round(100),
    lastSaved: event.updated_at || event.created_at,
    currentStep: isDraftLike ? 0 : TOTAL_STEPS - 1,
    form: {
      ...INITIAL_FORM_STATE,
      title: event.title,
      venue: event.venue,
      eventDate: event.event_date,
      guests: String(event.expected_guests),
      budget: String(event.budget),
    }
  }
}

function mapEventToCompletedBrief(event: Awaited<ReturnType<typeof eventService.listEvents>>[number]): CompletedBrief {
  return {
    id: event.id,
    title: event.title,
    eventType: event.status === 'completed' ? 'Completed Event' : 'Planned Event',
    status: event.status,
    venue: event.venue,
    eventDate: event.event_date,
    guests: event.expected_guests,
    budget: Number(event.budget || 0),
    servicesRequested: 0,
    servicesConfirmed: 0,
    completedAt: event.updated_at || event.created_at
  }
}

function normalizeRequirementCategory(service: string): 'Catering' | 'Lights and Sounds' | 'Venue' | 'Photo/Video' | 'Staff' | 'Transport' {
  const normalized = service.toLowerCase().trim()
  if (normalized === 'catering') return 'Catering'
  if (normalized === 'lights and sounds' || normalized === 'lighting and sounds' || normalized === 'lights & sounds') return 'Lights and Sounds'
  if (normalized === 'venue' || normalized === 'venue decoration' || normalized === 'event styling' || normalized === 'florist') return 'Venue'
  if (normalized === 'photography' || normalized === 'videography' || normalized === 'photo/video') return 'Photo/Video'
  if (normalized === 'event staff' || normalized === 'security' || normalized === 'cleanup crew' || normalized === 'hosts / emcees' || normalized === 'entertainment') return 'Staff'
  return 'Transport'
}

function normalizeEventDate(value: string): string | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

function mapCompletedBriefs(events: Awaited<ReturnType<typeof eventService.listEvents>>): CompletedBrief[] {
  return events
    .filter((event) => event.status !== 'draft')
    .map(mapEventToCompletedBrief)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
}

export function usePlanEventViewModel() {
  const [state, setState] = useState<PlanEventViewModelState>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    const form = saved ? (JSON.parse(saved) as PlanEventFormState) : INITIAL_FORM_STATE
    return {
      currentStep: 0,
      form,
      events: [],
      drafts: [],
      completedBriefs: [],
      draftEventId: null,
      errors: [],
      submitted: false,
      createdEventId: null,
      submitting: false,
      loading: false,
      error: null
    }
  })

  const submittingRef = useRef(false)

  const eventTypeMeta = useMemo(
    () => EVENT_TYPE_OPTIONS.find((option) => option.id === state.form.eventType) ?? EVENT_TYPE_OPTIONS[0],
    [state.form.eventType]
  )

  const recommendedServices = useMemo(
    () => Array.from(new Set([...eventTypeMeta.recommendedServices, ...state.form.selectedServices])),
    [eventTypeMeta.recommendedServices, state.form.selectedServices]
  )

  const progress = Math.round(((state.currentStep + 1) / TOTAL_STEPS) * 100)

  const updateForm = useCallback(<K extends keyof PlanEventFormState>(key: K, value: PlanEventFormState[K]) => {
    setState((s) => ({ ...s, form: { ...s.form, [key]: value }, errors: [] }))
  }, [])

  const toggleService = useCallback((service: string) => {
    setState((s) => {
      const selected = s.form.selectedServices.includes(service)
        ? s.form.selectedServices.filter((item) => item !== service)
        : [...s.form.selectedServices, service]
      return { ...s, form: { ...s.form, selectedServices: selected }, errors: [] }
    })
  }, [])

  const selectEventType = useCallback((id: EventTypeId) => {
    const option = EVENT_TYPE_OPTIONS.find((o) => o.id === id) ?? EVENT_TYPE_OPTIONS[0]
    setState((s) => ({
      ...s,
      form: {
        ...s.form,
        eventType: id,
        theme: option.defaultTheme,
        mood: option.mood,
        selectedServices: option.recommendedServices
      },
      errors: []
    }))
  }, [])

  const validateStep = useCallback((step: number): string[] => {
    const nextErrors: string[] = []
    const f = state.form
    if (step === 0 && !f.eventType) nextErrors.push('Choose an event type to continue.')
    if (step === 1 && !f.venue.trim()) nextErrors.push('Add a venue or location.')
    if (step === 2) {
      if (!f.title.trim()) nextErrors.push('Event name is required.')
      if (!f.description.trim()) nextErrors.push('Event description is required.')
    }
    if (step === 3) {
      if (!f.theme.trim()) nextErrors.push('Select a theme.')
      if (!f.colorPalette.trim()) nextErrors.push('Select a color palette.')
    }
    if (step === 4 && f.selectedServices.length === 0) nextErrors.push('Pick at least one vendor service.')
    if (step === 5) {
      if (!f.eventDate) nextErrors.push('Date is required.')
      if (!f.eventTime) nextErrors.push('Time is required.')
      if (!f.guests || Number(f.guests) <= 0) nextErrors.push('Guest count must be greater than zero.')
      if (!f.budget || Number(f.budget) <= 0) nextErrors.push('Budget must be greater than zero.')
    }
    return nextErrors
  }, [state.form])

  const goNext = useCallback(() => {
    const errors = validateStep(state.currentStep)
    if (errors.length > 0) {
      setState((s) => ({ ...s, errors }))
      return
    }
    setState((s) => ({ ...s, errors: [], currentStep: Math.min(s.currentStep + 1, TOTAL_STEPS - 1) }))
  }, [state.currentStep, validateStep])

  const goBack = useCallback(() => {
    setState((s) => ({ ...s, errors: [], currentStep: Math.max(s.currentStep - 1, 0) }))
  }, [])

  const goToStep = useCallback((step: number) => {
    setState((s) => ({ ...s, errors: [], currentStep: Math.max(0, Math.min(step, TOTAL_STEPS - 1)) }))
  }, [])

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))
    eventService.listEvents()
      .then((events) => {
        if (cancelled) return
        setState((s) => ({
          ...s,
          loading: false,
          events,
          drafts: events.filter((event) => event.status === 'draft').map(mapEventToDraft),
          completedBriefs: mapCompletedBriefs(events)
        }))
      })
      .catch((err) => {
        if (cancelled) return
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load events.'
        }))
      })
    return () => { cancelled = true }
  }, [])

  const refreshEvents = useCallback(async () => {
    try {
      const events = await eventService.listEvents()
      setState((s) => ({
        ...s,
        events,
        error: null,
        drafts: events.filter((event) => event.status === 'draft').map(mapEventToDraft),
        completedBriefs: mapCompletedBriefs(events)
      }))
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Failed to refresh events.'
      }))
    }
  }, [])

  const saveDraft = useCallback(() => {
    const payload = {
      title: state.form.title.trim() || `${state.form.eventType} planning draft`,
      eventDate: state.form.eventDate || new Date().toISOString().slice(0, 10),
      venue: state.form.venue.trim() || 'TBD',
      budget: Number(state.form.budget) || 0,
      expectedGuests: Number(state.form.guests) || 1,
      status: 'draft' as const
    }

    const request = state.draftEventId
      ? eventService.updateEvent(state.draftEventId, payload)
      : eventService.createEvent(payload)

    request
      .then((created) => {
        setState((s) => ({
          ...s,
          draftEventId: created.id,
          drafts: [mapEventToDraft(created), ...s.drafts.filter((draft) => draft.id !== created.id)],
          errors: []
        }))
        void refreshEvents()
        window.dispatchEvent(new CustomEvent('eventify:dashboard-refresh'))
      })
      .catch((err) => {
        setState((s) => ({
          ...s,
          error: err instanceof Error ? err.message : 'Failed to save draft.'
        }))
      })
  }, [state.form, state.draftEventId])

  const loadDraft = useCallback((draftId?: string) => {
    if (draftId) {
      eventService.getEvent(draftId).then((event) => {
        setState((s) => ({
          ...s,
          form: {
            ...s.form,
            title: event.title,
            venue: event.venue,
            eventDate: event.event_date,
            budget: String(event.budget),
            guests: String(event.expected_guests)
          },
          draftEventId: event.id,
          currentStep: 0,
          errors: []
        }))
      }).catch((err) => {
        setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Failed to load draft.' }))
      })
      return
    }

    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      const form = JSON.parse(saved) as PlanEventFormState
      setState((s) => ({ ...s, form, errors: [] }))
    }
  }, [])

  const clearDraft = useCallback(async (draftId?: string) => {
    if (draftId) {
      try {
        await eventService.deleteEvent(draftId)
        setState((s) => ({
          ...s,
          drafts: s.drafts.filter((draft) => draft.id !== draftId),
          draftEventId: s.draftEventId === draftId ? null : s.draftEventId,
          error: null
        }))
        window.dispatchEvent(new CustomEvent('eventify:dashboard-refresh'))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete draft.'
        if (message.includes('EVENT_NOT_FOUND') || message.includes('Event not found') || message.includes('404')) {
          setState((s) => ({
            ...s,
            drafts: s.drafts.filter((draft) => draft.id !== draftId),
            draftEventId: s.draftEventId === draftId ? null : s.draftEventId,
            error: null
          }))
          void refreshEvents()
          window.dispatchEvent(new CustomEvent('eventify:dashboard-refresh'))
          return
        }

        setState((s) => ({ ...s, error: 'Failed to delete draft.' }))
      }
      return
    }

    sessionStorage.removeItem(STORAGE_KEY)
  }, [refreshEvents])

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null, errors: [] }))

    try {
      const f = state.form
      const validationErrors = validateStep(5)
      if (validationErrors.length > 0) {
        setState((s) => ({ ...s, submitting: false, errors: validationErrors }))
        return
      }

      const normalizedEventDate = normalizeEventDate(f.eventDate)
      if (!normalizedEventDate) {
        setState((s) => ({ ...s, submitting: false, errors: ['Please enter a valid event date.'] }))
        return
      }

      const payload: EventSetupPayload = {
        title: f.title.trim() || `${eventTypeMeta.label} planning draft`,
        description: f.description.trim(),
        eventType: f.eventType,
        venue: f.venue.trim(),
        theme: f.theme.trim(),
        colorPalette: f.colorPalette.trim(),
        mood: f.mood.trim(),
        guests: Number(f.guests),
        budget: Number(f.budget),
        eventDate: f.eventDate,
        eventTime: f.eventTime,
        durationHours: Number(f.durationHours),
        eventDays: Number(f.eventDays),
        setupMode: f.setupMode,
        seating: f.seating,
        stageSetup: f.stageSetup,
        boothSetup: f.boothSetup,
        cateringNeeds: f.cateringNeeds,
        lightingNeeds: f.lightingNeeds,
        soundNeeds: f.soundNeeds,
        decorationNeeds: f.decorationNeeds,
        photographyNeeds: f.photographyNeeds,
        securityNeeds: f.securityNeeds,
        transportationNeeds: f.transportationNeeds,
        equipmentRentalNeeds: f.equipmentRentalNeeds,
        specialRequirements: f.specialRequirements,
        vendorNotes: f.vendorNotes,
        selectedServices: recommendedServices
      }

      const createdEvent = await eventService.createEvent({
        title: payload.title,
        eventDate: normalizedEventDate,
        venue: payload.venue || 'TBD',
        budget: payload.budget || 0,
        expectedGuests: payload.guests || 1,
        status: 'planning'
      })

      await Promise.all(
        payload.selectedServices.map((service) =>
          vendorService.createRequirement(createdEvent.id, {
            category: normalizeRequirementCategory(service),
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

      clearDraft()
      await refreshEvents()
      window.dispatchEvent(new CustomEvent('eventify:dashboard-refresh'))
      setState((s) => ({
        ...s,
        submitted: true,
        submitting: false,
        createdEventId: createdEvent.id,
        currentStep: TOTAL_STEPS - 1
      }))
    } catch (err) {
      setState((s) => ({
        ...s,
        submitting: false,
        error: err instanceof Error ? err.message : 'Failed to submit event. Please try again.',
      }))
    } finally {
      submittingRef.current = false
    }
  }, [state.form, eventTypeMeta.label, recommendedServices, clearDraft, refreshEvents])

  const reset = useCallback(() => {
    setState({
      currentStep: 0,
      form: INITIAL_FORM_STATE,
      events: state.events,
      drafts: state.drafts,
      completedBriefs: state.completedBriefs,
      draftEventId: null,
      errors: [],
      submitted: false,
      createdEventId: null,
      submitting: false,
      loading: false,
      error: null
    })
  }, [state.events, state.drafts, state.completedBriefs])

    return {
      currentStep: state.currentStep,
      form: state.form,
      errors: state.errors,
      submitted: state.submitted,
    submitting: state.submitting,
    loading: state.loading,
    error: state.error,
    createdEventId: state.createdEventId,
    eventTypeMeta,
    recommendedServices,
      progress,
      updateForm,
      toggleService,
      selectEventType,
      goNext,
    goBack,
    goToStep,
      saveDraft,
      loadDraft,
      clearDraft,
      handleSubmit,
      drafts: state.drafts,
      completedBriefs: state.completedBriefs,
      draftEventId: state.draftEventId,
      refreshEvents,
      reset,
    ...buildViewModelStateMeta({
      loading: state.loading,
      submitting: state.submitting,
      error: state.error,
      empty: false,
      loaded: !state.loading
    })
  }
}
