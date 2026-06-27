import { useRef, useEffect, useState } from 'react'
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
import { useNavbarViewModel } from '../viewmodels/useNavbarViewModel'

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, activeRole, userRoles, user } = useAuthSession()
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
  const navbar = useNavbarViewModel()
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

  const dashboardRoots = ['/organizer', '/vendor', '/admin']
  const isActive = (path: string) => {
    if (dashboardRoots.includes(path)) return location.pathname === path
    return location.pathname.startsWith(path) && path !== '/'
  }

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  const handleCommandSelect = (path: string) => {
    commandPalette.closePalette()
    handleNavigation(path)
  }

  const profileRoute = userRole === 'vendor' ? '/vendor/profile' : userRole === 'admin' ? '/admin/settings' : '/organizer/profile'
  const roleLabel = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Workspace'
  const shellTone = userRole === 'admin'
    ? 'bg-gradient-to-br from-rose-500/[0.14] via-orange-400/[0.08] to-cyan-400/[0.08]'
    : userRole === 'vendor'
      ? 'bg-gradient-to-br from-violet-500/[0.14] via-sky-400/[0.08] to-emerald-400/[0.08]'
      : 'bg-gradient-to-br from-brand-500/[0.14] via-cyan-400/[0.08] to-emerald-400/[0.08]'

  return (
    <ToastProvider>
      <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-100">
        <div className={[
          'pointer-events-none absolute inset-0',
          'bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.10),transparent_28%),linear-gradient(180deg,#07111f_0%,#0a1425_42%,#09111d_100%)]',
        ].join(' ')} />
        <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)] [background-size:72px_72px]" />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-slate-950 focus:shadow-xl">
          Skip to main content
        </a>
        <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/72 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl">
          <div className="mx-auto flex h-[4.5rem] max-w-[1760px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              {sidebarItems.length > 0 && (
                <button
                  onClick={navbar.toggle}
                  className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-slate-200 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                  aria-label={navbar.isOpen ? 'Close sidebar' : 'Open sidebar'}
                  aria-expanded={navbar.isOpen}
                >
                  {navbar.isOpen ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              )}
              <button
                type="button"
                className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-white shadow-[0_10px_30px_rgba(2,6,23,0.22)] transition-colors hover:border-white/15 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                onClick={() => {
                  if (userRole === 'admin') navigate('/admin')
                  else if (userRole === 'vendor') navigate('/vendor')
                  else navigate('/organizer')
                }}
                aria-label="Go to Eventify organizer dashboard"
              >
                <span className={[
                  'flex h-10 w-10 items-center justify-center rounded-2xl border',
                  'border-white/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.9),rgba(16,185,129,0.92))]',
                  'shadow-[0_10px_25px_rgba(8,145,178,0.24)]',
                ].join(' ')}>
                  <svg viewBox="0 0 32 32" className="h-5 w-5 text-white" aria-hidden="true">
                    <path
                      d="M8 21.5C8 13.5 12.5 9 20.5 9H24v3.5h-3.3c-5.5 0-8.7 3.2-8.7 9v1.2c0 3.1 1.8 4.8 4.9 4.8H24V31H15.2C10 31 8 28.8 8 23.7v-2.2Z"
                      fill="currentColor"
                    />
                    <circle cx="23" cy="8" r="3" fill="currentColor" opacity="0.9" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <h1 className="select-none truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
                    Eventify
                  </h1>
                  <p className="truncate text-[11px] font-medium uppercase tracking-[0.3em] text-slate-400">
                    Procurement workspace
                  </p>
                </span>
              </button>
              <span className={[
                'hidden rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] sm:inline-flex',
                'border-white/10 bg-white/5 text-slate-300',
              ].join(' ')}>
                {roleLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {userRole && (
                <>
                  <button
                    onClick={commandPalette.openPalette}
                    className={[
                      'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200',
                      'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/50 cursor-pointer',
                    ].join(' ')}
                  >
                    <LucideIcons.Search className="h-3.5 w-3.5 text-slate-300" />
                    <span>Search</span>
                  </button>
                  <button
                    onClick={() => setHelpOpen(true)}
                    className={[
                      'hidden items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 sm:inline-flex',
                      'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/50 cursor-pointer',
                    ].join(' ')}
                  >
                    <LucideIcons.HelpCircle className="h-3.5 w-3.5 text-slate-300" />
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
                    className={[
                      'flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-sm',
                      'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/50 sm:px-3',
                    ].join(' ')}
                    aria-label="Account menu"
                    aria-expanded={profileMenuOpen}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-emerald-300 text-xs font-bold text-slate-950 shadow-sm">
                      {avatarInitial}
                    </span>
                    <span className="hidden sm:flex sm:flex-col sm:items-start">
                      <span className="max-w-[160px] truncate text-xs font-medium text-white">{profileLabel}</span>
                      <span className="text-[10px] capitalize leading-tight text-slate-400">{userRole}</span>
                    </span>
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-white/10 bg-slate-950/95 p-1.5 shadow-[0_24px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl">
                      <button
                        onClick={() => { handleNavigation(profileRoute); setProfileMenuOpen(false) }}
                        className="w-full rounded-xl px-4 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-white/[0.08]"
                      >
                        Profile & Settings
                      </button>
                      <button
                        onClick={() => { navigate('/notifications'); setProfileMenuOpen(false) }}
                        className="w-full rounded-xl px-4 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-white/[0.08]"
                      >
                        Notifications
                      </button>
                      <hr className="my-1 border-white/10" />
                      <button
                        onClick={async () => { await logout(); navigate('/'); setProfileMenuOpen(false) }}
                        className="w-full rounded-xl px-4 py-2.5 text-left text-sm text-rose-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
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

        <div className="relative mx-auto flex max-w-[1760px] gap-4 px-4 pb-6 pt-4 sm:px-6 lg:px-8 lg:gap-6">
          {sidebarItems.length > 0 && (
            <aside
              className={`
                sticky top-[4.75rem] z-30 h-[calc(100vh-5.75rem)] shrink-0 overflow-hidden
                transition-all duration-200 ease-in-out
                ${navbar.isOpen ? 'w-72' : 'w-0'}
              `}
              aria-label="Sidebar navigation"
            >
              <div className="flex h-full w-72 flex-col rounded-[28px] border border-white/10 bg-slate-950/55 p-4 shadow-[0_24px_70px_rgba(2,6,23,0.45)] backdrop-blur-xl">
                <div className={[
                  'mb-4 rounded-[24px] border p-4',
                  'border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(15,118,110,0.24))]',
                ].join(' ')}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                    {roleLabel} workspace
                  </p>
                  <p className="mt-2 truncate text-lg font-semibold text-white">{profileLabel}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    Navigate planning, operations, and account surfaces from one control rail.
                  </p>
                </div>
                <nav className="space-y-1.5">
                {sidebarItems.map((item: RouteConfig) => {
                  const IconComponent = item.icon && LucideIcons[item.icon as keyof typeof LucideIcons]
                    ? (LucideIcons[item.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>)
                    : null;

                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                        isActive(item.path)
                          ? 'border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(8,145,178,0.18),rgba(16,185,129,0.14))] text-white shadow-[0_16px_35px_rgba(8,145,178,0.15)]'
                          : 'border border-transparent text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {IconComponent && (
                        <IconComponent className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive(item.path) ? 'text-cyan-200' : 'text-slate-500 group-hover:text-slate-300'
                        }`} />
                      )}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                </nav>
              </div>
            </aside>
          )}

          <main id="main-content" className={[
            'min-h-[calc(100vh-5.75rem)] min-w-0 flex-1 pb-4',
            'transition-all duration-200',
          ].join(' ')}>
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
            <div className={[
              'relative space-y-6 rounded-[32px] border border-white/10 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.24)] backdrop-blur-sm',
              'md:p-5 lg:p-6',
              shellTone,
            ].join(' ')}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
