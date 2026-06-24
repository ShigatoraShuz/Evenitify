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
    api.get<BookingMessage[]>(`/bookings/${encodeURIComponent(bookingId)}/messages`)
}
