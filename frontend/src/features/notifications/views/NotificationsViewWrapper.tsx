import { useNotifications } from '../viewmodels/useNotifications'
import { NotificationsView } from './NotificationsView'

export default function NotificationsViewWrapper() {
  const vm = useNotifications()

  return (
    <NotificationsView
      notifications={vm.notifications}
      grouped={vm.grouped}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      onLoadNotifications={vm.loadNotifications}
      onMarkAsRead={vm.markAsRead}
      onMarkAllAsRead={vm.markAllAsRead}
      onClearError={vm.clearError}
    />
  )
}
