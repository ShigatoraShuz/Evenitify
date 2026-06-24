import { api } from './apiClient'

export type CommandResultType = 'event' | 'vendor' | 'booking' | 'contract' | 'notification'

export interface CommandSearchResult {
  id: string
  type: CommandResultType
  title: string
  subtitle: string
  path: string
}

export interface QuickAction {
  id: string
  label: string
  description: string
  path: string
  roles: Array<'organizer' | 'vendor' | 'admin'>
}

const quickActions: QuickAction[] = [
  { id: 'create-event', label: 'Create event', description: 'Open organizer event dashboard', path: '/organizer', roles: ['organizer', 'admin'] },
  { id: 'browse-vendors', label: 'Browse vendors', description: 'Open Vendor Marketplace', path: '/organizer/vendor-marketplace', roles: ['organizer', 'admin'] },
  { id: 'discover-vendors', label: 'Discover vendors', description: 'Search vendor matches', path: '/organizer/vendor-marketplace', roles: ['organizer', 'admin'] },
  { id: 'notifications', label: 'Open notifications', description: 'Review unread updates', path: '/notifications', roles: ['organizer', 'vendor', 'admin'] },
  { id: 'profile', label: 'Profile settings', description: 'Open role profile settings', path: '/organizer/profile', roles: ['organizer'] },
  { id: 'vendor-profile', label: 'Vendor settings', description: 'Manage services and availability', path: '/vendor/profile', roles: ['vendor'] },
  { id: 'admin-dashboard', label: 'Admin dashboard', description: 'Open operations overview', path: '/admin', roles: ['admin'] }
]

export const commandService = {
  search: async (query: string): Promise<CommandSearchResult[]> => {
    if (!query.trim()) return []
    return api.get<CommandSearchResult[]>(`/search/global?q=${encodeURIComponent(query.trim())}`)
  },

  getQuickActions: async (role: string | null): Promise<QuickAction[]> => {
    if (role !== 'organizer' && role !== 'vendor' && role !== 'admin') return []
    return quickActions.filter((action) => action.roles.includes(role))
  }
}
