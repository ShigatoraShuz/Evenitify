export interface RoleHelpStep {
  title: string
  description: string
}

export interface RoleHelpContent {
  role: 'organizer' | 'vendor' | 'admin'
  title: string
  description: string
  steps: RoleHelpStep[]
}

const roleHelp: RoleHelpContent[] = [
  {
    role: 'organizer',
    title: 'Organizer procurement guide',
    description: 'Create an event, define requirements, compare vendors, and send booking requests.',
    steps: [
      { title: 'Create an event', description: 'Start with event date, venue, budget, and expected guests.' },
      { title: 'Add requirements', description: 'Break vendor needs into categories with budget ranges.' },
      { title: 'Compare vendors', description: 'Review match score, availability, service area, and pricing.' },
      { title: 'Send requests', description: 'Submit B2B booking requests and track contracts in the portfolio.' }
    ]
  },
  {
    role: 'vendor',
    title: 'Vendor B2B guide',
    description: 'Keep services current and respond to organizer booking requests quickly.',
    steps: [
      { title: 'Manage services', description: 'Update service listings, price points, and service areas.' },
      { title: 'Review requests', description: 'Open pending B2B bookings and inspect event requirements.' },
      { title: 'Respond clearly', description: 'Accept, decline, or request changes with operational notes.' },
      { title: 'Manage contracts', description: 'Review contract status and sign when organizer terms are ready.' }
    ]
  },
  {
    role: 'admin',
    title: 'Operations guide',
    description: 'Use admin queues and analytics to monitor platform health.',
    steps: [
      { title: 'Verify vendors', description: 'Review pending vendor profiles and approve or reject with reason.' },
      { title: 'Monitor bookings', description: 'Inspect pending and risk-state bookings across events.' },
      { title: 'Review activity', description: 'Use audit timelines for status changes and operational decisions.' }
    ]
  }
]

export const helpService = {
  getRoleHelp: (role: string | null): RoleHelpContent | null => {
    if (role !== 'organizer' && role !== 'vendor' && role !== 'admin') return null
    return roleHelp.find((item) => item.role === role) || null
  }
}

