import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
        className="relative rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-200 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/95 shadow-[0_24px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <button
              onClick={() => navigate('/notifications')}
              className="text-xs font-semibold text-cyan-200 hover:text-cyan-100"
            >
              View All
            </button>
          </div>

          <div className="overflow-y-auto max-h-72">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-2xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                No new notifications
              </div>
            ) : (
              <div className="divide-y divide-white/[0.08]">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`cursor-pointer px-4 py-3 transition-colors hover:bg-white/[0.06] ${
                      !notification.is_read ? 'bg-cyan-500/10' : ''
                    }`}
                    onClick={() => {
                      if (notification.action_url) navigate(notification.action_url)
                      if (!notification.is_read) onMarkAsRead(notification.id)
                      setOpen(false)
                    }}
                    >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-white">{notification.title}</p>
                        <p className="line-clamp-1 text-xs text-slate-400">{notification.message}</p>
                      </div>
                      {!notification.is_read && (
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-300" />
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
