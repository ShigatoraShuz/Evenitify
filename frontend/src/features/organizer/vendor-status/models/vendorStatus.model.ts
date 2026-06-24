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

export function buildTimeline(status: VendorRequestStatus): VendorStatusTimelineItem[] {
  const timeline: VendorStatusTimelineItem[] = []
  const now = new Date().toISOString()

  timeline.push({ id: 'tl-1', status: 'draft', label: 'Draft', timestamp: now, description: 'Request drafted' })
  timeline.push({ id: 'tl-2', status: 'sent', label: 'Sent', timestamp: now, description: 'Request sent to vendor' })

  if (status === 'sent') return timeline

  timeline.push({ id: 'tl-3', status: 'viewed', label: 'Viewed', timestamp: now, description: 'Vendor viewed your request' })
  if (status === 'viewed') return timeline

  timeline.push({ id: 'tl-4', status: 'quoted', label: 'Quoted', timestamp: now, description: 'Vendor sent a quote' })
  if (status === 'quoted') return timeline

  timeline.push({ id: 'tl-5', status: 'negotiating', label: 'Negotiating', timestamp: now, description: 'Negotiating terms and pricing' })
  if (status === 'negotiating') return timeline

  timeline.push({ id: 'tl-6', status: 'accepted', label: 'Accepted', timestamp: now, description: 'Offer accepted' })
  if (status === 'accepted') return timeline

  timeline.push({ id: 'tl-7', status: 'contract_pending', label: 'Contract Pending', timestamp: now, description: 'Contract awaiting signature' })
  if (status === 'contract_pending') return timeline

  timeline.push({ id: 'tl-8', status: 'confirmed', label: 'Confirmed', timestamp: now, description: 'Booking confirmed' })

  return timeline
}

export type StatusFilterTab = 'all' | 'pending' | 'accepted' | 'rejected' | 'confirmed'
