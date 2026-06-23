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

const searchIndex: CommandSearchResult[] = [
  { id: 'event-gala', type: 'event', title: 'Annual Partner Gala', subtitle: 'Active procurement event', path: '/organizer/portfolio?eventId=evt-001' },
  { id: 'vendor-catering', type: 'vendor', title: 'Blue Plate Catering', subtitle: 'Verified catering vendor', path: '/organizer/procurement?eventId=evt-001' },
  { id: 'booking-lighting', type: 'booking', title: 'Lighting booking request', subtitle: 'Pending vendor response', path: '/organizer/portfolio?eventId=evt-001' },
  { id: 'contract-stage', type: 'contract', title: 'Stage production contract', subtitle: 'Organizer signature due', path: '/organizer/portfolio?eventId=evt-001' },
  { id: 'notification-contract', type: 'notification', title: 'Contract reminder', subtitle: 'Open notification center', path: '/notifications' },
  { id: 'admin-verification', type: 'vendor', title: 'Pending vendor verification', subtitle: 'Admin operations queue', path: '/admin' }
]

const quickActions: QuickAction[] = [
  { id: 'create-event', label: 'Create event', description: 'Open organizer event dashboard', path: '/organizer', roles: ['organizer', 'admin'] },
  { id: 'add-requirement', label: 'Add requirement', description: 'Open procurement workspace', path: '/organizer/procurement?eventId=evt-001', roles: ['organizer', 'admin'] },
  { id: 'discover-vendors', label: 'Discover vendors', description: 'Search vendor matches', path: '/organizer/procurement?eventId=evt-001', roles: ['organizer', 'admin'] },
  { id: 'notifications', label: 'Open notifications', description: 'Review unread updates', path: '/notifications', roles: ['organizer', 'vendor', 'admin'] },
  { id: 'profile', label: 'Profile settings', description: 'Open role profile settings', path: '/organizer/profile', roles: ['organizer'] },
  { id: 'vendor-profile', label: 'Vendor settings', description: 'Manage services and availability', path: '/vendor/profile', roles: ['vendor'] },
  { id: 'admin-dashboard', label: 'Admin dashboard', description: 'Open operations overview', path: '/admin', roles: ['admin'] }
]

export const commandService = {
  // Future endpoint: GET /search/global?q=:query
  search: async (query: string): Promise<CommandSearchResult[]> => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return searchIndex.slice(0, 5)
    return searchIndex.filter((item) =>
      [item.title, item.subtitle, item.type].some((value) => value.toLowerCase().includes(normalized))
    )
  },

  getQuickActions: async (role: string | null): Promise<QuickAction[]> => {
    if (role !== 'organizer' && role !== 'vendor' && role !== 'admin') return []
    return quickActions.filter((action) => action.roles.includes(role))
  }
}

