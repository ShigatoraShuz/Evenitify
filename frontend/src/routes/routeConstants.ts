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
  ONBOARDING: { path: '/onboarding', label: 'Onboarding', roles: [], sidebar: false },
  ORGANIZER_DASHBOARD: { path: '/organizer', label: 'Dashboard', roles: ['organizer', 'admin'], sidebar: true },
  ORGANIZER_PROCUREMENT: { path: '/organizer/procurement', label: 'Procurement', roles: ['organizer', 'admin'], sidebar: true },
  ORGANIZER_PORTFOLIO: { path: '/organizer/portfolio', label: 'Portfolio', roles: ['organizer', 'admin'], sidebar: true },
  ORGANIZER_COMPARE: { path: '/organizer/compare', label: 'Compare Vendors', roles: ['organizer', 'admin'], sidebar: true },
  ORGANIZER_REPORTS: { path: '/organizer/reports', label: 'Reports', roles: ['organizer', 'admin'], sidebar: true },
  ORGANIZER_PROFILE: { path: '/organizer/profile', label: 'Profile', roles: ['organizer', 'admin'], sidebar: true },
  VENDOR_DASHBOARD: { path: '/vendor', label: 'Dashboard', roles: ['vendor'], sidebar: true },
  VENDOR_REPORTS: { path: '/vendor/reports', label: 'Reports', roles: ['vendor'], sidebar: true },
  VENDOR_PROFILE: { path: '/vendor/profile', label: 'Profile', roles: ['vendor'], sidebar: true },
  ADMIN_DASHBOARD: { path: '/admin', label: 'Dashboard', roles: ['admin'], sidebar: true },
  ADMIN_REPORTS: { path: '/admin/reports', label: 'Reports', roles: ['admin'], sidebar: true },
  ADMIN_SETTINGS: { path: '/admin/settings', label: 'Settings', roles: ['admin'], sidebar: true },
  NOTIFICATIONS: { path: '/notifications', label: 'Notifications', roles: [], sidebar: false },
  NOT_FOUND: { path: '/404', label: 'Not Found', roles: [], sidebar: false },
}

export const ORGANIZER_SIDEBAR: RouteConfig[] = [
  ROUTES.ORGANIZER_DASHBOARD,
  ROUTES.ORGANIZER_PROCUREMENT,
  ROUTES.ORGANIZER_PORTFOLIO,
  ROUTES.ORGANIZER_COMPARE,
  ROUTES.ORGANIZER_REPORTS,
  ROUTES.ORGANIZER_PROFILE,
]

export const VENDOR_SIDEBAR: RouteConfig[] = [
  ROUTES.VENDOR_DASHBOARD,
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
