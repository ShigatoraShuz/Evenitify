import { api } from './apiClient'

export type AuditActorRole = 'organizer' | 'vendor' | 'admin' | 'system'

export interface AuditActivity {
  id: string
  actorName: string
  actorRole: AuditActorRole
  action: string
  target: string
  createdAt: string
  detail?: string
}

export const auditService = {
  listActivities: async (scope = ''): Promise<AuditActivity[]> => {
    const params = scope ? `?scope=${encodeURIComponent(scope)}` : ''
    return api.get<AuditActivity[]>(`/audit/activity${params}`)
  }
}
