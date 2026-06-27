import { api } from './apiClient'

export interface ContractDetail {
  id: string
  booking_id: string
  contract_number: string | null
  contract_url: string | null
  storage_path: string | null
  contract_status: ContractStatus
  terms_summary: string | null
  sent_at: string | null
  organizer_signed_at: string | null
  vendor_signed_at: string | null
  signed_at: string | null
  final_status: string | null
  created_at: string
  updated_at: string
  statusHistory?: ContractStatusHistory[]
}

export interface ContractStatusHistory {
  id: string
  contract_id: string
  previous_status: string | null
  new_status: string
  changed_by: string | null
  reason: string | null
  created_at: string
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

export const CONTRACT_STATUS_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
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

export const contractService = {
  createContract: (bookingId: string, payload?: { termsSummary?: string | null }) =>
    api.post<ContractDetail>(`/contracts/${bookingId}`, payload || {}),

  getContractByBooking: (bookingId: string) =>
    api.get<ContractDetail | null>(`/contracts/${bookingId}`),

  updateContractStatus: (contractId: string, payload: { status: string; reason?: string | null }) =>
    api.patch<ContractDetail>(`/contracts/${contractId}/status`, payload),

  completeContract: (contractId: string, reason?: string | null) =>
    api.patch<ContractDetail>(`/contracts/${contractId}/status`, { status: 'completed', reason }),

  signContractOrganizer: (contractId: string, payload: { termsAccepted: boolean }) =>
    api.patch<ContractDetail>(`/contracts/${contractId}/sign-organizer`, payload),

  signContractVendor: (contractId: string, payload: { termsAccepted: boolean }) =>
    api.patch<ContractDetail>(`/contracts/${contractId}/sign-vendor`, payload)
}
