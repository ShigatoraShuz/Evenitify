import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationService } from '../../../services/notificationService'
import type { AppNotification } from '../models/notifications.model'

interface NotificationDropdownProps {
  unreadCount: number
  notifications: AppNotification[]
  loading: boolean
  onMarkAsRead: (id: string) => Promise<void>
  onRefresh: () => Promise<void>
}

export function NotificationDropdown({
  unreadCount,
  notifications,
  loading,
  onMarkAsRead,
  onRefresh
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open) onRefresh()
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => navigate('/notifications')}
              className="text-xs text-brand-600 hover:text-brand-700"
            >
              View All
            </button>
          </div>

          <div className="overflow-y-auto max-h-72">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No new notifications
              </div>
            ) : (
              <div className="divide-y">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                      !notification.is_read ? 'bg-brand-50/30' : ''
                    }`}
                    onClick={() => {
                      if (notification.action_url) navigate(notification.action_url)
                      if (!notification.is_read) onMarkAsRead(notification.id)
                      setOpen(false)
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{notification.message}</p>
                      </div>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
