export type EventStatus = 'draft' | 'planning' | 'booking' | 'confirmed' | 'completed' | 'cancelled' | 'active'

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
  eventName: string
  status: string
  requestedBudget?: number
  date?: string
  lastMessage: string
  lastUpdated: string
}

export interface DashboardBooking {
  id: string
  eventName: string
  vendorName: string
  category: string
  date: string
  timeSlot: string
  status: string
}

export interface RecommendedVendorPreview {
  id: string
  name: string
  category: string
  rating: number
  matchScore: number
  startingPrice: number
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

export const STATUS_COLORS_DASHBOARD: Record<string, string> = {
  sent: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  viewed: 'bg-purple-100 text-purple-700',
  quoted: 'bg-indigo-100 text-indigo-700',
  negotiating: 'bg-orange-100 text-orange-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  confirmed: 'bg-green-100 text-green-700',
  contract_pending: 'bg-violet-100 text-violet-700',
  draft: 'bg-slate-100 text-slate-700',
  planning: 'bg-blue-100 text-blue-700',
  booking: 'bg-purple-100 text-purple-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  active: 'bg-teal-100 text-teal-700',
}

export const STATUS_LABELS_DASHBOARD: Record<string, string> = {
  sent: 'Sent',
  pending: 'Pending',
  viewed: 'Viewed',
  quoted: 'Quoted',
  negotiating: 'Negotiating',
  accepted: 'Accepted',
  rejected: 'Rejected',
  confirmed: 'Confirmed',
  contract_pending: 'Contract Pending',
  draft: 'Draft',
  planning: 'Planning',
  booking: 'Booking',
  completed: 'Completed',
  cancelled: 'Cancelled',
  active: 'Active',
}
