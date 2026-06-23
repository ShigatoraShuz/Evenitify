import type { AuditActivity } from '../../services/auditService'

export function AuditTimeline({ activities, emptyText = 'No activity yet.' }: { activities: AuditActivity[]; emptyText?: string }) {
  if (activities.length === 0) {
    return <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">{emptyText}</p>
  }
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-brand-500" />
            <div>
              <p className="text-sm text-slate-700">
                <span className="font-medium text-slate-900">{activity.actorName}</span> {activity.action} <span className="font-medium">{activity.target}</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">{new Date(activity.createdAt).toLocaleString()} | {activity.actorRole}</p>
              {activity.detail && <p className="mt-2 text-xs text-slate-500">{activity.detail}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
