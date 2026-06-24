import { api } from './apiClient'

export interface RealtimeSnapshot {
  channel: string
  connected: boolean
  lastUpdatedAt: string
  pendingSyncCount: number
  source: 'api'
}

export const realtimeService = {
  getSnapshot: async (channel: string): Promise<RealtimeSnapshot> =>
    api.get<RealtimeSnapshot>(`/realtime/snapshot?channel=${encodeURIComponent(channel)}`)
}
