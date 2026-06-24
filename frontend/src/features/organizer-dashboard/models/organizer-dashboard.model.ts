export interface DashboardEventPreview {
  id: string
  name: string
  eventType: string
  date: string
  location: string
  guestCount: number
  budget: number
  progress: number
  status: 'draft' | 'planning' | 'active' | 'completed'
}

export interface DashboardDraft {
  id: string
  name: string
  eventType: string
  lastEdited: string
  lastCompletedStep: string
  progress: number
}

export interface DashboardVendorRequest {
  id: string
  vendorName: string
  category: string
  eventName: string
  status: 'sent' | 'pending' | 'viewed' | 'quoted' | 'negotiating' | 'accepted' | 'rejected' | 'confirmed' | 'contract_pending'
  lastMessage: string
  lastUpdated: string
}

export interface DashboardBooking {
  id: string
  eventName: string
  vendorName: string
  category: string
  date: string
  timeSlot: string
  status: 'accepted' | 'confirmed' | 'contract_pending'
}

export interface RecommendedVendorPreview {
  id: string
  name: string
  category: string
  rating: number
  matchScore: number
  startingPrice: number
}

export interface DashboardActivity {
  id: string
  type: 'request_sent' | 'vendor_accepted' | 'vendor_rejected' | 'new_message' | 'draft_updated' | 'booking_confirmed' | 'contract_pending'
  description: string
  timestamp: string
}

export interface DashboardNotification {
  id: string
  type: 'response_review' | 'confirm_booking' | 'unfinished_draft' | 'contract_pending'
  description: string
  linkTo: string
}

export const MOCK_EVENT_PREVIEWS: DashboardEventPreview[] = [
  { id: 'evt-1', name: 'Horizon Capital Summit', eventType: 'Corporate event', date: '2026-08-15', location: 'New York, NY', guestCount: 750, budget: 75000, progress: 100, status: 'active' },
  { id: 'evt-2', name: 'Summer Gala 2026', eventType: 'Corporate event', date: '2026-07-20', location: 'Manhattan, NY', guestCount: 300, budget: 45000, progress: 65, status: 'planning' },
  { id: 'evt-3', name: 'Tech Conference 2026', eventType: 'Conference', date: '2026-09-10', location: 'Newark, NJ', guestCount: 1500, budget: 120000, progress: 30, status: 'planning' },
  { id: 'evt-4', name: 'Annual Awards Night', eventType: 'Corporate event', date: '2026-10-05', location: 'Philadelphia, PA', guestCount: 1000, budget: 85000, progress: 100, status: 'active' },
]

export const MOCK_DRAFTS: DashboardDraft[] = [
  { id: 'draft-1', name: 'Product Launch Q3', eventType: 'Product launch', lastEdited: '2026-06-23T16:30:00Z', lastCompletedStep: 'Venue & Location', progress: 28 },
  { id: 'draft-2', name: 'Team Offsite 2026', eventType: 'Corporate event', lastEdited: '2026-06-22T11:00:00Z', lastCompletedStep: 'Event Details', progress: 42 },
  { id: 'draft-3', name: 'Untitled Event', eventType: 'Conference', lastEdited: '2026-06-21T09:15:00Z', lastCompletedStep: 'Event Type', progress: 14 },
]

export const MOCK_VENDOR_REQUESTS: DashboardVendorRequest[] = [
  { id: 'vr1', vendorName: 'Elevate Events Co.', category: 'Catering', eventName: 'Horizon Capital Summit', status: 'sent', lastMessage: 'Request sent. Waiting for vendor response.', lastUpdated: '2026-06-24T10:30:00Z' },
  { id: 'vr2', vendorName: 'Stellar Sound & Light', category: 'Lights and sounds', eventName: 'Horizon Capital Summit', status: 'viewed', lastMessage: 'Vendor has viewed your request.', lastUpdated: '2026-06-24T14:20:00Z' },
  { id: 'vr3', vendorName: 'Bloom & Petal Florals', category: 'Venue decoration', eventName: 'Summer Gala 2026', status: 'quoted', lastMessage: 'Vendor sent a quote of $4,500 for the Deluxe Package.', lastUpdated: '2026-06-22T16:45:00Z' },
  { id: 'vr4', vendorName: 'Capture The Moment Media', category: 'Photography', eventName: 'Summer Gala 2026', status: 'accepted', lastMessage: 'You accepted the quote. Booking confirmed.', lastUpdated: '2026-06-21T11:15:00Z' },
  { id: 'vr5', vendorName: 'Premier Security Solutions', category: 'Security', eventName: 'Tech Conference 2026', status: 'rejected', lastMessage: 'Vendor declined due to scheduling conflict.', lastUpdated: '2026-06-19T09:30:00Z' },
  { id: 'vr6', vendorName: 'Gourmet Table Catering', category: 'Catering', eventName: 'Tech Conference 2026', status: 'negotiating', lastMessage: 'Negotiating pricing. Vendor offered $6,500.', lastUpdated: '2026-06-23T08:00:00Z' },
  { id: 'vr7', vendorName: 'MegaStage Productions', category: 'Stage production', eventName: 'Horizon Capital Summit', status: 'contract_pending', lastMessage: 'Contract sent to vendor for signature.', lastUpdated: '2026-06-24T12:00:00Z' },
  { id: 'vr8', vendorName: 'EventStaff Pro', category: 'Event staff', eventName: 'Annual Awards Night', status: 'confirmed', lastMessage: 'Booking confirmed. Contract signed.', lastUpdated: '2026-06-15T14:00:00Z' },
]

