import { api } from './apiClient'

export interface VendorTrackingRequest {
  id: string
  vendorName: string
  vendorCategory: string
  eventName: string
  eventDate: string | null
  location: string | null
  status: string
  quotedPrice: number | null
  packageName: string | null
  selectedDate: string | null
  selectedTimeSlot: string | null
  lastMessage: string
  lastUpdatedAt: string
  createdAt: string
}

export interface VendorTrackingMessage {
  id: string
  requestId: string
  senderId: string
  senderName: string
  text: string
  timestamp: string
  isOrganizer: boolean
}

export interface VendorTrackingTimelineItem {
  id: string
  status: string
  label: string
  timestamp: string
  description: string
}

export const vendorTrackingService = {
  async getAll(): Promise<VendorTrackingRequest[]> {
    return api.get<VendorTrackingRequest[]>('/organizer/vendor-requests')
  },

  async getById(id: string): Promise<VendorTrackingRequest> {
    return api.get<VendorTrackingRequest>(`/organizer/vendor-requests/${id}`)
  },

  async getMessages(requestId: string): Promise<VendorTrackingMessage[]> {
    return api.get<VendorTrackingMessage[]>(`/organizer/vendor-requests/${requestId}/messages`)
  },

  async sendMessage(requestId: string, text: string): Promise<VendorTrackingMessage> {
    return api.post<VendorTrackingMessage>(`/organizer/vendor-requests/${requestId}/messages`, { body: text })
  },

  async acceptOffer(requestId: string): Promise<VendorTrackingRequest> {
    return api.patch<VendorTrackingRequest>(`/organizer/vendor-requests/${requestId}/accept`, {})
  },

  async rejectOffer(requestId: string, reason?: string): Promise<VendorTrackingRequest> {
    return api.patch<VendorTrackingRequest>(`/organizer/vendor-requests/${requestId}/reject`, { reason })
  },

  async confirmBooking(requestId: string): Promise<VendorTrackingRequest> {
    return api.patch<VendorTrackingRequest>(`/organizer/vendor-requests/${requestId}/confirm`, {})
  },

  async getTimeline(requestId: string): Promise<VendorTrackingTimelineItem[]> {
    return api.get<VendorTrackingTimelineItem[]>(`/organizer/vendor-requests/${requestId}/timeline`)
  },
}
