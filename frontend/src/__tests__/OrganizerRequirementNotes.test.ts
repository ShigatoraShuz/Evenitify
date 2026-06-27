import { describe, expect, it } from 'vitest'
import { buildRequirementNotes } from '../features/organizer/plan-event/viewmodels/usePlanEventViewModel'
import { INITIAL_FORM_STATE, type PlanEventFormState } from '../features/organizer/plan-event/models/planEvent.model'

describe('organizer requirement notes', () => {
  it('emits the structured organizer brief and uses the explicit selected services', () => {
    const form: PlanEventFormState = {
      ...INITIAL_FORM_STATE,
      eventType: 'corporate',
      title: 'Leadership Summit',
      description: 'Quarterly leadership summit with breakout sessions.',
      theme: 'Clean corporate slate',
      colorPalette: 'Ivory + gold',
      mood: 'Professional, polished, and efficient',
      eventDate: '2026-06-27',
      eventTime: '18:30',
      durationHours: '6',
      eventDays: '1',
      setupMode: 'indoor',
      seating: 'Banquet',
      stageSetup: 'Panel stage',
      boothSetup: 'Single feature booth',
      cateringNeeds: 'Full-service catering with dietary handling.',
      lightingNeeds: 'Architectural wash lighting and focused stage spots.',
      soundNeeds: 'Distributed speakers and microphones.',
      decorationNeeds: 'Minimal branding and sculptural florals.',
      photographyNeeds: 'Editorial capture with same-day recap.',
      securityNeeds: 'Guest check-in and perimeter coverage.',
      transportationNeeds: 'Shuttle support for VIP arrivals.',
      equipmentRentalNeeds: 'Tables, chairs, lecterns, power distribution, and staging.',
      specialRequirements: 'Accessible routes and quiet room.',
      vendorNotes: 'Prioritize vendors with premium presentation.',
      selectedServices: ['Catering', 'Photography']
    }

    const notes = buildRequirementNotes(form, 'Corporate event', form.selectedServices, 'Catering')

    const expectedLabels = [
      'Event type',
      'Description',
      'Theme',
      'Color palette',
      'Mood',
      'Setup mode',
      'Event date',
      'Event time',
      'Duration',
      'Days',
      'Seating',
      'Stage setup',
      'Booth setup',
      'Services',
      'Service focus',
      'Special requirements',
      'Vendor notes'
    ]

    expectedLabels.forEach((label) => {
      expect(notes).toContain(`${label}:`)
    })

    expect(notes).toContain('Setup mode: Indoor')
    expect(notes).toContain('Services: Catering, Photography')
    expect(notes).not.toContain('Event styling')
  })
})
