import { api } from './apiClient'
import type { AppNotification } from '../features/notifications/models/notifications.model'

export const notificationService = {
  listNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.unreadOnly) qs.set('unreadOnly', 'true')
    return api.get<AppNotification[]>(`/notifications${qs.toString() ? `?${qs.toString()}` : ''}`)
  },

  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count'),

  markAsRead: (notificationId: string) =>
    api.patch<AppNotification>(`/notifications/${notificationId}/read`, {}),

  markAllAsRead: () =>
    api.patch<{ message: string }>('/notifications/read-all', {})
}
