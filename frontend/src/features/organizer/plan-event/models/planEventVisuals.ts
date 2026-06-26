import type { EventTypeId } from './planEvent.model'

type VisualAsset = {
  src: string
  alt: string
}

const unsplash = (photoId: string) => `https://images.unsplash.com/${photoId}?q=80&w=1200&auto=format&fit=crop`

export const EVENT_TYPE_VISUALS: Record<EventTypeId, VisualAsset> = {
  wedding: {
    src: unsplash('photo-1519741497674-611481863552'),
    alt: 'Wedding ceremony table with white florals and warm candlelight'
  },
  concert: {
    src: unsplash('photo-1501386761578-eac5c94b800a'),
    alt: 'Concert crowd with bright stage lighting'
  },
  corporate: {
    src: unsplash('photo-1522202176988-66273c2fd55f'),
    alt: 'Corporate team gathered around a conference table'
  },
  conference: {
    src: unsplash('photo-1511578314322-379afb476865'),
    alt: 'Conference speaker on stage with an audience'
  },
  'product-launch': {
    src: unsplash('photo-1516321318423-f06f85e504b3'),
    alt: 'Product launch presentation with a spotlighted stage'
  },
  festival: {
    src: unsplash('photo-1511795409834-ef04bbd61622'),
    alt: 'Festival crowd under colorful lights'
  },
  birthday: {
    src: unsplash('photo-1518199266791-5385a46a7f0d'),
    alt: 'Birthday celebration table with dessert and decorations'
  },
  expo: {
    src: unsplash('photo-1517048676732-d65bc937f952'),
    alt: 'Expo hall with branded booths and open walkways'
  },
  private: {
    src: unsplash('photo-1504674900247-0877df9cc836'),
    alt: 'Private dinner table set for an intimate gathering'
  },
  custom: {
    src: unsplash('photo-1519389950473-47ba0277781c'),
    alt: 'Event planning workspace with notes, laptop, and mood board'
  }
}

export const VENUE_VISUALS = [
  {
    label: 'Grand ballroom',
    description: 'Formal seating and a polished arrival experience.',
    detail: 'Best for gala flow and wide guest circulation.',
    src: unsplash('photo-1519167758481-83f550bb49b3'),
    alt: 'Grand ballroom with chandeliers and banquet seating'
  },
  {
    label: 'Convention center',
    description: 'Flexible halls for speakers, booths, and branding.',
    detail: 'Best for large-scale sessions and vendor lanes.',
    src: unsplash('photo-1528605248644-14dd04022da1'),
    alt: 'Convention center hall with bright modern lighting'
  },
  {
    label: 'Rooftop venue',
    description: 'Open skyline views with a tighter guest footprint.',
    detail: 'Best for sunset programs and social flow.',
    src: unsplash('photo-1468071174046-657d9d351a40'),
    alt: 'Rooftop venue overlooking a city skyline at dusk'
  },
  {
    label: 'Private estate',
    description: 'Controlled entry, privacy, and flexible styling.',
    detail: 'Best for premium guest experience and decor.',
    src: unsplash('photo-1505693416388-ac5ce068fe85'),
    alt: 'Private estate with landscaped grounds and warm light'
  },
  {
    label: 'Warehouse venue',
    description: 'Industrial space for custom staging and build-outs.',
    detail: 'Best for flexible layouts and dramatic design.',
    src: unsplash('photo-1494526585095-c41746248156'),
    alt: 'Warehouse-style venue with open industrial interior'
  },
  {
    label: 'Outdoor festival ground',
    description: 'Room for zones, queues, and broader atmosphere.',
    detail: 'Best for tents, stages, and high-energy crowds.',
    src: unsplash('photo-1470225620780-dba8ba36b745'),
    alt: 'Outdoor festival ground with an open crowd area'
  }
] as const

