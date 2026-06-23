import { useNotifications } from '../viewmodels/useNotifications'
import { NotificationsView } from './NotificationsView'
import { useRealtimeSnapshot } from '../../../shared/hooks/useRealtimeSnapshot'

export default function NotificationsViewWrapper() {
  const vm = useNotifications()
  const realtime = useRealtimeSnapshot('notifications')

  return (
    <NotificationsView
      notifications={vm.notifications}
      grouped={vm.grouped}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      realtimeSnapshot={realtime.snapshot}
      realtimeRefreshing={realtime.refreshing}
      onLoadNotifications={vm.loadNotifications}
      onRefreshRealtime={realtime.refresh}
      onMarkAsRead={vm.markAsRead}
      onMarkAllAsRead={vm.markAllAsRead}
      onClearError={vm.clearError}
    />
  )
}
