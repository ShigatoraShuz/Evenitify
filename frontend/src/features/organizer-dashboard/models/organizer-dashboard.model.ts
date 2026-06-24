export type EventStatus = 'draft' | 'planning' | 'booking' | 'confirmed' | 'completed' | 'cancelled' | 'active'

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
  cancelled: 'Cancelled',
  active: 'Active'
}

export interface DashboardEventPreview {
  id: string
  name: string
  eventType: string
  status: EventStatus
  progress: number
  date: string
  location: string
  guestCount: number
  budget: number
}

export interface DashboardDraft {
  id: string
  name: string
  eventType: string
  lastEdited: string
  lastCompletedStep: number
  progress: number
}

export interface DashboardVendorRequest {
  id: string
  vendorName: string
  category: string
  status: string
  requestedBudget: number
  date: string
  eventName: string
  lastMessage: string
  lastUpdated: string
}

export interface DashboardBooking {
  id: string
  vendorName: string
  category: string
  status: string
  eventTitle: string
  eventDate: string
  eventName: string
  date: string
  timeSlot: string
}

export interface RecommendedVendorPreview {
  id: string
  name: string
  category: string
  rating: number
  startingPrice: number
  matchScore: number
}

export interface DashboardActivity {
  id: string
  type: string
  description: string
  timestamp: string
}

export interface DashboardNotification {
  id: string
  type: string
  description: string
  linkTo: string
}

export const STATUS_LABELS_DASHBOARD: Record<string, string> = {
  draft: 'Draft',
  planning: 'Planning',
  booking: 'Booking',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  active: 'Active'
}

export const STATUS_COLORS_DASHBOARD: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  planning: 'bg-blue-100 text-blue-700',
  booking: 'bg-purple-100 text-purple-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  active: 'bg-teal-100 text-teal-700'
}
