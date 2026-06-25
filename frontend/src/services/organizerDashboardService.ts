import { api } from './apiClient'
import type {
  DashboardEventPreview,
  DashboardDraft,
  DashboardVendorRequest,
  DashboardBooking,
  RecommendedVendorPreview,
  DashboardActivity,
  DashboardNotification,
} from '../features/organizer-dashboard/models/organizer-dashboard.model'

export interface DashboardSummary {
  totalEvents: number
  draftEvents: number
  activeVendorRequests: number
  pendingResponses: number
  acceptedBookings: number
  confirmedBookings: number
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
}
