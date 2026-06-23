import type { BookingWithDetails, EventPortfolio } from './eventService'

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

const PHASE8_CATEGORIES = ['Catering', 'Lights', 'Sounds', 'Venue', 'Photo/Video', 'Staff', 'Transport']

const bookingAmount = (booking: BookingWithDetails) => Number(booking.requested_budget) || 0

export const budgetService = {
  // Future endpoint: GET /events/:eventId/budget-center
  getBudgetSummary: async (portfolio: EventPortfolio): Promise<BudgetSummary> => {
    const totalBudget = Number(portfolio.event.budget) || 0
    const allocatedVendorBudget = portfolio.requirements.reduce((sum, requirement) => sum + (Number(requirement.max_budget) || 0), 0)
    const acceptedBookingTotal = portfolio.bookings
      .filter((booking) => ['accepted', 'confirmed', 'completed', 'contract_sent'].includes(booking.status))
      .reduce((sum, booking) => sum + bookingAmount(booking), 0)
    const pendingBookingTotal = portfolio.bookings
      .filter((booking) => booking.status === 'pending' || booking.status === 'changes_requested')
      .reduce((sum, booking) => sum + bookingAmount(booking), 0)
    const estimatedSpending = acceptedBookingTotal + pendingBookingTotal
    const remainingBudget = totalBudget - estimatedSpending

    const categoryBreakdown = PHASE8_CATEGORIES.map((category) => {
      const requirementAllocated = portfolio.requirements
        .filter((requirement) => requirement.category.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(requirement.category.toLowerCase()))
        .reduce((sum, requirement) => sum + (Number(requirement.max_budget) || 0), 0)
      const categoryBookings = portfolio.bookings.filter((booking) => {
        const bookingCategory = booking.event_requirements?.category || ''
        return bookingCategory.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(bookingCategory.toLowerCase())
      })
      const accepted = categoryBookings
        .filter((booking) => ['accepted', 'confirmed', 'completed', 'contract_sent'].includes(booking.status))
        .reduce((sum, booking) => sum + bookingAmount(booking), 0)
      const pending = categoryBookings
        .filter((booking) => booking.status === 'pending' || booking.status === 'changes_requested')
        .reduce((sum, booking) => sum + bookingAmount(booking), 0)

      return {
        category,
        allocated: requirementAllocated,
        accepted,
        pending,
        estimated: accepted + pending
      }
    })

    return {
      totalBudget,
      allocatedVendorBudget,
      estimatedSpending,
      acceptedBookingTotal,
      pendingBookingTotal,
      remainingBudget,
      overBudget: remainingBudget < 0,
      categoryBreakdown
    }
  }
}

