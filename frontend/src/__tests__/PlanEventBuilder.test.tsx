import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ComponentProps, ReactNode } from 'react'
import { EventTypeGrid } from '../features/organizer/plan-event/components/EventTypeGrid'
import { VenueSuggestionGrid } from '../features/organizer/plan-event/components/VenueSuggestionGrid'
import { VendorServiceGrid } from '../features/organizer/plan-event/components/VendorServiceGrid'
import { OrganizerPlanEventView } from '../features/organizer/plan-event/views/OrganizerPlanEventView'
import {
  EVENT_TYPE_OPTIONS,
  INITIAL_FORM_STATE,
  STEP_LABELS,
  type PlanEventFormState
} from '../features/organizer/plan-event/models/planEvent.model'

vi.mock('../shared/components/DashboardShell', () => ({
  DashboardShell: ({ children }: { children: ReactNode }) => <>{children}</>
}))

const baseForm: PlanEventFormState = {
  ...INITIAL_FORM_STATE,
  eventType: 'corporate',
  venue: 'Grand ballroom',
  title: 'Summit 2026',
  description: 'Quarterly leadership summit with breakout sessions.',
  theme: 'Clean corporate slate',
  colorPalette: 'Ivory + gold',
  mood: 'Professional, polished, and efficient',
  guests: '500',
  budget: '150000',
  eventDate: '2026-10-21',
  eventTime: '18:30',
  durationHours: '6',
  eventDays: '1',
  selectedServices: ['Catering', 'Event styling']
}

const viewProps: ComponentProps<typeof OrganizerPlanEventView> = {
  currentStep: 1,
  form: baseForm,
  drafts: [],
  completedBriefs: [],
  loading: false,
  error: null,
  errors: [],
  submitted: false,
  submitting: false,
  createdEventId: null,
  eventTypeMeta: EVENT_TYPE_OPTIONS[2],
  recommendedServices: ['Catering', 'Event styling'],
  progress: 29,
  onUpdateForm: vi.fn(),
  onToggleService: vi.fn(),
  onSelectEventType: vi.fn(),
  onGoNext: vi.fn(),
  onGoBack: vi.fn(),
  onSubmit: vi.fn(),
  onSaveDraft: vi.fn(),
  onReset: vi.fn(),
  onContinueDraft: vi.fn(),
  onEditDraft: vi.fn(),
  onDeleteDraft: vi.fn()
}

describe('Plan event visuals', () => {
  it('renders image-backed event type cards with selected state', () => {
    render(<EventTypeGrid selected="corporate" onSelect={vi.fn()} />)

    expect(screen.getAllByRole('img')).toHaveLength(EVENT_TYPE_OPTIONS.length)
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent('Corporate event')
    expect(screen.getByRole('img', { name: /corporate team gathered around a conference table/i })).toBeInTheDocument()
  })

  it('renders image-backed venue tiles with selected state', () => {
    render(<VenueSuggestionGrid selectedVenue="Rooftop venue" onSelect={vi.fn()} />)

    expect(screen.getAllByRole('img')).toHaveLength(6)
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent('Rooftop venue')
    expect(screen.getByRole('img', { name: /city skyline at dusk/i })).toBeInTheDocument()
  })

  it('renders image-backed vendor service cards with selected state', () => {
    render(<VendorServiceGrid selectedServices={['Catering', 'Event styling']} onToggleService={vi.fn()} />)

    expect(screen.getAllByRole('img')).toHaveLength(16)
    const selectedButtons = screen.getAllByRole('button', { pressed: true })
    expect(selectedButtons).toHaveLength(2)
    expect(selectedButtons[0]).toHaveTextContent('Catering')
    expect(screen.getByRole('img', { name: /catering table with plated dishes/i })).toBeInTheDocument()
  })

  it('renders the compact plan page with the full step rail and navigation controls', () => {
    render(
      <MemoryRouter>
        <OrganizerPlanEventView {...viewProps} currentStep={1} />
      </MemoryRouter>
    )

    STEP_LABELS.forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    })
    expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByText('Venue framing')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /elegant ballroom venue with chandeliers and rows of tables/i })).toBeInTheDocument()
  })
})
