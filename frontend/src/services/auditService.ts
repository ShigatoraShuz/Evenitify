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
  listActivities: async (scope: string): Promise<AuditActivity[]> => [
    {
      id: `${scope}-audit-1`,
      actorName: 'System',
      actorRole: 'system',
      action: 'Snapshot refreshed',
      target: scope,
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      detail: 'Frontend mock audit trail placeholder.'
    },
    {
      id: `${scope}-audit-2`,
      actorName: 'Admin Ops',
      actorRole: 'admin',
      action: 'Reviewed workflow',
      target: scope,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
    }
  ]
}
