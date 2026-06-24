import { api } from './apiClient'

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

export const analyticsService = {
  getOperationalAnalytics: async (): Promise<OperationalAnalytics> =>
    api.get<OperationalAnalytics>('/admin/analytics/operations')
}
