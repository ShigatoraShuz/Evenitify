import { api } from './apiClient'

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

export const planningService = {
  getEventPlanningTimeline: async (eventId: string): Promise<EventPlanningTimeline> =>
    api.get<EventPlanningTimeline>(`/events/${eventId}/planning-timeline`)
}

