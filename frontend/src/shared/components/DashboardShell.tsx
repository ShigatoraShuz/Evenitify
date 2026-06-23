import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import * as LucideIcons from 'lucide-react'
import { useAuthSession } from '../../features/auth/viewmodels/useAuthSession'
import { useNotifications } from '../../features/notifications/viewmodels/useNotifications'
import { NotificationDropdown } from '../../features/notifications/components/NotificationDropdown'
import { ToastProvider } from './ToastContext'
import { getSidebarByRole, type RouteConfig } from '../../routes/routeConstants'
import { DemoRoleSwitcher } from './DemoRoleSwitcher'
import { CommandPalette } from './CommandPalette'
import { useCommandPalette } from '../hooks/useCommandPalette'
import { RoleHelpDrawer } from './GuidanceComponents'
import { helpService } from '../../services/helpService'
import type { UserRole } from '../../services/authService'

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, activeRole, userRoles, setActiveRole } = useAuthSession()
  const userRole = activeRole
  const sidebarItems = getSidebarByRole(userRole)
  const { notifications, unreadCount, loading, loadNotifications, markAsRead } = useNotifications()
  const commandPalette = useCommandPalette(userRole)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const roleHelp = helpService.getRoleHelp(userRole)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path: string) => {
    if (path === '/organizer' && location.pathname === '/organizer') return true
    if (path === '/vendor' && location.pathname === '/vendor') return true
    if (path === '/admin' && location.pathname === '/admin') return true
    return location.pathname.startsWith(path) && path !== '/'
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    setMobileSidebarOpen(false)
  }

  const handleCommandSelect = (path: string) => {
    commandPalette.closePalette()
    handleNavigation(path)
  }

  const profileRoute = userRole === 'vendor' ? '/vendor/profile' : userRole === 'admin' ? '/admin/settings' : '/organizer/profile'
  const switchableRoles = userRoles.filter((role) => role === 'organizer' || role === 'vendor')

  const handleRoleSwitch = (role: UserRole) => {
    setActiveRole(role)
    navigate(role === 'vendor' ? '/vendor' : role === 'admin' ? '/admin' : '/organizer')
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg">
          Skip to main content
        </a>
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {sidebarItems.length > 0 && (
                <button
                  onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                  className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  aria-label={mobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                  aria-expanded={mobileSidebarOpen}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <h1
                className="text-xl font-bold text-brand-600 cursor-pointer select-none"
                onClick={() => {
                  if (userRole === 'admin') navigate('/admin')
                  else if (userRole === 'vendor') navigate('/vendor')
                  else navigate('/organizer')
                }}
              >
                Eventify
              </h1>
              <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium hidden sm:inline">B2B</span>
              {switchableRoles.length > 1 && (
                <div className="hidden md:flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  {switchableRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleSwitch(role)}
                      className={`px-3 py-1 text-xs font-semibold capitalize rounded-md ${
                        userRole === role ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {userRole && (
                <>
                  <button
                    onClick={commandPalette.openPalette}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all duration-200 cursor-pointer"
                  >
                    <LucideIcons.Search className="w-3.5 h-3.5 text-slate-400" />
                    <span>Search</span>
                  </button>
                  <button
                    onClick={() => setHelpOpen(true)}
                    className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all duration-200 sm:inline-flex cursor-pointer"
                  >
                    <LucideIcons.HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Help</span>
                  </button>
                </>
              )}
              <NotificationDropdown
                unreadCount={unreadCount}
                notifications={notifications}
                loading={loading}
                onMarkAsRead={markAsRead}
                onRefresh={loadNotifications}
              />

              {userRole && (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100"
                    aria-label="Account menu"
                    aria-expanded={profileMenuOpen}
                  >
                    <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                      {userRole.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden sm:inline text-xs capitalize text-slate-500">{userRole}</span>
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-1">
                      {switchableRoles.length > 1 && switchableRoles.map((role) => (
                        <button
                          key={role}
                          onClick={() => { handleRoleSwitch(role); setProfileMenuOpen(false) }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 capitalize"
                        >
                          Switch to {role}
                        </button>
                      ))}
                      {switchableRoles.length > 1 && <hr className="my-1 border-slate-100" />}
                      <button
                        onClick={() => { handleNavigation(profileRoute); setProfileMenuOpen(false) }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Profile & Settings
                      </button>
                      <button
                        onClick={() => { navigate('/notifications'); setProfileMenuOpen(false) }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Notifications
                      </button>
                      <hr className="my-1 border-slate-100" />
                      <button
                        onClick={async () => { await logout(); navigate('/login'); setProfileMenuOpen(false) }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex max-w-7xl mx-auto relative">
          {sidebarItems.length > 0 && (
            <>
              <aside
                className={`
                fixed lg:sticky top-16 lg:top-16 z-30 h-[calc(100vh-64px)] w-64 bg-white border-r border-slate-200 
                transition-transform duration-200 ease-in-out
                ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              `}
                aria-label="Sidebar navigation"
              >
                <nav className="p-4 space-y-1.5">
                  {sidebarItems.map((item: RouteConfig) => {
                    const IconComponent = item.icon && LucideIcons[item.icon as keyof typeof LucideIcons]
                      ? (LucideIcons[item.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>)
                      : null;

                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 ${
                          isActive(item.path)
                            ? 'bg-brand-50 text-brand-700 border border-brand-200/50 shadow-sm shadow-brand-500/5'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:translate-x-0.5'
                        }`}
                      >
                        {IconComponent && (
                          <IconComponent className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive(item.path) ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                          }`} />
                        )}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </aside>

              {mobileSidebarOpen && (
                <div
                  className="fixed inset-0 bg-black/30 z-20 lg:hidden"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-hidden="true"
                />
              )}
            </>
          )}

          <main id="main-content" className={`flex-1 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-64px)] ${sidebarItems.length > 0 ? '' : ''}`}>
            <div className="mb-4">
              <DemoRoleSwitcher compact />
            </div>
            <CommandPalette
              open={commandPalette.open}
              query={commandPalette.query}
              results={commandPalette.results}
              quickActions={commandPalette.quickActions}
              onQueryChange={commandPalette.updateQuery}
              onClose={commandPalette.closePalette}
              onSelect={handleCommandSelect}
            />
            <RoleHelpDrawer open={helpOpen} content={roleHelp} onClose={() => setHelpOpen(false)} />
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
