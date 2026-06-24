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

export interface CreateEventBriefPayload {
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
}

export const eventBriefService = {
  async getAll(): Promise<EventBrief[]> {
    return api.get<EventBrief[]>('/organizer/event-briefs')
  },

  async getById(id: string): Promise<EventBrief> {
    return api.get<EventBrief>(`/organizer/event-briefs/${id}`)
  },

  async create(payload: CreateEventBriefPayload): Promise<EventBrief> {
    return api.post<EventBrief>('/organizer/event-briefs', payload)
  },

  async update(id: string, payload: Partial<CreateEventBriefPayload>): Promise<EventBrief> {
    return api.patch<EventBrief>(`/organizer/event-briefs/${id}`, payload)
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/organizer/event-briefs/${id}`)
  },
}
