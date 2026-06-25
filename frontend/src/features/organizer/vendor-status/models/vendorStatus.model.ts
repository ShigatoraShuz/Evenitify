export type VendorRequestStatus =
  | 'draft'
  | 'sent'
  | 'pending'
  | 'viewed'
  | 'quoted'
  | 'negotiating'
  | 'accepted'
  | 'rejected'
  | 'contract_pending'
  | 'confirmed'
  | 'cancelled'

export interface VendorRequest {
  id: string
  eventBriefId: string
  organizerId: string
  vendorId: string
  vendorName: string
  vendorCategory: string
  eventName: string
  eventDate: string
  location: string
  status: VendorRequestStatus
  quotedPrice: number | null
  packageName: string | null
  lastMessage: string
  lastUpdatedAt: string
  createdAt: string
}

export interface VendorMessage {
  id: string
  requestId: string
  senderId: string
  senderRole: 'organizer' | 'vendor' | 'system'
  message: string
  createdAt: string
  attachmentUrl?: string
}

export interface VendorStatusTimelineItem {
  id: string
  status: VendorRequestStatus
  label: string
  timestamp: string
  description: string
  state: 'completed' | 'current' | 'upcoming'
}

export interface VendorStatusHistoryEntry {
  status: VendorRequestStatus
  timestamp: string
  description?: string
}

export const STATUS_COLORS_VENDOR: Record<VendorRequestStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  viewed: 'bg-purple-100 text-purple-700',
  quoted: 'bg-indigo-100 text-indigo-700',
  negotiating: 'bg-orange-100 text-orange-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  contract_pending: 'bg-violet-100 text-violet-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-slate-100 text-slate-700',
}

export const STATUS_LABELS: Record<VendorRequestStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  pending: 'Pending',
  viewed: 'Viewed',
  quoted: 'Quoted',
  negotiating: 'Negotiating',
  accepted: 'Accepted',
  rejected: 'Rejected',
  contract_pending: 'Contract Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
}

export function buildTimeline(status: VendorRequestStatus, history: VendorStatusHistoryEntry[] = []): VendorStatusTimelineItem[] {
  const ordered: Array<{ status: VendorRequestStatus; label: string; description: string }> = [
    { status: 'draft', label: 'Draft', description: 'Request drafted' },
    { status: 'sent', label: 'Sent', description: 'Request sent to vendor' },
    { status: 'viewed', label: 'Viewed', description: 'Vendor viewed your request' },
    { status: 'quoted', label: 'Quoted', description: 'Vendor sent a quote' },
    { status: 'negotiating', label: 'Negotiating', description: 'Negotiating terms and pricing' },
    { status: 'accepted', label: 'Accepted', description: 'Offer accepted' },
    { status: 'contract_pending', label: 'Contract Pending', description: 'Contract awaiting signature' },
    { status: 'confirmed', label: 'Confirmed', description: 'Booking confirmed' },
  ]
  const currentIndex = ordered.findIndex((item) => item.status === status)
  const historyByStatus = new Map(history.map((entry) => [entry.status, entry]))

  return ordered.map((item, index) => ({
    id: `tl-${index + 1}`,
    status: item.status,
    label: item.label,
    timestamp: historyByStatus.get(item.status)?.timestamp || '',
    description: historyByStatus.get(item.status)?.description || item.description,
    state: currentIndex === -1
      ? 'upcoming'
      : index < currentIndex
        ? 'completed'
        : index === currentIndex
          ? 'current'
          : 'upcoming',
  }))
}

export type StatusFilterTab = 'all' | 'pending' | 'negotiating' | 'accepted' | 'rejected' | 'confirmed'