export const MOCK_BOOKINGS: DashboardBooking[] = [
  { id: 'b1', eventName: 'Summer Gala 2026', vendorName: 'Bloom & Petal Florals', category: 'Venue decoration', date: '2026-07-20', timeSlot: '08:00 – 18:00', status: 'accepted' },
  { id: 'b2', eventName: 'Summer Gala 2026', vendorName: 'Capture The Moment Media', category: 'Photography', date: '2026-07-20', timeSlot: '16:00 – 23:00', status: 'accepted' },
  { id: 'b3', eventName: 'Horizon Capital Summit', vendorName: 'MegaStage Productions', category: 'Stage production', date: '2026-08-15', timeSlot: '06:00 – 22:00', status: 'contract_pending' },
  { id: 'b4', eventName: 'Annual Awards Night', vendorName: 'EventStaff Pro', category: 'Event staff', date: '2026-10-05', timeSlot: '14:00 – 23:00', status: 'confirmed' },
]

export const MOCK_RECOMMENDED_VENDORS: RecommendedVendorPreview[] = [
  { id: 'v1', name: 'Elevate Events Co.', category: 'Catering', rating: 4.8, matchScore: 94, startingPrice: 3200 },
  { id: 'v8', name: 'Prestige Event Design', category: 'Event styling', rating: 4.7, matchScore: 91, startingPrice: 2800 },
  { id: 'v11', name: 'Fresh Harvest Catering', category: 'Catering', rating: 4.5, matchScore: 87, startingPrice: 2500 },
]

export const MOCK_ACTIVITIES: DashboardActivity[] = [
  { id: 'a1', type: 'contract_pending', description: 'Contract sent to MegaStage Productions for Horizon Capital Summit', timestamp: '2026-06-24T12:00:00Z' },
  { id: 'a2', type: 'request_sent', description: 'Request sent to Elevate Events Co. for Horizon Capital Summit', timestamp: '2026-06-24T10:30:00Z' },
  { id: 'a3', type: 'new_message', description: 'New message from Bloom & Petal Florals regarding Summer Gala quote', timestamp: '2026-06-23T14:00:00Z' },
  { id: 'a4', type: 'vendor_rejected', description: 'Premier Security Solutions declined Tech Conference request', timestamp: '2026-06-19T09:30:00Z' },
  { id: 'a5', type: 'vendor_accepted', description: 'Capture The Moment Media accepted Summer Gala booking', timestamp: '2026-06-21T11:15:00Z' },
  { id: 'a6', type: 'booking_confirmed', description: 'EventStaff Pro confirmed for Annual Awards Night', timestamp: '2026-06-15T14:00:00Z' },
  { id: 'a7', type: 'draft_updated', description: 'Draft updated for Product Launch Q3', timestamp: '2026-06-23T16:30:00Z' },
]

export const MOCK_NOTIFICATIONS: DashboardNotification[] = [
  { id: 'n1', type: 'response_review', description: '2 vendor responses waiting for your review', linkTo: '/organizer/vendor-status' },
  { id: 'n2', type: 'confirm_booking', description: 'Bloom & Petal Florals quote is ready to accept', linkTo: '/organizer/vendor-status' },
  { id: 'n3', type: 'unfinished_draft', description: '3 draft events are still incomplete', linkTo: '/organizer/plan-event' },
  { id: 'n4', type: 'contract_pending', description: 'MegaStage Productions contract awaiting signature', linkTo: '/organizer/vendor-status' },
]

export const STATUS_LABELS_DASHBOARD: Record<string, string> = {
  sent: 'Sent',
  pending: 'Pending',
  viewed: 'Viewed',
  quoted: 'Quoted',
  negotiating: 'Negotiating',
  accepted: 'Accepted',
  rejected: 'Rejected',
  confirmed: 'Confirmed',
  contract_pending: 'Contract Pending',
}

export const STATUS_COLORS_DASHBOARD: Record<string, string> = {
  sent: 'bg-blue-100 text-blue-800',
  pending: 'bg-amber-100 text-amber-800',
  viewed: 'bg-indigo-100 text-indigo-800',
  quoted: 'bg-purple-100 text-purple-800',
  negotiating: 'bg-orange-100 text-orange-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  confirmed: 'bg-green-100 text-green-800',
  contract_pending: 'bg-violet-100 text-violet-800',
}
