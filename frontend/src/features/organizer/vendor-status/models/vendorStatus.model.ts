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

export const MOCK_VENDOR_REQUESTS: VendorRequest[] = [
  { id: 'vr1', eventBriefId: 'evt-1', organizerId: 'org-1', vendorId: 'v1', vendorName: 'Elevate Events Co.', vendorCategory: 'Catering', eventName: 'Horizon Capital Summit', eventDate: '2026-08-15', location: 'New York, NY', status: 'sent', quotedPrice: null, packageName: null, lastMessage: 'Request sent. Waiting for vendor response.', lastUpdatedAt: '2026-06-24T10:30:00Z', createdAt: '2026-06-24T10:30:00Z' },
  { id: 'vr2', eventBriefId: 'evt-1', organizerId: 'org-1', vendorId: 'v2', vendorName: 'Stellar Sound & Light', vendorCategory: 'Lights and sounds', eventName: 'Horizon Capital Summit', eventDate: '2026-08-15', location: 'New York, NY', status: 'viewed', quotedPrice: null, packageName: null, lastMessage: 'Vendor has viewed your request.', lastUpdatedAt: '2026-06-24T14:20:00Z', createdAt: '2026-06-23T09:00:00Z' },
  { id: 'vr3', eventBriefId: 'evt-2', organizerId: 'org-1', vendorId: 'v3', vendorName: 'Bloom & Petal Florals', vendorCategory: 'Venue decoration', eventName: 'Summer Gala 2026', eventDate: '2026-07-20', location: 'Manhattan, NY', status: 'quoted', quotedPrice: 4500, packageName: 'Deluxe Package', lastMessage: 'Vendor sent a quote of $4,500 for the Deluxe Package.', lastUpdatedAt: '2026-06-22T16:45:00Z', createdAt: '2026-06-20T11:00:00Z' },
  { id: 'vr4', eventBriefId: 'evt-2', organizerId: 'org-1', vendorId: 'v4', vendorName: 'Capture The Moment Media', vendorCategory: 'Photography', eventName: 'Summer Gala 2026', eventDate: '2026-07-20', location: 'Manhattan, NY', status: 'accepted', quotedPrice: 4000, packageName: 'Premium Package', lastMessage: 'You accepted the quote. Booking confirmed.', lastUpdatedAt: '2026-06-21T11:15:00Z', createdAt: '2026-06-18T08:30:00Z' },
  { id: 'vr5', eventBriefId: 'evt-3', organizerId: 'org-1', vendorId: 'v5', vendorName: 'Premier Security Solutions', vendorCategory: 'Security', eventName: 'Tech Conference 2026', eventDate: '2026-09-10', location: 'Newark, NJ', status: 'rejected', quotedPrice: null, packageName: null, lastMessage: 'Vendor declined due to scheduling conflict.', lastUpdatedAt: '2026-06-19T09:30:00Z', createdAt: '2026-06-17T13:00:00Z' },
  { id: 'vr6', eventBriefId: 'evt-3', organizerId: 'org-1', vendorId: 'v6', vendorName: 'Gourmet Table Catering', vendorCategory: 'Catering', eventName: 'Tech Conference 2026', eventDate: '2026-09-10', location: 'Newark, NJ', status: 'negotiating', quotedPrice: 6500, packageName: 'Grand Package', lastMessage: 'Negotiating pricing. Vendor offered $6,500.', lastUpdatedAt: '2026-06-23T08:00:00Z', createdAt: '2026-06-16T10:00:00Z' },
  { id: 'vr7', eventBriefId: 'evt-4', organizerId: 'org-1', vendorId: 'v7', vendorName: 'EventStaff Pro', vendorCategory: 'Event staff', eventName: 'Annual Awards Night', eventDate: '2026-10-05', location: 'Philadelphia, PA', status: 'confirmed', quotedPrice: 3500, packageName: 'Premium Package', lastMessage: 'Booking confirmed. Contract signed.', lastUpdatedAt: '2026-06-15T14:00:00Z', createdAt: '2026-06-10T09:00:00Z' },
  { id: 'vr8', eventBriefId: 'evt-1', organizerId: 'org-1', vendorId: 'v9', vendorName: 'MegaStage Productions', vendorCategory: 'Stage production', eventName: 'Horizon Capital Summit', eventDate: '2026-08-15', location: 'New York, NY', status: 'contract_pending', quotedPrice: 12000, packageName: 'Production Package', lastMessage: 'Contract sent to vendor for signature.', lastUpdatedAt: '2026-06-24T12:00:00Z', createdAt: '2026-06-19T15:00:00Z' },
]

