import { api } from './apiClient'

export type BookingMessageType = 'organizer_message' | 'vendor_message' | 'admin_note' | 'system_update'

export interface BookingMessage {
  id: string
  bookingId: string
  type: BookingMessageType
  authorName: string
  body: string
  createdAt: string
}

export const communicationService = {
  listBookingMessages: async (bookingId: string): Promise<BookingMessage[]> =>
    api.get<BookingMessage[]>(`/bookings/${encodeURIComponent(bookingId)}/messages`),

  createBookingMessage: async (bookingId: string, body: string): Promise<BookingMessage> =>
    api.post<BookingMessage>(`/bookings/${encodeURIComponent(bookingId)}/messages`, { body }),

  listVendorRequestMessages: async (requestId: string): Promise<BookingMessage[]> =>
    api.get<BookingMessage[]>(`/vendor/requests/${encodeURIComponent(requestId)}/messages`),

  createVendorRequestMessage: async (requestId: string, body: string): Promise<BookingMessage> =>
    api.post<BookingMessage>(`/vendor/requests/${encodeURIComponent(requestId)}/messages`, { body })
}
