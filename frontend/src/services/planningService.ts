import type { EventPortfolio } from './eventService'

export type PlanningMilestoneStatus = 'complete' | 'at_risk' | 'upcoming' | 'blocked'
export type PlanningMilestoneType = 'event_date' | 'booking_deadline' | 'contract_due' | 'requirement_due' | 'vendor_action'

export interface PlanningMilestone {
  id: string
  title: string
  description: string
  dueDate: string
  type: PlanningMilestoneType
  status: PlanningMilestoneStatus
  ownerLabel: string
}

export interface CalendarPreviewDay {
  date: string
  label: string
  items: number
  status: PlanningMilestoneStatus
}

export interface EventPlanningTimeline {
  milestones: PlanningMilestone[]
  calendarDays: CalendarPreviewDay[]
  nextDeadline: PlanningMilestone | null
}

const addDays = (isoDate: string, days: number) => {
  const date = new Date(isoDate)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

const pickStatus = (dueDate: string, complete: boolean): PlanningMilestoneStatus => {
  if (complete) return 'complete'
  const daysAway = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86_400_000)
  if (daysAway < 0) return 'blocked'
  if (daysAway <= 7) return 'at_risk'
  return 'upcoming'
}

export const planningService = {
  // Future endpoint: GET /events/:eventId/planning-timeline
  getEventPlanningTimeline: async (portfolio: EventPortfolio): Promise<EventPlanningTimeline> => {
    const eventDate = portfolio.event.event_date
    const requirementMilestones = portfolio.requirements.map((requirement, index) => {
      const dueDate = addDays(eventDate, -42 + index * 3)
      return {
        id: `requirement-${requirement.id}`,
        title: `${requirement.category} requirement locked`,
        description: requirement.notes || `${requirement.quantity} vendor need ready for procurement.`,
        dueDate,
        type: 'requirement_due' as const,
        status: pickStatus(dueDate, requirement.requirement_status === 'fulfilled'),
        ownerLabel: 'Organizer'
      }
    })

    const bookingMilestones = portfolio.bookings.map((booking, index) => {
      const dueDate = addDays(eventDate, -28 + index * 2)
      const vendorName = booking.vendor_profiles?.business_name || 'Vendor'
      return {
        id: `booking-${booking.id}`,
        title: `${vendorName} booking response`,
        description: `${booking.event_requirements?.category || 'Service'} request is ${booking.status}.`,
        dueDate,
        type: 'booking_deadline' as const,
        status: pickStatus(dueDate, ['accepted', 'confirmed', 'completed'].includes(booking.status)),
        ownerLabel: vendorName
      }
    })

    const contractMilestones = portfolio.bookings.flatMap((booking, index) => {
      const contract = booking.contracts?.[0]
      if (!contract) return []
      const dueDate = contract.sent_at || addDays(eventDate, -18 + index)
      return [{
        id: `contract-${contract.id}`,
        title: `${booking.vendor_profiles?.business_name || 'Vendor'} contract due`,
        description: `Contract is ${contract.contract_status}.`,
        dueDate,
        type: 'contract_due' as const,
        status: pickStatus(dueDate, ['signed', 'active', 'completed'].includes(contract.contract_status)),
        ownerLabel: 'Organizer + Vendor'
      }]
    })

    const eventMilestone: PlanningMilestone = {
      id: `event-${portfolio.event.id}`,
      title: portfolio.event.title,
      description: `${portfolio.event.expected_guests.toLocaleString()} guests at ${portfolio.event.venue}.`,
      dueDate: eventDate,
      type: 'event_date',
      status: pickStatus(eventDate, portfolio.event.status === 'completed'),
      ownerLabel: 'Event day'
    }

    const milestones = [
      ...requirementMilestones,
      ...bookingMilestones,
      ...contractMilestones,
      eventMilestone
    ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    const nextDeadline = milestones.find((milestone) => milestone.status !== 'complete') || null
    const calendarDays = milestones.slice(0, 8).map((milestone) => ({
      date: milestone.dueDate,
      label: milestone.title,
      items: 1,
      status: milestone.status
    }))

    return { milestones, calendarDays, nextDeadline }
  }
}

