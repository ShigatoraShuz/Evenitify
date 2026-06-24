import { useState, useCallback, useRef, useMemo } from 'react'
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
  errors: string[]
  submitted: boolean
  createdEventId: string | null
  submitting: boolean
  loading: boolean
  error: string | null
}

export function usePlanEventViewModel() {
  const [state, setState] = useState<PlanEventViewModelState>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    const form = saved ? (JSON.parse(saved) as PlanEventFormState) : INITIAL_FORM_STATE
    return {
      currentStep: 0,
      form,
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

  const saveDraft = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.form))
    setState((s) => ({ ...s, errors: [] }))
  }, [state.form])

  const loadDraft = useCallback(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      const form = JSON.parse(saved) as PlanEventFormState
      setState((s) => ({ ...s, form, errors: [] }))
    }
  }, [])

  const clearDraft = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    setState((s) => ({ ...s, submitting: true, error: null, errors: [] }))

    try {
      const f = state.form
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

      clearDraft()
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
  }, [state.form, eventTypeMeta.label, recommendedServices, clearDraft])

  const reset = useCallback(() => {
    setState({
      currentStep: 0,
      form: INITIAL_FORM_STATE,
      errors: [],
      submitted: false,
      createdEventId: null,
      submitting: false,
      loading: false,
      error: null
    })
  }, [])

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
