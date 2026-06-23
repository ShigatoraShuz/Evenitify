export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'changes_requested'
  | 'contract_sent'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export interface BookingRequest {
  id: string
  eventId: string
  requirementId: string
  vendorId: string
  organizerId: string
  status: BookingStatus
  requestedBudget: number | null
  notes: string | null
  requestedAt: string
}

export interface BookingFormInput {
  eventId: string
  requirementId: string
  vendorId: string
  notes?: string
  requestedBudget?: number
}

export interface Contract {
  id: string
  bookingId: string
  contractUrl: string | null
  storagePath: string | null
  contractStatus: 'draft' | 'sent' | 'signed' | 'rejected' | 'expired'
  sentAt: string | null
  signedAt: string | null
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  changes_requested: 'Changes Requested',
  contract_sent: 'Contract Sent',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled'
}
