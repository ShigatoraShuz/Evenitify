export interface RouteConfig {
  path: string
  label: string
  roles: string[]
  sidebar: boolean
  icon?: string
}

export const ROUTES: Record<string, RouteConfig> = {
  LANDING: { path: '/', label: 'Home', roles: [], sidebar: false },
  LOGIN: { path: '/login', label: 'Login', roles: [], sidebar: false },
  REGISTER: { path: '/register', label: 'Register', roles: [], sidebar: false },
  CHOOSE_ROLE: { path: '/choose-role', label: 'Choose Role', roles: [], sidebar: false },
  ONBOARDING: { path: '/onboarding', label: 'Onboarding', roles: [], sidebar: false },
  ORGANIZER_DASHBOARD: { path: '/organizer', label: 'Dashboard', roles: ['organizer', 'admin'], sidebar: true, icon: 'LayoutDashboard' },
  ORGANIZER_PLAN_EVENT: { path: '/organizer/plan-event', label: 'Plan an Event', roles: ['organizer', 'admin'], sidebar: true, icon: 'CalendarPlus' },
  ORGANIZER_VENDOR_MARKETPLACE: { path: '/organizer/vendor-marketplace', label: 'Vendor Marketplace', roles: ['organizer', 'admin'], sidebar: true, icon: 'ShoppingBag' },
  ORGANIZER_VENDOR_STATUS: { path: '/organizer/vendor-status', label: 'Track Vendors', roles: ['organizer', 'admin'], sidebar: true, icon: 'MessageSquare' },
  ORGANIZER_PORTFOLIO: { path: '/organizer/portfolio', label: 'Portfolio', roles: ['organizer', 'admin'], sidebar: true, icon: 'FolderHeart' },
  ORGANIZER_COMPARE: { path: '/organizer/compare', label: 'Compare Vendors', roles: ['organizer', 'admin'], sidebar: true, icon: 'GitCompare' },
  ORGANIZER_REPORTS: { path: '/organizer/reports', label: 'Reports', roles: ['organizer', 'admin'], sidebar: true, icon: 'BarChart3' },
  ORGANIZER_PROFILE: { path: '/organizer/profile', label: 'Profile', roles: ['organizer', 'admin'], sidebar: true, icon: 'User' },
  VENDOR_DASHBOARD: { path: '/vendor', label: 'Dashboard', roles: ['vendor'], sidebar: true, icon: 'LayoutDashboard' },
  VENDOR_SERVICES: { path: '/vendor/services', label: 'Services', roles: ['vendor'], sidebar: true, icon: 'Store' },
  VENDOR_BOOKINGS: { path: '/vendor/bookings', label: 'Bookings', roles: ['vendor'], sidebar: true, icon: 'Inbox' },
  VENDOR_EVENTS: { path: '/vendor/events', label: 'Events', roles: ['vendor'], sidebar: true, icon: 'BadgeCheck' },
  VENDOR_AVAILABILITY: { path: '/vendor/availability', label: 'Availability', roles: ['vendor'], sidebar: true, icon: 'Clock' },
  VENDOR_REPORTS: { path: '/vendor/reports', label: 'Reports', roles: ['vendor'], sidebar: true, icon: 'BarChart3' },
  VENDOR_PROFILE: { path: '/vendor/profile', label: 'Profile', roles: ['vendor'], sidebar: true, icon: 'User' },
  ADMIN_DASHBOARD: { path: '/admin', label: 'Dashboard', roles: ['admin'], sidebar: true, icon: 'LayoutDashboard' },
  ADMIN_REPORTS: { path: '/admin/reports', label: 'Reports', roles: ['admin'], sidebar: true, icon: 'BarChart3' },
  ADMIN_SETTINGS: { path: '/admin/settings', label: 'Settings', roles: ['admin'], sidebar: true, icon: 'Settings' },
  NOTIFICATIONS: { path: '/notifications', label: 'Notifications', roles: [], sidebar: false },
  NOT_FOUND: { path: '/404', label: 'Not Found', roles: [], sidebar: false },
}

export const ORGANIZER_SIDEBAR: RouteConfig[] = [
  ROUTES.ORGANIZER_DASHBOARD,
  ROUTES.ORGANIZER_PLAN_EVENT,
  ROUTES.ORGANIZER_VENDOR_MARKETPLACE,
  ROUTES.ORGANIZER_VENDOR_STATUS,
  ROUTES.ORGANIZER_REPORTS,
  ROUTES.ORGANIZER_PROFILE,
]

export const VENDOR_SIDEBAR: RouteConfig[] = [
  ROUTES.VENDOR_DASHBOARD,
  ROUTES.VENDOR_SERVICES,
  ROUTES.VENDOR_BOOKINGS,
  ROUTES.VENDOR_EVENTS,
  ROUTES.VENDOR_AVAILABILITY,
  ROUTES.VENDOR_REPORTS,
  ROUTES.VENDOR_PROFILE,
]

export const ADMIN_SIDEBAR: RouteConfig[] = [
  ROUTES.ADMIN_DASHBOARD,
  ROUTES.ADMIN_REPORTS,
  ROUTES.ADMIN_SETTINGS,
]

export function getSidebarByRole(role: string | null): RouteConfig[] {
  if (role === 'organizer') return ORGANIZER_SIDEBAR
  if (role === 'vendor') return VENDOR_SIDEBAR
  if (role === 'admin') return ADMIN_SIDEBAR
  return []
}