export const MOCK_MESSAGES: Record<string, VendorMessage[]> = {
  vr1: [
    { id: 'm1', requestId: 'vr1', senderId: 'org-1', senderRole: 'organizer', message: 'Hi, we are planning the Horizon Capital Summit for August 15. We need premium catering for 750 guests.', createdAt: '2026-06-24T10:30:00Z' },
    { id: 'm2', requestId: 'vr1', senderId: 'system', senderRole: 'system', message: 'Request sent to vendor. Awaiting response.', createdAt: '2026-06-24T10:30:05Z' },
  ],
  vr2: [
    { id: 'm3', requestId: 'vr2', senderId: 'org-1', senderRole: 'organizer', message: 'We need full AV setup including lighting and sound for a 750-person corporate event.', createdAt: '2026-06-23T09:00:00Z' },
    { id: 'm4', requestId: 'vr2', senderId: 'system', senderRole: 'system', message: 'Request sent to vendor.', createdAt: '2026-06-23T09:00:05Z' },
    { id: 'm5', requestId: 'vr2', senderId: 'system', senderRole: 'system', message: 'Vendor has viewed your request.', createdAt: '2026-06-24T14:20:00Z' },
  ],
  vr3: [
    { id: 'm6', requestId: 'vr3', senderId: 'org-1', senderRole: 'organizer', message: 'We need full floral decoration for a Summer Gala at a Manhattan venue. 300 guests expected.', createdAt: '2026-06-20T11:00:00Z' },
    { id: 'm7', requestId: 'vr3', senderId: 'system', senderRole: 'system', message: 'Request sent to vendor.', createdAt: '2026-06-20T11:00:05Z' },
    { id: 'm8', requestId: 'vr3', senderId: 'v3', senderRole: 'vendor', message: 'Thank you for your request! We can definitely accommodate. Our Deluxe Package at $4,500 includes full venue floral with a custom arch, centerpieces, and entry arrangements.', createdAt: '2026-06-21T10:30:00Z' },
    { id: 'm9', requestId: 'vr3', senderId: 'org-1', senderRole: 'organizer', message: 'That sounds great. Can you include the flower wall backdrop as well?', createdAt: '2026-06-21T14:00:00Z' },
    { id: 'm10', requestId: 'vr3', senderId: 'v3', senderRole: 'vendor', message: 'We can add the flower wall for an additional $1,500. Total would be $6,000 for the Deluxe Package with the backdrop.', createdAt: '2026-06-22T09:00:00Z' },
    { id: 'm11', requestId: 'vr3', senderId: 'system', senderRole: 'system', message: 'Vendor sent a quote of $4,500 for the Deluxe Package.', createdAt: '2026-06-22T16:45:00Z' },
  ],
  vr4: [
    { id: 'm12', requestId: 'vr4', senderId: 'org-1', senderRole: 'organizer', message: 'We need a photographer and videographer for our Summer Gala.', createdAt: '2026-06-18T08:30:00Z' },
    { id: 'm13', requestId: 'vr4', senderId: 'system', senderRole: 'system', message: 'Request sent to vendor.', createdAt: '2026-06-18T08:30:05Z' },
    { id: 'm14', requestId: 'vr4', senderId: 'v4', senderRole: 'vendor', message: 'Wed love to cover your event! Our Premium Package at $4,000 includes 8 hours of dual photography and videography coverage.', createdAt: '2026-06-19T10:00:00Z' },
    { id: 'm15', requestId: 'vr4', senderId: 'org-1', senderRole: 'organizer', message: 'Perfect, let us proceed with the Premium Package.', createdAt: '2026-06-20T09:00:00Z' },
    { id: 'm16', requestId: 'vr4', senderId: 'system', senderRole: 'system', message: 'You accepted the quote. Booking confirmed.', createdAt: '2026-06-21T11:15:00Z' },
  ],
  vr5: [
    { id: 'm17', requestId: 'vr5', senderId: 'org-1', senderRole: 'organizer', message: 'We need security staff for a tech conference with 2,000 attendees.', createdAt: '2026-06-17T13:00:00Z' },
    { id: 'm18', requestId: 'vr5', senderId: 'system', senderRole: 'system', message: 'Request sent to vendor.', createdAt: '2026-06-17T13:00:05Z' },
    { id: 'm19', requestId: 'vr5', senderId: 'v5', senderRole: 'vendor', message: 'Unfortunately, we have a scheduling conflict on September 10. We cannot take this booking.', createdAt: '2026-06-19T09:30:00Z' },
    { id: 'm20', requestId: 'vr5', senderId: 'system', senderRole: 'system', message: 'Vendor declined due to scheduling conflict.', createdAt: '2026-06-19T09:30:05Z' },
  ],
  vr6: [
    { id: 'm21', requestId: 'vr6', senderId: 'org-1', senderRole: 'organizer', message: 'We need catering for a 3-day tech conference with 1,500 attendees daily.', createdAt: '2026-06-16T10:00:00Z' },
    { id: 'm22', requestId: 'vr6', senderId: 'system', senderRole: 'system', message: 'Request sent to vendor.', createdAt: '2026-06-16T10:00:05Z' },
    { id: 'm23', requestId: 'vr6', senderId: 'v6', senderRole: 'vendor', message: 'Our Grand Package at $6,500 covers plated dinner service for up to 250 guests per service. For 1,500 attendees we would recommend our Luxe Package at $11,000 with multiple service stations.', createdAt: '2026-06-17T14:00:00Z' },
    { id: 'm24', requestId: 'vr6', senderId: 'org-1', senderRole: 'organizer', message: 'Our budget is around $8,000 for catering. Can we customize a package?', createdAt: '2026-06-18T11:00:00Z' },
    { id: 'm25', requestId: 'vr6', senderId: 'v6', senderRole: 'vendor', message: 'We can work with that. Let me propose a custom menu for $7,800 that covers buffet-style service for all three days.', createdAt: '2026-06-20T09:30:00Z' },
    { id: 'm26', requestId: 'vr6', senderId: 'system', senderRole: 'system', message: 'Negotiating pricing. Vendor offered $6,500.', createdAt: '2026-06-23T08:00:00Z' },
  ],
  vr7: [
    { id: 'm27', requestId: 'vr7', senderId: 'org-1', senderRole: 'organizer', message: 'We need event staff for our Annual Awards Night. 1,000 guests expected.', createdAt: '2026-06-10T09:00:00Z' },
    { id: 'm28', requestId: 'vr7', senderId: 'system', senderRole: 'system', message: 'Request sent to vendor.', createdAt: '2026-06-10T09:00:05Z' },
    { id: 'm29', requestId: 'vr7', senderId: 'v7', senderRole: 'vendor', message: 'Our Premium Package at $3,500 includes a full crew of 12 staff with a supervisor for the full day. Perfect for your event size.', createdAt: '2026-06-11T10:00:00Z' },
    { id: 'm30', requestId: 'vr7', senderId: 'org-1', senderRole: 'organizer', message: 'Lets go with the Premium Package.', createdAt: '2026-06-12T09:00:00Z' },
    { id: 'm31', requestId: 'vr7', senderId: 'system', senderRole: 'system', message: 'You accepted the quote. Booking confirmed.', createdAt: '2026-06-12T09:00:05Z' },
    { id: 'm32', requestId: 'vr7', senderId: 'system', senderRole: 'system', message: 'Booking confirmed. Contract signed.', createdAt: '2026-06-15T14:00:00Z' },
  ],
  vr8: [
    { id: 'm33', requestId: 'vr8', senderId: 'org-1', senderRole: 'organizer', message: 'We need a full stage production setup for a corporate summit. 750 attendees.', createdAt: '2026-06-19T15:00:00Z' },
    { id: 'm34', requestId: 'vr8', senderId: 'system', senderRole: 'system', message: 'Request sent to vendor.', createdAt: '2026-06-19T15:00:05Z' },
    { id: 'm35', requestId: 'vr8', senderId: 'v9', senderRole: 'vendor', message: 'Our Production Package at $12,000 includes full stage build, LED video wall, rigging, and on-site production team. This would be ideal for your summit.', createdAt: '2026-06-20T11:00:00Z' },
    { id: 'm36', requestId: 'vr8', senderId: 'org-1', senderRole: 'organizer', message: 'Looks good. Please send the contract for review.', createdAt: '2026-06-22T10:00:00Z' },
    { id: 'm37', requestId: 'vr8', senderId: 'system', senderRole: 'system', message: 'Contract sent to vendor for signature.', createdAt: '2026-06-24T12:00:00Z' },
  ],
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

export const STATUS_COLORS_VENDOR: Record<VendorRequestStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  sent: 'bg-blue-100 text-blue-800',
  pending: 'bg-amber-100 text-amber-800',
  viewed: 'bg-indigo-100 text-indigo-800',
  quoted: 'bg-purple-100 text-purple-800',
  negotiating: 'bg-orange-100 text-orange-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  contract_pending: 'bg-violet-100 text-violet-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
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
