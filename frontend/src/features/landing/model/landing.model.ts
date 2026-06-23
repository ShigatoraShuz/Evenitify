export interface NavItem {
  label: string
  href: string
}

export interface StatItem {
  value: string
  label: string
}

export interface TrustedBrand {
  name: string
}

export const EVENTIFY_LANDING_COPY = {
  brand: 'Eventify',
  headline: 'Procure vendors for large events with clarity.',
  description:
    'Eventify helps organizers plan large-scale events, define requirements, discover verified vendors, and manage B2B booking requests in one organized workspace.',
  primaryCTA: 'Start Planning',
  secondaryCTA: 'Browse Vendors',
  navItems: [
    { label: 'Solutions', href: '#solutions' },
    { label: 'Vendors', href: '#vendors' },
    { label: 'Events', href: '#events' },
    { label: 'How It Works', href: '#how-it-works' },
  ] satisfies NavItem[],
  stats: [
    { value: '120+', label: 'Large Events Managed' },
    { value: '40+', label: 'Vendor Categories' },
  ] satisfies StatItem[],
  trustedBy: {
    heading: 'TRUSTED BY ORGANIZERS',
    brands: ['ExpoHub', 'VenuePro', 'Gatherly'] satisfies string[],
  },
  footer: {
    copyright: 'Eventify. Organizer Vendor Procurement Platform.',
  },
} as const
