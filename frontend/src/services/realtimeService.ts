export interface RealtimeSnapshot {
  channel: string
  connected: boolean
  lastUpdatedAt: string
  pendingSyncCount: number
  source: 'mock' | 'api'
}

export const realtimeService = {
  getSnapshot: async (channel: string): Promise<RealtimeSnapshot> => ({
    channel,
    connected: true,
    lastUpdatedAt: new Date().toISOString(),
    pendingSyncCount: 0,
    source: 'mock'
  })
}
