import { api } from './apiClient'

export interface DashboardSummary {
  totalEvents: number
  draftEvents: number
  activeVendorRequests: number
  pendingResponses: number
  acceptedBookings: number
  confirmedBookings: number
}

export interface DashboardEventPreview {
  id: string
  name: string
  eventType: string
  date: string
  location: string
  guestCount?: number
  budget: number
  status: 'active' | 'planning' | 'completed'
  progress?: number
}

export interface DashboardDraft {
  id: string
  name: string
  eventType: string
  lastEdited: string
  progress: number
  lastCompletedStep: string
}

export interface DashboardVendorRequest {
  id: string
  vendorName: string
  category: string
  eventName: string
  status: string
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

export interface OrganizerDashboardPayload {
  summary: DashboardSummary
  events: DashboardEventPreview[]
  drafts: DashboardDraft[]
  vendorRequests: DashboardVendorRequest[]
  bookings: DashboardBooking[]
  recommendedVendors: RecommendedVendorPreview[]
  activities: DashboardActivity[]
  notifications: DashboardNotification[]
}

export const organizerDashboardService = {
  async getDashboardData(): Promise<OrganizerDashboardPayload> {
    return api.get<OrganizerDashboardPayload>('/organizer/dashboard')
  },

  async getSummary(): Promise<DashboardSummary> {
    return api.get<DashboardSummary>('/organizer/dashboard/summary')
  },

  async getEvents(): Promise<DashboardEventPreview[]> {
    return api.get<DashboardEventPreview[]>('/organizer/dashboard/events')
  },

  async getDrafts(): Promise<DashboardDraft[]> {
    return api.get<DashboardDraft[]>('/organizer/dashboard/drafts')
  },

  async getVendorRequests(): Promise<DashboardVendorRequest[]> {
    return api.get<DashboardVendorRequest[]>('/organizer/dashboard/vendor-requests')
  },

  async getBookings(): Promise<DashboardBooking[]> {
    return api.get<DashboardBooking[]>('/organizer/dashboard/bookings')
  },

  async getRecommendedVendors(): Promise<RecommendedVendorPreview[]> {
    return api.get<RecommendedVendorPreview[]>('/organizer/dashboard/recommended-vendors')
  },

  async getActivities(): Promise<DashboardActivity[]> {
    return api.get<DashboardActivity[]>('/organizer/dashboard/activities')
  },

  async getNotifications(): Promise<DashboardNotification[]> {
    return api.get<DashboardNotification[]>('/organizer/dashboard/notifications')
  },
}
