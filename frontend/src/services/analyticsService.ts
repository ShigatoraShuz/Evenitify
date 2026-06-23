import type { AdminDashboardSummary } from '../features/admin-operations/models/admin-operations.model'

export interface AnalyticsMetric {
  label: string
  value: string
  helper: string
}

export interface StatusDistribution {
  label: string
  value: number
  tone: 'blue' | 'green' | 'amber' | 'rose' | 'slate'
}

export interface OperationalAnalytics {
  metrics: AnalyticsMetric[]
  bookingStatus: StatusDistribution[]
  vendorVerification: StatusDistribution[]
  contractStatus: StatusDistribution[]
  eventTimelineStage: StatusDistribution[]
  insights: string[]
}

const pct = (part: number, total: number) => `${total > 0 ? Math.round((part / total) * 100) : 0}%`

export const analyticsService = {
  // Future endpoint: GET /admin/analytics/operations
  getOperationalAnalytics: async (summary: AdminDashboardSummary): Promise<OperationalAnalytics> => {
    const bookingTotal = summary.pending_bookings + summary.accepted_bookings + summary.rejected_bookings + summary.confirmed_bookings + summary.completed_bookings + summary.cancelled_bookings
    const contractTotal = summary.draft_contracts + summary.active_contracts
    const vendorTotal = summary.total_vendors

    return {
      metrics: [
        { label: 'Active events', value: String(summary.total_events), helper: 'Total large events under operations review' },
        { label: 'Pending verifications', value: String(summary.pending_verifications), helper: 'Vendors waiting on admin review' },
        { label: 'Pending booking reviews', value: String(summary.pending_bookings), helper: 'Bookings needing organizer/vendor movement' },
        { label: 'Contract completion rate', value: pct(summary.active_contracts, contractTotal), helper: 'Active contracts over tracked contracts' },
        { label: 'Vendor acceptance rate', value: pct(summary.accepted_bookings + summary.confirmed_bookings + summary.completed_bookings, bookingTotal), helper: 'Accepted or later bookings over all bookings' },
        { label: 'Avg response time', value: '18h', helper: 'Mock placeholder until response timestamps are available' }
      ],
      bookingStatus: [
        { label: 'Pending', value: summary.pending_bookings, tone: 'amber' },
        { label: 'Accepted', value: summary.accepted_bookings, tone: 'blue' },
        { label: 'Confirmed', value: summary.confirmed_bookings, tone: 'green' },
        { label: 'Rejected', value: summary.rejected_bookings, tone: 'rose' },
        { label: 'Cancelled', value: summary.cancelled_bookings, tone: 'slate' }
      ],
      vendorVerification: [
        { label: 'Pending', value: summary.pending_verifications, tone: 'amber' },
        { label: 'Verified', value: Math.max(vendorTotal - summary.pending_verifications, 0), tone: 'green' }
      ],
      contractStatus: [
        { label: 'Draft', value: summary.draft_contracts, tone: 'slate' },
        { label: 'Active', value: summary.active_contracts, tone: 'green' }
      ],
      eventTimelineStage: [
        { label: 'Large events', value: summary.total_events, tone: 'blue' },
        { label: '500+ guests', value: summary.large_events_500plus, tone: 'green' }
      ],
      insights: [
        'Prioritize pending vendor verifications before peak procurement windows.',
        'Monitor pending bookings that have no contract activity after acceptance.',
        'Response time is a frontend placeholder until backend audit timestamps are available.'
      ]
    }
  }
}

