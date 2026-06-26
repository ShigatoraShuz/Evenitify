export type EventTypeId =
  | 'wedding'
  | 'concert'
  | 'corporate'
  | 'conference'
  | 'product-launch'
  | 'festival'
  | 'birthday'
  | 'expo'
  | 'private'
  | 'custom'

export interface EventTypeOption {
  id: EventTypeId
  label: string
  description: string
  recommendedServices: string[]
  defaultTheme: string
  mood: string
}

export interface VendorServiceOption {
  id: string
  label: string
  description: string
  detail: string
}

export interface EventSetupPayload {
  title: string
  description: string
  eventType: EventTypeId
  venue: string
  theme: string
  colorPalette: string
  mood: string
  guests: number
  budget: number
  eventDate: string
  eventTime: string
  durationHours: number
  eventDays: number
  setupMode: 'indoor' | 'outdoor' | 'hybrid'
  seating: string
  stageSetup: string
  boothSetup: string
  cateringNeeds: string
  lightingNeeds: string
  soundNeeds: string
  decorationNeeds: string
  photographyNeeds: string
  securityNeeds: string
  transportationNeeds: string
  equipmentRentalNeeds: string
  specialRequirements: string
  vendorNotes: string
  selectedServices: string[]
}

export interface PlanEventFormState {
  eventType: EventTypeId
  venue: string
  title: string
  description: string
  theme: string
  colorPalette: string
  mood: string
  guests: string
  budget: string
  eventDate: string
  eventTime: string
  durationHours: string
  eventDays: string
  setupMode: 'indoor' | 'outdoor' | 'hybrid'
  seating: string
  stageSetup: string
  boothSetup: string
  cateringNeeds: string
  lightingNeeds: string
  soundNeeds: string
  decorationNeeds: string
  photographyNeeds: string
  securityNeeds: string
  transportationNeeds: string
  equipmentRentalNeeds: string
  specialRequirements: string
  vendorNotes: string
  selectedServices: string[]
}

export const EVENT_TYPE_OPTIONS: EventTypeOption[] = [
  {
    id: 'wedding',
    label: 'Wedding',
    description: 'Ceremony, reception, florals, photos, and guest flow.',
    recommendedServices: ['Catering', 'Venue decoration', 'Photography', 'Videography', 'Entertainment', 'Florist'],
    defaultTheme: 'Romantic ivory',
    mood: 'Warm, elegant, and celebratory'
  },
  {
    id: 'concert',
    label: 'Concert',
    description: 'Crowd movement, staging, AV, and security.',
    recommendedServices: ['Lights and sounds', 'Stage production', 'Security', 'Entertainment', 'Equipment rental', 'Event staff'],
    defaultTheme: 'High contrast performance',
    mood: 'Energetic, immersive, and bold'
  },
  {
    id: 'corporate',
    label: 'Corporate event',
    description: 'Brand-led gatherings, awards, and team events.',
    recommendedServices: ['Catering', 'Event styling', 'Booth setup', 'Photography', 'Event staff', 'Transportation'],
    defaultTheme: 'Clean corporate slate',
    mood: 'Professional, polished, and efficient'
  },
  {
    id: 'conference',
    label: 'Conference',
    description: 'Breakout sessions, speakers, and room logistics.',
    recommendedServices: ['Lights and sounds', 'Stage production', 'Booth setup', 'Event staff', 'Security', 'Transportation'],
    defaultTheme: 'Editorial conference grid',
    mood: 'Focused, informed, and structured'
  },
  {
    id: 'product-launch',
    label: 'Product launch',
    description: 'Reveal moments, demos, and media coverage.',
    recommendedServices: ['Stage production', 'Lights and sounds', 'Event styling', 'Photography', 'Videography', 'Booth setup'],
    defaultTheme: 'Launch-night chrome',
    mood: 'Fresh, premium, and media ready'
  },
  {
    id: 'festival',
    label: 'Festival',
    description: 'Zones, queues, vendors, and atmosphere.',
    recommendedServices: ['Security', 'Lights and sounds', 'Booth setup', 'Event staff', 'Transportation', 'Cleanup crew'],
    defaultTheme: 'Outdoor festival layers',
    mood: 'Alive, social, and high-energy'
  },
  {
    id: 'birthday',
    label: 'Birthday',
    description: 'Personal celebration with flexible decor and dining.',
    recommendedServices: ['Catering', 'Venue decoration', 'Photography', 'Entertainment', 'Event styling'],
    defaultTheme: 'Playful celebration',
    mood: 'Joyful, casual, and expressive'
  },
  {
    id: 'expo',
    label: 'Expo',
    description: 'Exhibitor traffic, booths, demos, and logistics.',
    recommendedServices: ['Booth setup', 'Equipment rental', 'Event staff', 'Security', 'Transportation', 'Lights and sounds'],
    defaultTheme: 'Exhibition hall grid',
    mood: 'Commercial, clear, and scalable'
  },
  {
    id: 'private',
    label: 'Private event',
    description: 'Invite-only gathering with tailored guest flow.',
    recommendedServices: ['Catering', 'Venue decoration', 'Photography', 'Event styling', 'Security'],
    defaultTheme: 'Intimate lounge',
    mood: 'Exclusive, calm, and refined'
  },
  {
    id: 'custom',
    label: 'Custom event',
    description: 'Build a tailored event from the ground up.',
    recommendedServices: ['Catering', 'Event styling', 'Lights and sounds', 'Security', 'Event staff'],
    defaultTheme: 'Custom planning system',
    mood: 'Flexible, curated, and adaptable'
  }
]

