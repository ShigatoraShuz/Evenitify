import { api } from './apiClient'

export interface EventBrief {
  id: string
  eventType: string
  eventName: string
  location: string
  eventDate: string
  startTime: string
  endTime: string
  guestCount: number
  budget: number
  selectedTheme: string
  setupStyle: string
  selectedVendorServices: string[]
  specialRequirements: string
  preferredPackageTier: string
  status: 'draft' | 'completed'
  createdAt: string
  updatedAt: string
}

export const eventBriefService = {
  async getAll(): Promise<EventBrief[]> {
    return api.get<EventBrief[]>('/organizer/event-briefs')
  },

  async getById(id: string): Promise<EventBrief> {
    return api.get<EventBrief>(`/organizer/event-briefs/${id}`)
  },
}
