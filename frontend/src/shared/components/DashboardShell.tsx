import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
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
import { RoleSwitcher } from './RoleSwitcher'

interface DashboardShellProps {
  children: React.ReactNode
}

function groupSidebarItems(items: RouteConfig[]) {
  const workflowCount = Math.max(1, items.length - 1)
  return {
    workflow: items.slice(0, workflowCount),
    account: items.slice(workflowCount),
  }
}

function SidebarLink({ item, onNavigate, active }: { item: RouteConfig; onNavigate: () => void; active: boolean }) {
  const IconComponent = item.icon && LucideIcons[item.icon as keyof typeof LucideIcons]
    ? (LucideIcons[item.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>)
    : null

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive: navActive }) =>
        `flex min-h-11 items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-[background-color,color,box-shadow,border-color] duration-200 ${
          navActive || active
            ? 'border border-brand-200 bg-brand-50 text-brand-900 shadow-sm'
            : 'border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950'
        }`
      }
    >
      {IconComponent && <IconComponent className="h-4 w-4 shrink-0" />}
      <span>{item.label}</span>
    </NavLink>
  )
}

export function DashboardShell({ children }: DashboardShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, activeRole, userRoles, setActiveRole } = useAuthSession()
  const userRole = activeRole
  const sidebarItems = getSidebarByRole(userRole)
  const groupedSidebar = useMemo(() => groupSidebarItems(sidebarItems), [sidebarItems])
  const { notifications, unreadCount, loading, loadNotifications, markAsRead } = useNotifications()
  const commandPalette = useCommandPalette(userRole)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const roleHelp = helpService.getRoleHelp(userRole)
  const switchableRoles = userRoles.filter((role) => role === 'organizer' || role === 'vendor')

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavigation = (path: string) => {
    navigate(path)
    setMobileSidebarOpen(false)
  }

  const handleCommandSelect = (path: string) => {
    commandPalette.closePalette()
    handleNavigation(path)
  }

  const profileRoute = userRole === 'vendor' ? '/vendor/profile' : userRole === 'admin' ? '/admin/settings' : '/organizer/profile'

  const handleRoleSwitch = (role: UserRole) => {
    setActiveRole(role)
    navigate(role === 'vendor' ? '/vendor' : role === 'admin' ? '/admin' : '/organizer')
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-transparent">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 lg:hidden"
                onClick={() => setMobileSidebarOpen((open) => !open)}
                aria-label={mobileSidebarOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={mobileSidebarOpen}
              >
                <LucideIcons.Menu className="h-5 w-5" />
              </button>

              <Link to={userRole === 'vendor' ? '/vendor' : userRole === 'admin' ? '/admin' : '/organizer'} className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-900 text-white shadow-sm">
                  <LucideIcons.Building2 className="h-4 w-4" />
                </span>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold tracking-tight text-slate-950">Eventify</p>
                  <p className="text-xs text-slate-500">B2B procurement workspace</p>
                </div>
              </Link>

              <div className="hidden xl:block">
                <RoleSwitcher roles={switchableRoles} activeRole={userRole} onChange={handleRoleSwitch} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {userRole && (
                <>
                  <button
                    type="button"
                    onClick={commandPalette.openPalette}
                    className="hidden min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 md:inline-flex"
                  >
                    <LucideIcons.Search className="h-4 w-4 text-slate-400" />
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setHelpOpen(true)}
                    className="hidden min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 sm:inline-flex"
                  >
                    <LucideIcons.HelpCircle className="h-4 w-4 text-slate-400" />
                    Help
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
                    type="button"
                    onClick={() => setProfileMenuOpen((open) => !open)}
                    className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                    aria-label="Account menu"
                    aria-expanded={profileMenuOpen}
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-900">
                      {userRole.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden sm:inline capitalize">{userRole}</span>
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
                      <div className="border-b border-slate-200 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Account</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">Workspace settings</p>
                      </div>
                      {switchableRoles.length > 1 && (
                        <div className="p-2">
                          {switchableRoles.map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => {
                                handleRoleSwitch(role)
                                setProfileMenuOpen(false)
                              }}
                              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                            >
                              <span>Switch to {role}</span>
                              <LucideIcons.ChevronRight className="h-4 w-4 text-slate-400" />
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="border-t border-slate-200 p-2">
                        <Link
                          to={profileRoute}
                          onClick={() => setProfileMenuOpen(false)}
                          className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                        >
                          Profile & settings
                        </Link>
                        <Link
                          to="/notifications"
                          onClick={() => setProfileMenuOpen(false)}
                          className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                        >
                          Notifications
                        </Link>
                      </div>
                      <div className="border-t border-slate-200 p-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await logout()
                            navigate('/login')
                            setProfileMenuOpen(false)
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
                        >
                          <span>Sign out</span>
                          <LucideIcons.LogOut className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="relative mx-auto flex max-w-[1600px]">
          {sidebarItems.length > 0 && (
            <>
              <aside
                className={`fixed top-16 z-30 h-[calc(100vh-4rem)] w-[18rem] border-r border-slate-200/80 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-transform duration-200 ease-out lg:sticky lg:translate-x-0 ${
                  mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                aria-label="Sidebar navigation"
              >
                <div className="flex h-full flex-col p-4">
                  <div className="mb-4 flex items-center justify-between lg:hidden">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Navigation</p>
                    <button
                      type="button"
                      onClick={() => setMobileSidebarOpen(false)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                      aria-label="Close navigation"
                    >
                      <LucideIcons.X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    {groupedSidebar.workflow.length > 0 && (
                      <div>
                        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Workflow</p>
                        <div className="mt-2 space-y-1">
                          {groupedSidebar.workflow.map((item) => (
                            <SidebarLink key={item.path} item={item} onNavigate={() => setMobileSidebarOpen(false)} active={location.pathname === item.path} />
                          ))}
                        </div>
                      </div>
                    )}
                    {groupedSidebar.account.length > 0 && (
                      <div>
                        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Account</p>
                        <div className="mt-2 space-y-1">
                          {groupedSidebar.account.map((item) => (
                            <SidebarLink key={item.path} item={item} onNavigate={() => setMobileSidebarOpen(false)} active={location.pathname === item.path} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto hidden lg:block">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Role switch</p>
                      <div className="mt-3">
                        <RoleSwitcher roles={switchableRoles} activeRole={userRole} onChange={handleRoleSwitch} />
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {mobileSidebarOpen && (
                <button
                  type="button"
                  className="fixed inset-0 z-20 bg-slate-950/35 lg:hidden"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-label="Close navigation overlay"
                />
              )}
            </>
          )}

          <main id="main-content" className="min-h-[calc(100vh-4rem)] flex-1 px-4 py-4 md:px-6 md:py-6 lg:px-8">
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