export const VENDOR_SERVICE_VISUALS: Record<string, VisualAsset> = {
  Catering: {
    src: unsplash('photo-1504674900247-0877df9cc836'),
    alt: 'Catering table with plated dishes and warm table lighting'
  },
  'Lights and sounds': {
    src: unsplash('photo-1501386761578-eac5c94b800a'),
    alt: 'Live event stage with lights and sound setup'
  },
  'Event styling': {
    src: unsplash('photo-1518611012118-f4ae7a3b9d8f'),
    alt: 'Styled event table with decor accents and florals'
  },
  'Venue decoration': {
    src: unsplash('photo-1508610048659-a06b669e3321'),
    alt: 'Floral venue decoration with elegant warm tones'
  },
  Photography: {
    src: unsplash('photo-1500648767791-00dcc994a43e'),
    alt: 'Photographer capturing an event moment'
  },
  Videography: {
    src: unsplash('photo-1516321318423-f06f85e504b3'),
    alt: 'Camera crew filming a live presentation'
  },
  'Hosts / emcees': {
    src: unsplash('photo-1511578314322-379afb476865'),
    alt: 'Speaker presenting to an audience on stage'
  },
  Entertainment: {
    src: unsplash('photo-1511795409834-ef04bbd61622'),
    alt: 'Entertainment crowd under concert lighting'
  },
  Security: {
    src: unsplash('photo-1520607162513-77705c0f0d4a'),
    alt: 'Security team monitoring an event entrance'
  },
  Transportation: {
    src: unsplash('photo-1503376780353-7e6692767b70'),
    alt: 'Transportation vehicle ready for guest transfers'
  },
  'Equipment rental': {
    src: unsplash('photo-1486406146926-c627a92ad1ab'),
    alt: 'Equipment and production tools arranged on a workbench'
  },
  'Booth setup': {
    src: unsplash('photo-1517048676732-d65bc937f952'),
    alt: 'Expo booth setup with branded panels and open aisles'
  },
  'Stage production': {
    src: unsplash('photo-1516321318423-f06f85e504b3'),
    alt: 'Stage production setup with lighting and projection'
  },
  Florist: {
    src: unsplash('photo-1519741497674-611481863552'),
    alt: 'Floral arrangement for a celebration table'
  },
  'Event staff': {
    src: unsplash('photo-1521737604893-d14cc237f11d'),
    alt: 'Event staff collaborating around a service table'
  },
  'Cleanup crew': {
    src: unsplash('photo-1505693416388-ac5ce068fe85'),
    alt: 'Team restoring a venue after an event'
  }
}

export const PLAN_EVENT_PREVIEW_VISUALS = {
  setupSidebar: {
    title: 'Event setup',
    subtitle: 'Start from one of the live planning templates or build a fresh brief.',
    imageUrl: unsplash('photo-1519389950473-47ba0277781c'),
    imageAlt: 'Event planning desk with notebook, laptop, and sketches'
  },
  venue: {
    title: 'Venue framing',
    subtitle: 'Keep guest arrival, loading, and stage sightlines in view.',
    imageUrl: unsplash('photo-1519167758481-83f550bb49b3'),
    imageAlt: 'Elegant ballroom venue with chandeliers and rows of tables'
  },
  details: {
    title: 'Planning brief',
    subtitle: 'Capture the essentials before sending vendor requests.',
    imageUrl: unsplash('photo-1522202176988-66273c2fd55f'),
    imageAlt: 'Team meeting around a planning table with notes'
  },
  theme: {
    title: 'Theme board',
    subtitle: 'Palette, mood, and setup stay aligned in one view.',
    imageUrl: unsplash('photo-1518611012118-f4ae7a3b9d8f'),
    imageAlt: 'Styled event table with decor swatches and florals'
  },
  budget: {
    title: 'Budget snapshot',
    subtitle: 'Track guest count, spend, and schedule together.',
    imageUrl: unsplash('photo-1554224155-6726b3ff858f'),
    imageAlt: 'Planner desk with notes, calendar pages, and a laptop'
  },
  review: {
    title: 'Review board',
    subtitle: 'Check the final plan before creating the event brief.',
    imageUrl: unsplash('photo-1504674900247-0877df9cc836'),
    imageAlt: 'Elegant dinner table ready for a final event review'
  },
  submitted: {
    title: 'Procurement handoff',
    subtitle: 'Vendor matching begins from the selected services and setup.',
    imageUrl: unsplash('photo-1516321318423-f06f85e504b3'),
    imageAlt: 'Presentation screen and stage setup for event handoff'
  }
} as const

