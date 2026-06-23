import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { PageHeader } from '../../../shared/components/PageHeader'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EmptyState } from '../../../shared/components/EmptyState'
import type { AppNotification } from '../models/notifications.model'

interface NotificationsViewProps {
  notifications: AppNotification[]
  loading: boolean
  submitting: boolean
  error: string | null
  onLoadNotifications: () => Promise<void>
  onMarkAsRead: (notificationId: string) => Promise<void>
  onMarkAllAsRead: () => Promise<void>
  onClearError: () => void
}

export function NotificationsView({
  notifications,
  loading,
  submitting,
  error,
  onLoadNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearError
}: NotificationsViewProps) {
  const navigate = useNavigate()

  useEffect(() => { onLoadNotifications() }, [])

  return (
    <DashboardShell>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated on booking and contract activity"
        action={
          notifications.length > 0 ? (
            <Button variant="secondary" onClick={onMarkAllAsRead} loading={submitting}>
              Mark All as Read
            </Button>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={onClearError} className="text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl border p-4 transition-colors ${
                !notification.is_read ? 'border-brand-200 bg-brand-50/30' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notification.title}
                    </h4>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0" />
                    )}
                    {notification.priority === 'high' && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">High</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-1 line-clamp-2">{notification.message}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {notification.action_url && (
                    <Button
                      variant="ghost"
                      onClick={() => navigate(notification.action_url!)}
                    >
                      View
                    </Button>
                  )}
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      onClick={() => onMarkAsRead(notification.id)}
                      loading={submitting}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  )
}
