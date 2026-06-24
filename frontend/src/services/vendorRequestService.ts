import { api } from './apiClient'

export interface VendorRequestPayload {
  eventBriefId: string
  vendorId: string
  packageName?: string
  selectedDate?: string
  selectedTimeSlot?: string
  message: string
}

export interface VendorInquiryPayload {
  vendorId: string
  message: string
}

export const vendorRequestService = {
  async sendBookingRequest(payload: VendorRequestPayload): Promise<{ id: string }> {
    return api.post<{ id: string }>('/vendor-requests', payload)
  },

  async sendGeneralInquiry(payload: VendorInquiryPayload): Promise<{ id: string }> {
    return api.post<{ id: string }>('/vendor-requests/inquiry', payload)
  },
}
