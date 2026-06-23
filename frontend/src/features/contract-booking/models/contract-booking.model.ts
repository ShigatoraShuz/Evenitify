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

export type ContractStatus =
  | 'draft'
  | 'sent'
  | 'organizer_signed'
  | 'vendor_signed'
  | 'signed'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'expired'

export interface Contract {
  id: string
  bookingId: string
  contractNumber: string | null
  contractUrl: string | null
  storagePath: string | null
  contractStatus: ContractStatus
  termsSummary: string | null
  sentAt: string | null
  organizerSignedAt: string | null
  vendorSignedAt: string | null
  signedAt: string | null
  finalStatus: string | null
  statusHistory?: ContractStatusHistory[]
}

export interface ContractStatusHistory {
  id: string
  contractId: string
  previousStatus: string | null
  newStatus: string
  reason: string | null
  createdAt: string
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

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  organizer_signed: 'Organizer Signed',
  vendor_signed: 'Vendor Signed',
  signed: 'Signed',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  expired: 'Expired'
}

export const CONTRACT_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['organizer_signed', 'cancelled'],
  organizer_signed: ['vendor_signed', 'cancelled'],
  vendor_signed: ['active', 'cancelled'],
  signed: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  rejected: [],
  expired: []
}
