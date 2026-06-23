export type EventStatus = 'draft' | 'planning' | 'booking' | 'confirmed' | 'completed' | 'cancelled'

export interface LargeEvent {
  id: string
  organizerId: string
  title: string
  eventDate: string
  venue: string
  budget: number
  expectedGuests: number
  status: EventStatus
}

export interface LargeEventForm {
  title: string
  eventDate: string
  venue: string
  budget: number
  expectedGuests: number
}

export const DEFAULT_EVENT_FORM: LargeEventForm = {
  title: '',
  eventDate: '',
  venue: '',
  budget: 0,
  expectedGuests: 0
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Draft',
  planning: 'Planning',
  booking: 'Booking',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled'
}
