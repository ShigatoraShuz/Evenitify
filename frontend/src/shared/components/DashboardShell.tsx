import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import * as LucideIcons from 'lucide-react'
import { useAuthSession } from '../../features/auth/viewmodels/useAuthSession'
import { useNotifications } from '../../features/notifications/viewmodels/useNotifications'
import { NotificationDropdown } from '../../features/notifications/components/NotificationDropdown'
import { ToastProvider } from './ToastContext'
import { getSidebarByRole, type RouteConfig } from '../../routes/routeConstants'
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
  const { logout, activeRole, userRoles, setActiveRole, user } = useAuthSession()
  const userRole = activeRole

  const profileLabel = (() => {
    type WithOrgName = { organization_name?: string }
    type WithBusName = { business_name?: string }
    if (userRole === 'organizer') {
      const org = user?.organizerProfile as WithOrgName | null | undefined
      return org?.organization_name
        || user?.display_name
        || user?.email
        || 'Organizer'
    }
    if (userRole === 'vendor') {
      const ven = user?.vendorProfile as WithBusName | null | undefined
      return ven?.business_name
        || user?.display_name
        || user?.email
        || 'Vendor'
    }
    return user?.display_name
      || user?.email
      || 'Admin'
  })()

  const avatarInitial = profileLabel.charAt(0).toUpperCase()
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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#eaf2ff_52%,_#f7f8fc_100%)]">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg">
          Skip to main content
        </a>
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-10">
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
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl px-1 py-1 text-left focus:outline-none focus:ring-2 focus:ring-brand-200"
                onClick={() => {
                  if (userRole === 'admin') navigate('/admin')
                  else if (userRole === 'vendor') navigate('/vendor')
                  else navigate('/organizer')
                }}
                aria-label="Go to Eventify organizer dashboard"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-brand-200 bg-white shadow-sm">
                  <svg viewBox="0 0 32 32" className="h-5 w-5 text-brand-600" aria-hidden="true">
                    <path
                      d="M8 21.5C8 13.5 12.5 9 20.5 9H24v3.5h-3.3c-5.5 0-8.7 3.2-8.7 9v1.2c0 3.1 1.8 4.8 4.9 4.8H24V31H15.2C10 31 8 28.8 8 23.7v-2.2Z"
                      fill="currentColor"
                    />
                    <circle cx="23" cy="8" r="3" fill="currentColor" opacity="0.9" />
                  </svg>
                </span>
                <h1 className="select-none text-xl font-semibold tracking-tight text-slate-950">
                  Eventify
                </h1>
              </button>
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
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-600 transition-all duration-200 hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-200 cursor-pointer"
                  >
                    <LucideIcons.Search className="w-3.5 h-3.5 text-slate-400" />
                    <span>Search</span>
                  </button>
                  <button
                    onClick={() => setHelpOpen(true)}
                    className="hidden items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-200 sm:inline-flex cursor-pointer"
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
                    className="flex items-center gap-2 rounded-2xl border border-transparent px-2.5 py-1.5 text-sm text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-200 sm:px-3"
                    aria-label="Account menu"
                    aria-expanded={profileMenuOpen}
                  >
                    <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                      {avatarInitial}
                    </span>
                    <span className="hidden sm:flex sm:flex-col sm:items-start">
                      <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]">{profileLabel}</span>
                      <span className="text-[10px] capitalize text-slate-400 leading-tight">{userRole}</span>
                    </span>
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
                        onClick={async () => { await logout(); navigate('/'); setProfileMenuOpen(false) }}
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

        <div className="relative mx-auto flex max-w-[1920px]">
          {sidebarItems.length > 0 && (
            <>
              <aside
                className={`
                fixed lg:sticky top-16 lg:top-16 z-30 h-[calc(100vh-64px)] w-[19rem] border-r border-slate-200/70 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl 
                transition-transform duration-200 ease-in-out
                ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              `}
                aria-label="Sidebar navigation"
              >
                <nav className="space-y-1.5 p-4">
                  {sidebarItems.map((item: RouteConfig) => {
                    const IconComponent = item.icon && LucideIcons[item.icon as keyof typeof LucideIcons]
                      ? (LucideIcons[item.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>)
                      : null;

                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-200 ${
                          isActive(item.path)
                            ? 'border border-brand-200 bg-gradient-to-r from-brand-50 to-white text-brand-700 shadow-sm shadow-brand-500/10'
                            : 'border border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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

          <main id="main-content" className="relative min-h-[calc(100vh-64px)] min-w-0 flex-1 p-4 md:p-6 lg:p-10 xl:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.06),_transparent_28%)]" aria-hidden="true" />
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
            <div className="relative">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
