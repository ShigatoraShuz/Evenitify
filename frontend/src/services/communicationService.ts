export type BookingMessageType = 'organizer_message' | 'vendor_message' | 'admin_note' | 'system_update'

export interface BookingMessage {
  id: string
  bookingId: string
  type: BookingMessageType
  authorName: string
  body: string
  createdAt: string
}

const now = Date.now()

export const communicationService = {
  // Future endpoint: GET /bookings/:bookingId/messages
  listBookingMessages: async (bookingId: string): Promise<BookingMessage[]> => [
    {
      id: `${bookingId}-msg-1`,
      bookingId,
      type: 'system_update',
      authorName: 'Eventify',
      body: 'Booking request created and routed to the vendor queue.',
      createdAt: new Date(now - 86_400_000).toISOString()
    },
    {
      id: `${bookingId}-msg-2`,
      bookingId,
      type: 'organizer_message',
      authorName: 'Organizer team',
      body: 'Please confirm crew size, setup window, and any access requirements for the venue.',
      createdAt: new Date(now - 43_200_000).toISOString()
    },
    {
      id: `${bookingId}-msg-3`,
      bookingId,
      type: 'vendor_message',
      authorName: 'Vendor operations',
      body: 'We can support the event window. Final equipment list will be attached with the contract.',
      createdAt: new Date(now - 21_600_000).toISOString()
    },
    {
      id: `${bookingId}-msg-4`,
      bookingId,
      type: 'admin_note',
      authorName: 'Operations',
      body: 'Internal note placeholder: monitor deadline and contract completion before event week.',
      createdAt: new Date(now - 10_800_000).toISOString()
    }
  ]
}

