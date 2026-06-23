import { useNotifications } from '../../features/notifications/viewmodels/useNotifications'
import { NotificationDropdown } from '../../features/notifications/components/NotificationDropdown'
import { ToastProvider } from './ToastContext'
import { useNavigate } from 'react-router-dom'

interface DashboardShellProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export function DashboardShell({ children, sidebar }: DashboardShellProps) {
  const navigate = useNavigate()
  const { notifications, unreadCount, loading, loadNotifications, markAsRead } = useNotifications()

  const userRole = (() => {
    try {
      const token = localStorage.getItem('supabase.auth.token')
      if (token) {
        const parsed = JSON.parse(token)
        return parsed?.user?.role || null
      }
    } catch {}
    return null
  })()

  return (
    <ToastProvider>
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1
              className="text-xl font-bold text-brand-600 cursor-pointer"
              onClick={() => {
                if (userRole === 'admin') navigate('/admin')
                else if (userRole === 'vendor') navigate('/vendor')
                else navigate('/organizer')
              }}
            >
              Eventify
            </h1>
            <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">B2B</span>
          </div>

          <div className="flex items-center gap-2">
            <NotificationDropdown
              unreadCount={unreadCount}
              notifications={notifications}
              loading={loading}
              onMarkAsRead={markAsRead}
              onRefresh={loadNotifications}
            />

            {userRole && (
              <button
                onClick={() => {
                  localStorage.removeItem('supabase.auth.token')
                  window.location.href = '/login'
                }}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>
      <div className="flex max-w-7xl mx-auto">
        {sidebar && (
          <aside className="w-64 border-r border-gray-200 bg-white min-h-[calc(100vh-64px)] p-4 hidden lg:block">
            {sidebar}
          </aside>
        )}
        <main className={`flex-1 p-6 ${sidebar ? 'lg:pl-8' : ''}`}>
          {children}
        </main>
      </div>
    </div>
    </ToastProvider>
  )
}
