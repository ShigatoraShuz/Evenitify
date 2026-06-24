import { useState, useCallback, useEffect, useMemo } from 'react'
import { hasAuthToken } from '../../../services/apiClient'
import { notificationService } from '../../../services/notificationService'
import type { AppNotification } from '../models/notifications.model'
import { buildViewModelStateMeta } from '../../../shared/types/viewModelState'

interface NotificationsState {
  notifications: AppNotification[]
  unreadCount: number
  loading: boolean
  submitting: boolean
  error: string | null
}

function getTimeGroup(dateStr: string): 'today' | 'this_week' | 'earlier' {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'today'
  if (diffDays === 0) return 'today'
  if (diffDays <= 7) return 'this_week'
  return 'earlier'
}

const GROUP_LABELS: Record<string, string> = {
  today: 'Today',
  this_week: 'This Week',
  earlier: 'Earlier'
}

const GROUP_ORDER = ['today', 'this_week', 'earlier']

export function useNotifications() {
  const [state, setState] = useState<NotificationsState>({
    notifications: [],
    unreadCount: 0,
    loading: false,
    submitting: false,
    error: null
  })

  const grouped = useMemo(() => {
    const groups: Record<string, AppNotification[]> = { today: [], this_week: [], earlier: [] }
    for (const n of state.notifications) {
      const group = getTimeGroup(n.created_at)
      groups[group].push(n)
    }
    return GROUP_ORDER.map((key) => ({
      key,
      label: GROUP_LABELS[key],
      notifications: groups[key]
    })).filter((g) => g.notifications.length > 0)
  }, [state.notifications])

  const loadNotifications = useCallback(async () => {
    if (!hasAuthToken()) {
      setState((s) => ({ ...s, notifications: [], loading: false, error: null }))
      return
    }
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const notifications = await notificationService.listNotifications()
      setState((s) => ({ ...s, notifications, loading: false }))
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  const loadUnreadCount = useCallback(async () => {
    if (!hasAuthToken()) return
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
    ...buildViewModelStateMeta({
      loading: state.loading,
      submitting: state.submitting,
      error: state.error,
      empty: !state.loading && state.notifications.length === 0,
      loaded: !state.loading
    }),
    grouped,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    clearError
  }
}
