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

export const STATUS_COLORS_DASHBOARD: Record<string, string> = {
  sent: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  viewed: 'bg-purple-100 text-purple-700',
  quoted: 'bg-indigo-100 text-indigo-700',
  negotiating: 'bg-orange-100 text-orange-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  confirmed: 'bg-green-100 text-green-700',
  contract_pending: 'bg-violet-100 text-violet-700',
}

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
