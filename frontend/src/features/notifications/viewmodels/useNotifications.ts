import { useState, useCallback, useEffect } from 'react'
import { notificationService } from '../../../services/notificationService'
import type { AppNotification } from '../models/notifications.model'

interface NotificationsState {
  notifications: AppNotification[]
  unreadCount: number
  loading: boolean
  submitting: boolean
  error: string | null
}

export function useNotifications() {
  const [state, setState] = useState<NotificationsState>({
    notifications: [],
    unreadCount: 0,
    loading: false,
    submitting: false,
    error: null
  })

  const loadNotifications = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const notifications = await notificationService.listNotifications()
      setState((s) => ({ ...s, notifications, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  const loadUnreadCount = useCallback(async () => {
    try {
      const { count } = await notificationService.getUnreadCount()
      setState((s) => ({ ...s, unreadCount: count }))
    } catch {
      // silently fail for unread count
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await notificationService.markAsRead(notificationId)
      const notifications = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      )
      setState((s) => ({ ...s, notifications, submitting: false, unreadCount: Math.max(0, s.unreadCount - 1) }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [state.notifications])

  const markAllAsRead = useCallback(async () => {
    setState((s) => ({ ...s, submitting: true, error: null }))
    try {
      await notificationService.markAllAsRead()
      const notifications = state.notifications.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      setState((s) => ({ ...s, notifications, submitting: false, unreadCount: 0 }))
    } catch (err) {
      setState((s) => ({ ...s, submitting: false, error: (err as Error).message }))
    }
  }, [state.notifications])

  useEffect(() => { loadUnreadCount() }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    ...state,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    clearError
  }
}
