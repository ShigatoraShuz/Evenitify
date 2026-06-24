import { api } from './apiClient'

export interface CategoryBudgetSummary {
  category: string
  allocated: number
  accepted: number
  pending: number
  estimated: number
}

export interface BudgetSummary {
  totalBudget: number
  allocatedVendorBudget: number
  estimatedSpending: number
  acceptedBookingTotal: number
  pendingBookingTotal: number
  remainingBudget: number
  overBudget: boolean
  categoryBreakdown: CategoryBudgetSummary[]
}

export const budgetService = {
  getBudgetSummary: async (eventId: string): Promise<BudgetSummary> =>
    api.get<BudgetSummary>(`/events/${eventId}/budget-center`)
}