export const VENDOR_SERVICE_OPTIONS: VendorServiceOption[] = [
  { id: 'Catering', label: 'Catering', description: 'Menus, service style, and dietary handling.', detail: 'Taste tests, plating, and menu timing.' },
  { id: 'Lights and sounds', label: 'Lights and sounds', description: 'Technical production for atmosphere and clarity.', detail: 'Lighting plots, AV, and microphone coverage.' },
  { id: 'Event styling', label: 'Event styling', description: 'Visual direction for the space and tablescape.', detail: 'Branding, styling, and room dressing.' },
  { id: 'Venue decoration', label: 'Venue decoration', description: 'Floral and decorative build-out for the venue.', detail: 'Entry moments, backdrops, and table pieces.' },
  { id: 'Photography', label: 'Photography', description: 'Still coverage for the event story.', detail: 'Portraits, keynote moments, and highlights.' },
  { id: 'Videography', label: 'Videography', description: 'Motion coverage and recap deliverables.', detail: 'Highlight film, interviews, and reels.' },
  { id: 'Hosts / emcees', label: 'Hosts / emcees', description: 'On-stage hosting and audience guidance.', detail: 'Scripted transitions and live timing.' },
  { id: 'Entertainment', label: 'Entertainment', description: 'Performers, DJs, or interactive acts.', detail: 'Set timing, audience fit, and stage needs.' },
  { id: 'Security', label: 'Security', description: 'Crowd safety, access control, and incident response.', detail: 'Entry checks and perimeter coverage.' },
  { id: 'Transportation', label: 'Transportation', description: 'Transfers, shuttles, and guest arrival flow.', detail: 'VIP routes and pickup timing.' },
  { id: 'Equipment rental', label: 'Equipment rental', description: 'Furniture, staging, and operational gear.', detail: 'Audio, tables, chairs, and power.' },
  { id: 'Booth setup', label: 'Booth setup', description: 'Exhibitor booths, display walls, and kiosks.', detail: 'Layout, branding, and installation.' },
  { id: 'Stage production', label: 'Stage production', description: 'Stage build, cues, and show control.', detail: 'Run-of-show support and technical ops.' },
  { id: 'Florist', label: 'Florist', description: 'Floral installations and table arrangements.', detail: 'Centerpieces, entry pieces, and bouquets.' },
  { id: 'Event staff', label: 'Event staff', description: 'Front-of-house support and guest guidance.', detail: 'Check-in, direction, and floor support.' },
  { id: 'Cleanup crew', label: 'Cleanup crew', description: 'Post-event reset, waste handling, and breakdown.', detail: 'Fast site restoration and close-out.' }
]

export const EVENT_MOODS = ['Calm', 'Bold', 'Elegant', 'Festive', 'Editorial', 'Immersive', 'Minimal', 'Luxury']
export const COLOR_PALETTES = ['Ivory + gold', 'Midnight + silver', 'Sage + cream', 'Coral + sand', 'Black + white', 'Emerald + pearl', 'Cobalt + mist']
export const SETUP_MODES: Array<'indoor' | 'outdoor' | 'hybrid'> = ['indoor', 'outdoor', 'hybrid']
export const SEATING_OPTIONS = ['Banquet', 'Theater', 'Classroom', 'Cocktail', 'Cabaret', 'Cabaret rounds', 'Open floor']
export const STAGE_OPTIONS = ['None', 'Runway', 'Panel stage', 'Performance stage', 'Product reveal stage']
export const BOOTH_OPTIONS = ['No booths', 'Single feature booth', 'Multiple vendor booths', 'Expo grid', 'Live demo stations']

export const STEP_LABELS = [
  'Select Event Type',
  'Select Venue / Location',
  'Add Event Details',
  'Choose Theme and Setup',
  'Choose Needed Vendor Services',
  'Budget, Schedule, Guest Count',
  'Review and Confirm Event Plan'
]

export const TOTAL_STEPS = STEP_LABELS.length

export const STORAGE_KEY = 'eventify:plan-event-draft'

export const INITIAL_FORM_STATE: PlanEventFormState = {
  eventType: 'corporate',
  venue: 'Grand ballroom, convention center, or rooftop venue',
  title: '',
  description: '',
  theme: 'Clean corporate slate',
  colorPalette: 'Ivory + gold',
  mood: 'Professional, polished, and efficient',
  guests: '750',
  budget: '75000',
  eventDate: '',
  eventTime: '18:30',
  durationHours: '6',
  eventDays: '1',
  setupMode: 'indoor',
  seating: 'Banquet',
  stageSetup: 'Panel stage',
  boothSetup: 'Single feature booth',
  cateringNeeds: 'Full-service catering with a plated dinner and late-night bites.',
  lightingNeeds: 'Architectural wash lighting and focused stage spots.',
  soundNeeds: 'Distributed speakers, microphones, and show playback.',
  decorationNeeds: 'Minimal branding, sculptural florals, and table accents.',
  photographyNeeds: 'Editorial capture with a same-day social recap.',
  securityNeeds: 'Guest check-in, VIP escort, and perimeter coverage.',
  transportationNeeds: 'Shuttle support for VIP arrivals.',
  equipmentRentalNeeds: 'Tables, chairs, lecterns, power distribution, and staging.',
  specialRequirements: 'Accessible routes, quiet room, and vendor staging access.',
  vendorNotes: 'Prioritize vendors with premium presentation and fast response times.',
  selectedServices: EVENT_TYPE_OPTIONS[2].recommendedServices
}
