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

export type SetupMode = 'indoor' | 'outdoor' | 'hybrid'

export interface EventBrief {
  eventId: string
  eventType: EventTypeId
  eventName: string
  location: string
  eventDate: string
  startTime: string
  endTime: string
  guestCount: number
  budget: number
  selectedTheme: string
  setupStyle: SetupMode
  selectedVendorServices: string[]
  indoorOutdoorType: SetupMode
  specialRequirements: string
  preferredPackageTier: 'basic' | 'premium' | 'luxury'
}

export type MatchLevel = 'recommended' | 'partial' | 'none'

export interface VendorGalleryImage {
  url: string
  label: string
}

export interface VendorReview {
  id: string
  authorName: string
  authorAvatar: string
  rating: number
  date: string
  text: string
  eventType: string
}

export interface VendorMarketplaceVendor {
  id: string
  businessName: string
  serviceCategory: string[]
  location: string
  serviceArea: string
  startingPrice: number
  rating: number
  completedBookings: number
  capacity: number
  availabilityStatus: 'available' | 'limited' | 'unavailable'
  matchScore: number
  matchLevel: MatchLevel
  eventTypeExperience: EventTypeId[]
  packageHighlights: string[]
  packageTiers: Array<{
    name: string
    price: number
    description: string
  }>
  verified: boolean
  responseTime: string
  description: string
  galleryImages: VendorGalleryImage[]
  reviews: VendorReview[]
  inclusions: string[]
  addOns: string[]
  cancellationPolicy: string
  bookingNotes: string
  memberSince: string
  responseRate: string
  totalReviews: number
}

export type TimeSlotType = 'morning' | 'afternoon' | 'evening' | 'full_day'

export interface TimeSlot {
  label: string
  value: TimeSlotType
  isOccupied: boolean
}

export interface AvailabilityDay {
  date: string
  status: 'available' | 'occupied' | 'partial' | 'booked'
  slots: TimeSlot[]
}

export interface VendorAvailability {
  vendorId: string
  year: number
  month: number
  days: AvailabilityDay[]
}

export interface BookingRequestData {
  eventBriefId?: string
  vendorId: string
  vendorName: string
  packageName?: string
  selectedDate: string
  selectedTimeSlot: TimeSlotType
  message: string
}

export interface EventBriefReference {
  id: string
  eventName: string
  eventType: string
  eventDate: string
}

export interface VendorFilterState {
  service: string[]
  location: string
  budgetMin: number | null
  budgetMax: number | null
  availability: string[]
  capacityMin: number | null
  ratingMin: number | null
  matchLevel: MatchLevel | null
  eventTypeExperience: EventTypeId[]
}

export const DEFAULT_VENDOR_FILTERS: VendorFilterState = {
  service: [],
  location: '',
  budgetMin: null,
  budgetMax: null,
  availability: [],
  capacityMin: null,
  ratingMin: null,
  matchLevel: null,
  eventTypeExperience: [],
}

export type ProcurementStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'quoted'
  | 'negotiating'
  | 'accepted'
  | 'rejected'
  | 'contract_pending'
  | 'confirmed'

export interface ProcurementRequest {
  id: string
  eventId: string
  vendorId: string
  vendorName: string
  serviceCategory: string
  status: ProcurementStatus
  requestedBudget: number | null
  notes: string
  createdAt: string
  updatedAt: string
}

export interface RequestFormData {
  vendorId: string
  vendorName: string
  serviceCategory: string
  requestedBudget: string
  notes: string
}

export interface CompareEntry {
  vendorId: string
  addedAt: string
}

const SHARED_REVIEWS: VendorReview[] = [
  { id: 'r1', authorName: 'Sarah Mitchell', authorAvatar: 'SM', rating: 5, date: '2026-05-12', text: 'Absolutely exceptional service. Professional team that delivered beyond expectations. Highly recommend for any event.', eventType: 'Corporate Gala' },
  { id: 'r2', authorName: 'James Rodriguez', authorAvatar: 'JR', rating: 5, date: '2026-04-28', text: 'Seamless execution from start to finish. The attention to detail was remarkable.', eventType: 'Wedding Reception' },
  { id: 'r3', authorName: 'Emily Chen', authorAvatar: 'EC', rating: 4, date: '2026-03-15', text: 'Great value for the quality. Would definitely work with them again for future events.', eventType: 'Product Launch' },
  { id: 'r4', authorName: 'Michael Torres', authorAvatar: 'MT', rating: 5, date: '2026-02-20', text: 'Transformed our venue into something magical. The team was responsive and creative.', eventType: 'Annual Conference' },
]

function mockGallery(label: string, id: string, index: number): VendorGalleryImage {
  return { url: `https://placehold.co/800x500/183446/ffffff?text=${encodeURIComponent(label)}`, label }
}

function buildGallery(service: string, id: string): VendorGalleryImage[] {
  const labels: Record<string, string[]> = {
    'Elevate Events Co.': ['Catering setup', 'Venue styling', 'Event decoration', 'Table arrangement', 'Buffet presentation', 'Dinner setup'],
    'Stellar Sound & Light': ['Sound system setup', 'Lighting rig', 'Stage lighting', 'AV control booth', 'LED wall display', 'Speaker array'],
    'Bloom & Petal Florals': ['Floral arch', 'Centerpiece design', 'Bouquet arrangement', 'Venue flowers', 'Table floral', 'Entry display'],
    'Capture The Moment Media': ['Wedding photography', 'Event candid shot', 'Drone aerial view', 'Photo booth setup', 'Video highlight', 'Studio portrait'],
    'Premier Security Solutions': ['Security checkpoint', 'Crowd management', 'VIP escort', 'Surveillance setup', 'Access control', 'Security briefing'],
    'Gourmet Table Catering': ['Plated dinner', 'Buffet setup', 'Cocktail service', 'Dessert table', 'Chef station', 'Wine pairing'],
    'EventStaff Pro': ['Staff briefing', 'Check-in desk', 'Guest assistance', 'Crowd direction', 'Event support', 'Coordinator team'],
    'Luxe Transport & Logistics': ['VIP fleet', 'Shuttle service', 'Equipment transport', 'Luxury sedan', 'Guest arrival', 'Logistics coordination'],
    'MegaStage Productions': ['Main stage build', 'LED wall setup', 'Rigging system', 'Stage lighting', 'Performance setup', 'Production control'],
    'The Booth Architect': ['Exhibition booth', 'Interactive display', 'Brand wall', 'Product demo', 'Booth design', 'Trade show setup'],
    'DJ Beats & Entertainment': ['DJ equipment', 'Dance floor setup', 'MC performance', 'Photo booth', 'Lighting effects', 'Sound check'],
  }
  const items = labels[service] || [`${service} gallery`]
  return items.map((label, i) => mockGallery(label, id, i))
}

export const MOCK_VENDORS: VendorMarketplaceVendor[] = [
  {
    id: 'v1',
    businessName: 'Elevate Events Co.',
    serviceCategory: ['Catering', 'Event styling', 'Venue decoration'],
    location: 'New York, NY',
    serviceArea: 'Northeast US',
    startingPrice: 2500,
    rating: 4.8,
    completedBookings: 142,
    capacity: 500,
    availabilityStatus: 'available',
    matchScore: 0,
    matchLevel: 'none',
    eventTypeExperience: ['wedding', 'corporate', 'private'],
    packageHighlights: ['Custom menu tasting', 'Full-service staffing', 'Premium tableware'],
    packageTiers: [
      { name: 'Silver', price: 2500, description: 'Basic catering for up to 100 guests' },
      { name: 'Gold', price: 5000, description: 'Premium catering with styling for 250 guests' },
      { name: 'Platinum', price: 9000, description: 'Full-service luxury for up to 500 guests' },
    ],
    verified: true,
    responseTime: '< 2 hours',
    description: 'Full-service event production company specializing in catering, styling, and venue transformation. Our team of seasoned professionals brings over a decade of experience creating memorable experiences across the Northeast.',
    galleryImages: buildGallery('Elevate Events Co.', 'v1'),
    reviews: SHARED_REVIEWS,
    inclusions: ['Full-service staff', 'Premium tableware setup', 'Menu tasting session', 'Day-of coordination', 'Cleanup & breakdown'],
    addOns: ['Custom cake design (+$500)', 'Late-night snack bar (+$800)', 'Sommelier pairing (+$1,200)'],
    cancellationPolicy: 'Full refund up to 14 days before event. 50% refund up to 7 days. Non-refundable within 7 days.',
    bookingNotes: 'A 25% deposit is required to secure the date. Final headcount due 7 days before event.',
    memberSince: 'January 2020',
    responseRate: '98%',
    totalReviews: 142,
  },
  {
    id: 'v2',
    businessName: 'Stellar Sound & Light',
    serviceCategory: ['Lights and sounds', 'Stage production', 'Equipment rental'],
    location: 'Brooklyn, NY',
    serviceArea: 'Northeast US',
    startingPrice: 1800,
    rating: 4.6,
    completedBookings: 98,
    capacity: 1000,
    availabilityStatus: 'available',
    matchScore: 0,
    matchLevel: 'none',
    eventTypeExperience: ['concert', 'festival', 'conference', 'corporate'],
    packageHighlights: ['Full AV setup', 'LED wall included', 'Sound engineering'],
    packageTiers: [
      { name: 'Basic', price: 1800, description: 'Sound system for up to 200 guests' },
      { name: 'Pro', price: 4200, description: 'Full AV with lighting for 500 guests' },
      { name: 'Premium', price: 8500, description: 'Immersive production for 1000+ guests' },
    ],
    verified: true,
    responseTime: '< 1 hour',
    description: 'Premier audio-visual production company delivering world-class sound, lighting, and stage production. From intimate corporate events to large-scale concerts, we bring the technical excellence your event deserves.',
    galleryImages: buildGallery('Stellar Sound & Light', 'v2'),
    reviews: SHARED_REVIEWS,
    inclusions: ['Professional sound system', 'LED lighting package', 'Technical engineer on-site', 'Setup & strike', 'Sound check'],
    addOns: ['LED video wall (+$2,000)', 'Confetti cannon (+$400)', 'Hazer machine (+$300)'],
    cancellationPolicy: 'Full refund up to 21 days before event. 50% up to 14 days. Non-refundable after.',
    bookingNotes: 'Site visit required for venues over 500 capacity. Additional fees may apply for outdoor events.',
    memberSince: 'March 2019',
    responseRate: '99%',
    totalReviews: 98,
  },
  {
    id: 'v3',
    businessName: 'Bloom & Petal Florals',
    serviceCategory: ['Venue decoration', 'Florist', 'Event styling'],
    location: 'Manhattan, NY',
    serviceArea: 'Northeast US',
    startingPrice: 1200,
    rating: 4.9,
    completedBookings: 215,
    capacity: 300,
    availabilityStatus: 'limited',
    matchScore: 0,
    matchLevel: 'none',
    eventTypeExperience: ['wedding', 'birthday', 'private', 'corporate'],
    packageHighlights: ['Bespoke floral design', 'Installation & breakdown', 'Seasonal arrangements'],
    packageTiers: [
      { name: 'Essentials', price: 1200, description: 'Table arrangements and bouquets' },
      { name: 'Deluxe', price: 3500, description: 'Full venue floral with arch' },
      { name: 'Premium', price: 7000, description: 'Luxury floral experience for grand venues' },
    ],
    verified: true,
    responseTime: '< 3 hours',
    description: 'Award-winning floral design studio crafting stunning botanical experiences. Our arrangements blend seasonal blooms with artistic vision to create unforgettable atmospheres for any occasion.',
    galleryImages: buildGallery('Bloom & Petal Florals', 'v3'),
    reviews: SHARED_REVIEWS,
    inclusions: ['Consultation & design proposal', 'Fresh seasonal flowers', 'Installation & styling', 'Breakdown & cleanup', 'Vase/candle rentals'],
    addOns: ['Custom floral arch (+$900)', 'Bridal bouquet (+$350)', 'Flower wall backdrop (+$1,500)'],
    cancellationPolicy: 'Full refund up to 30 days before event. 75% up to 14 days. 50% up to 7 days.',
    bookingNotes: 'Seasonal flower availability may affect final pricing. A consultation is required before booking.',
    memberSince: 'June 2018',
    responseRate: '97%',
    totalReviews: 215,
  },
  {
    id: 'v4',
    businessName: 'Capture The Moment Media',
    serviceCategory: ['Photography', 'Videography'],
    location: 'Boston, MA',
    serviceArea: 'Northeast US',
    startingPrice: 2200,
    rating: 4.7,
    completedBookings: 176,
    capacity: 200,
    availabilityStatus: 'available',
    matchScore: 0,
    matchLevel: 'none',
    eventTypeExperience: ['wedding', 'corporate', 'conference', 'product-launch'],
    packageHighlights: ['Same-day edit', 'Drone coverage', 'Online gallery'],
    packageTiers: [
      { name: 'Standard', price: 2200, description: '6 hours single photographer' },
      { name: 'Premium', price: 4000, description: '8 hours dual photographer + video' },
      { name: 'Ultimate', price: 7000, description: 'Full team coverage with highlight reel' },
    ],
    verified: true,
    responseTime: '< 4 hours',
    description: 'Premium photography and videography studio specializing in event coverage. We capture the moments that matter with editorial-quality imagery and cinematic storytelling.',
    galleryImages: buildGallery('Capture The Moment Media', 'v4'),
    reviews: SHARED_REVIEWS,
    inclusions: ['Professional editing', 'Online proofing gallery', 'Print-ready images', 'Highlight reel (video packages)', 'Photo booth (select packages)'],
    addOns: ['Drone coverage (+$600)', 'Same-day edit (+$900)', 'Second shooter (+$500/hr)'],
    cancellationPolicy: 'Full refund up to 14 days. 50% up to 7 days. Non-refundable within 7 days.',
    bookingNotes: 'Travel fees may apply outside of Boston metro area. Final image count varies by event duration.',
    memberSince: 'September 2019',
    responseRate: '95%',
    totalReviews: 176,
  },
  {
    id: 'v5',
    businessName: 'Premier Security Solutions',
    serviceCategory: ['Security', 'Event staff'],
    location: 'Newark, NJ',
    serviceArea: 'Northeast US',
    startingPrice: 800,
    rating: 4.5,
    completedBookings: 89,
    capacity: 2000,
    availabilityStatus: 'available',
    matchScore: 0,
    matchLevel: 'none',
    eventTypeExperience: ['concert', 'festival', 'conference', 'expo', 'corporate'],
    packageHighlights: ['24/7 monitoring', 'Trained personnel', 'Access control systems'],
    packageTiers: [
      { name: 'Basic', price: 800, description: '2 guards for 4 hours' },
      { name: 'Standard', price: 2000, description: '4 guards with check-in for full day' },
      { name: 'Premium', price: 5000, description: 'Full security team with CCTV' },
    ],
    verified: true,
    responseTime: '< 1 hour',
    description: 'Trusted security provider for events of all scales. Our licensed professionals deliver comprehensive safety solutions including crowd management, access control, and VIP protection.',
    galleryImages: buildGallery('Premier Security Solutions', 'v5'),
    reviews: SHARED_REVIEWS,
    inclusions: ['Licensed security personnel', 'Access control setup', 'Incident reporting', 'Radio communication', 'Pre-event risk assessment'],
    addOns: ['CCTV system (+$800)', 'VIP personal detail (+$400/guard)', 'Metal detectors (+$300 each)'],
    cancellationPolicy: 'Full refund up to 7 days before event. 50% up to 48 hours. Non-refundable within 48 hours.',
    bookingNotes: 'A site walk-through is required for events over 1,000 guests. All personnel are licensed and insured.',
    memberSince: 'November 2017',
    responseRate: '99%',
    totalReviews: 89,
  },
  {
    id: 'v6',
    businessName: 'Gourmet Table Catering',
    serviceCategory: ['Catering'],
    location: 'Stamford, CT',
    serviceArea: 'Northeast US',
    startingPrice: 3500,
    rating: 4.4,
    completedBookings: 67,
    capacity: 400,
    availabilityStatus: 'unavailable',
    matchScore: 0,
    matchLevel: 'none',
    eventTypeExperience: ['wedding', 'corporate', 'private'],
    packageHighlights: ['Farm-to-table menu', 'Sommelier pairing', 'Custom cake'],
    packageTiers: [
      { name: 'Bistro', price: 3500, description: 'Buffet for up to 100 guests' },
      { name: 'Grand', price: 6500, description: 'Plated dinner for 250 guests' },
      { name: 'Luxe', price: 11000, description: 'Fine dining experience for 400 guests' },
    ],
    verified: false,
    responseTime: '< 6 hours',
    description: 'Farm-to-table catering company passionate about locally sourced ingredients and exceptional culinary experiences. Every menu is crafted from scratch with seasonal, sustainable produce.',
    galleryImages: buildGallery('Gourmet Table Catering', 'v6'),
    reviews: SHARED_REVIEWS,
    inclusions: ['Custom menu design', 'Professional waitstaff', 'Table setup & linens', 'Cleanup service', 'Food presentation'],
    addOns: ['Sommelier wine pairing (+$45/person)', 'Custom wedding cake (+$600)', 'Late-night station (+$900)'],
    cancellationPolicy: 'Full refund up to 21 days. 50% up to 14 days. Non-refundable after.',
    bookingNotes: 'A tasting session is required for all catering bookings. Dietary restrictions can be accommodated with advance notice.',
    memberSince: 'February 2021',
    responseRate: '92%',
    totalReviews: 67,
  },
  {
    id: 'v7',
    businessName: 'EventStaff Pro',
    serviceCategory: ['Event staff', 'Cleanup crew'],
    location: 'Philadelphia, PA',
    serviceArea: 'Mid-Atlantic US',
    startingPrice: 600,
    rating: 4.3,
    completedBookings: 134,
    capacity: 1500,
    availabilityStatus: 'available',
    matchScore: 0,
    matchLevel: 'none',
    eventTypeExperience: ['conference', 'expo', 'corporate', 'festival'],
    packageHighlights: ['Uniformed staff', 'Multi-shift coverage', 'Pre-event briefing'],
    packageTiers: [
      { name: 'Starter', price: 600, description: '4 staff for 4 hours' },
      { name: 'Standard', price: 1500, description: '8 staff for full day' },
      { name: 'Premium', price: 3500, description: 'Full crew with supervisor' },
    ],
    verified: true,
    responseTime: '< 2 hours',
    description: 'Reliable event staffing agency providing trained professionals for every role. From registration desks to cleanup crews, we ensure your event runs smoothly with the right people in place.',
    galleryImages: buildGallery('EventStaff Pro', 'v7'),
    reviews: SHARED_REVIEWS,
    inclusions: ['Uniformed staff', 'Pre-event training', 'On-site supervisor (Premium)', 'Scheduling coordination', 'Timesheet reporting'],
    addOns: ['Bilingual staff (+$50/person)', 'Lead supervisor (+$300)', 'Extended hours (+$40/person/hr)'],
    cancellationPolicy: 'Full refund up to 7 days. 50% up to 48 hours. Non-refundable within 48 hours.',
    bookingNotes: 'Staff count must be confirmed 5 days before event. Overtime is billed at 1.5x hourly rate.',
    memberSince: 'August 2019',
    responseRate: '96%',
    totalReviews: 134,
  },
  {
    id: 'v8',
    businessName: 'Luxe Transport & Logistics',
    serviceCategory: ['Transportation', 'Equipment rental'],
    location: 'Jersey City, NJ',
    serviceArea: 'Northeast US',
    startingPrice: 1500,
    rating: 4.7,
    completedBookings: 203,
    capacity: 800,
    availabilityStatus: 'available',
    matchScore: 0,
    matchLevel: 'none',
    eventTypeExperience: ['wedding', 'corporate', 'private', 'festival'],
    packageHighlights: ['VIP fleet', 'Shuttle coordination', 'Equipment hauling'],
    packageTiers: [
      { name: 'Economy', price: 1500, description: 'Shuttle service for 50 guests' },
      { name: 'Business', price: 3500, description: 'Executive transport for 100 guests' },
      { name: 'Premium', price: 7000, description: 'Full fleet with VIP convoy' },
    ],
    verified: true,
    responseTime: '< 3 hours',
    description: 'Comprehensive transportation and logistics company serving the tri-state area. We provide luxury guest transport, equipment hauling, and full logistical coordination for events.',
    galleryImages: buildGallery('Luxe Transport & Logistics', 'v8'),
    reviews: SHARED_REVIEWS,
    inclusions: ['Professional chauffeurs', 'Route planning', 'On-time guarantee', 'Vehicle sanitization', 'Coordination team'],
    addOns: ['VIP sedan upgrade (+$400)', 'Extended service hours (+$200/hr)', 'Additional vehicle (+$800)'],
    cancellationPolicy: 'Full refund up to 14 days. 50% up to 7 days. Non-refundable within 7 days.',
    bookingNotes: 'Fuel and toll charges included. Parking fees not included for venues with paid parking.',
    memberSince: 'March 2018',
    responseRate: '97%',
    totalReviews: 203,
  },
  {
    id: 'v9',
    businessName: 'MegaStage Productions',
    serviceCategory: ['Stage production', 'Lights and sounds', 'Booth setup'],
    location: 'Secaucus, NJ',
    serviceArea: 'Northeast US',
    startingPrice: 5000,
    rating: 4.9,
    completedBookings: 312,
    capacity: 5000,
    availabilityStatus: 'limited',
    matchScore: 0,
    matchLevel: 'none',
    eventTypeExperience: ['concert', 'festival', 'conference', 'product-launch', 'expo'],
    packageHighlights: ['Custom stage design', 'Rigging & truss', 'LED video walls'],
    packageTiers: [
      { name: 'Stage Only', price: 5000, description: 'Basic stage setup for events' },
      { name: 'Production', price: 12000, description: 'Full production with AV' },
      { name: 'Festival', price: 25000, description: 'Large-scale festival production' },
    ],
    verified: true,
    responseTime: '< 2 hours',
    description: 'Industry-leading stage production company with over 300 successful events. We design and build spectacular stages, rigging systems, and immersive production environments.',
    galleryImages: buildGallery('MegaStage Productions', 'v9'),
    reviews: SHARED_REVIEWS,
    inclusions: ['Stage design & engineering', 'Structural rigging', 'Lighting grid', 'Sound system integration', 'On-site production team'],
    addOns: ['LED video wall (+$3,500)', 'Confetti/effects system (+$1,000)', 'Custom staging (+$2,000)'],
    cancellationPolicy: 'Full refund up to 60 days. 75% up to 30 days. 50% up to 14 days. Non-refundable after.',
    bookingNotes: 'A site inspection is mandatory for all productions. Load-in time must be scheduled at least 24 hours before event.',
    memberSince: 'January 2016',
    responseRate: '98%',
    totalReviews: 312,
  },
  {
    id: 'v10',
    businessName: 'The Booth Architect',
    serviceCategory: ['Booth setup', 'Event styling'],
    location: 'New York, NY',
    serviceArea: 'Northeast US',
    startingPrice: 2000,
    rating: 4.6,
    completedBookings: 87,
    capacity: 100,
    availabilityStatus: 'available',
    matchScore: 0,
    matchLevel: 'none',
    eventTypeExperience: ['expo', 'conference', 'product-launch', 'corporate'],
    packageHighlights: ['Custom booth design', 'Interactive elements', 'Brand integration'],
    packageTiers: [
      { name: 'Standard', price: 2000, description: '10x10 booth with graphics' },
      { name: 'Premium', price: 5000, description: '20x20 booth with interactive displays' },
      { name: 'Immersive', price: 12000, description: 'Full brand activation experience' },
    ],
    verified: true,
    responseTime: '< 4 hours',
    description: 'Creative exhibition booth design and build company. We craft brand experiences that captivate audiences through innovative booth design, interactive technology, and compelling visual storytelling.',
    galleryImages: buildGallery('The Booth Architect', 'v10'),
    reviews: SHARED_REVIEWS,
    inclusions: ['Custom booth design', 'Graphic production', 'Installation & dismantle', 'Storage during event', 'Project management'],
    addOns: ['Interactive touchscreen (+$1,200)', 'Branded flooring (+$600)', 'Lighting upgrade (+$800)'],
    cancellationPolicy: 'Full refund up to 30 days. 75% up to 14 days. 50% up to 7 days. Non-refundable within 7 days.',
    bookingNotes: 'Booth size and layout must be confirmed 3 weeks before event. Additional charges apply for weekend installations.',
    memberSince: 'July 2020',
    responseRate: '94%',
    totalReviews: 87,
  },
  {
    id: 'v11',
    businessName: 'DJ Beats & Entertainment',
    serviceCategory: ['Entertainment', 'Hosts / emcees', 'Lights and sounds'],
    location: 'Brooklyn, NY',
    serviceArea: 'Northeast US',
    startingPrice: 1000,
    rating: 4.5,
    completedBookings: 156,
    capacity: 600,
    availabilityStatus: 'available',
    matchScore: 0,
    matchLevel: 'none',
    eventTypeExperience: ['wedding', 'birthday', 'corporate', 'private'],
    packageHighlights: ['Professional DJ', 'MC services', 'Dance floor lighting'],
    packageTiers: [
      { name: 'DJ Set', price: 1000, description: '4-hour DJ set with basic sound' },
      { name: 'Party Package', price: 2500, description: 'DJ + MC + lighting for 6 hours' },
      { name: 'Ultimate', price: 5000, description: 'Full entertainment with photo booth' },
    ],
    verified: false,
    responseTime: '< 1 hour',
    description: 'High-energy entertainment company bringing the party to life. Professional DJs, charismatic MCs, and full lighting setups to keep your guests dancing all night long.',
    galleryImages: buildGallery('DJ Beats & Entertainment', 'v11'),
    reviews: SHARED_REVIEWS,
    inclusions: ['Professional DJ equipment', 'Wireless microphone', 'Dance floor lighting', 'Music planning consultation', 'Setup & breakdown'],
    addOns: ['Photo booth (+$600)', 'Karaoke setup (+$400)', 'Custom playlist (+$200)'],
    cancellationPolicy: 'Full refund up to 14 days. 50% up to 7 days. Non-refundable within 7 days.',
    bookingNotes: 'A playlist consultation is included. Requests for specific equipment must be made at least 2 weeks in advance.',
    memberSince: 'October 2020',
    responseRate: '96%',
    totalReviews: 156,
  },
]

export function getAllVendors(): VendorMarketplaceVendor[] {
  return MOCK_VENDORS.map((v) => ({ ...v, matchScore: 0, matchLevel: 'none' as MatchLevel }))
}

export function computeMatchScore(vendor: VendorMarketplaceVendor, brief: EventBrief): number {
  let score = 0
  const maxScore = 100

  const serviceMatch = vendor.serviceCategory.some((cat) =>
    brief.selectedVendorServices.some((s) => cat.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(cat.toLowerCase()))
  )
  if (serviceMatch) score += 25

  const locationMatch = vendor.serviceArea.toLowerCase().includes(brief.location.toLowerCase().split(',')[0].trim().toLowerCase())
  if (locationMatch) score += 15

  const typeMatch = vendor.eventTypeExperience.includes(brief.eventType)
  if (typeMatch) score += 15

  const capacityMatch = vendor.capacity >= brief.guestCount
  if (capacityMatch) score += 10
  else if (vendor.capacity >= brief.guestCount * 0.7) score += 5

  const budgetPerService = brief.budget / Math.max(brief.selectedVendorServices.length, 1)
  const priceFit = vendor.startingPrice <= budgetPerService * 1.3
  if (priceFit) score += 15
  else if (vendor.startingPrice <= budgetPerService * 2) score += 7

  if (vendor.rating >= 4.5) score += 8
  else if (vendor.rating >= 4.0) score += 5
  else if (vendor.rating >= 3.5) score += 3

  if (vendor.completedBookings >= 100) score += 7
  else if (vendor.completedBookings >= 50) score += 4
  else score += 2

  const availabilityScore = vendor.availabilityStatus === 'available' ? 5 : vendor.availabilityStatus === 'limited' ? 2 : 0
  score += availabilityScore

  return Math.min(Math.round(score), maxScore)
}

export function computeMatchLevel(score: number): MatchLevel {
  if (score >= 75) return 'recommended'
  if (score >= 40) return 'partial'
  return 'none'
}

export function buildMarketplaceVendors(brief: EventBrief): VendorMarketplaceVendor[] {
  return MOCK_VENDORS.map((vendor) => {
    const matchScore = computeMatchScore(vendor, brief)
    const matchLevel = computeMatchLevel(matchScore)
    return { ...vendor, matchScore, matchLevel }
  }).sort((a, b) => b.matchScore - a.matchScore)
}

export function buildBriefFromForm(
  eventId: string,
  formData: {
    eventType: EventTypeId
    title: string
    venue: string
    eventDate: string
    eventTime: string
    durationHours: string
    guests: string
    budget: string
    theme: string
    setupMode: SetupMode
    selectedServices: string[]
    specialRequirements: string
  }
): EventBrief {
  const startHour = parseInt(formData.eventTime.split(':')[0], 10) || 18
  const duration = parseInt(formData.durationHours, 10) || 6
  const endHour = (startHour + duration) % 24
  const endTime = `${String(endHour).padStart(2, '0')}:${formData.eventTime.split(':')[1] || '00'}`
  const guestCount = parseInt(formData.guests, 10) || 100
  const budget = parseInt(formData.budget, 10) || 50000

  let tier: 'basic' | 'premium' | 'luxury' = 'premium'
  const perGuest = budget / guestCount
  if (perGuest < 50) tier = 'basic'
  else if (perGuest >= 200) tier = 'luxury'

  return {
    eventId,
    eventType: formData.eventType,
    eventName: formData.title || 'Untitled Event',
    location: formData.venue,
    eventDate: formData.eventDate,
    startTime: formData.eventTime,
    endTime,
    guestCount,
    budget,
    selectedTheme: formData.theme,
    setupStyle: formData.setupMode,
    selectedVendorServices: formData.selectedServices,
    indoorOutdoorType: formData.setupMode,
    specialRequirements: formData.specialRequirements,
    preferredPackageTier: tier,
  }
}

export function buildMockAvailability(vendorId: string): VendorAvailability {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const daysInMonth = new Date(year, month, 0).getDate()
  const days: AvailabilityDay[] = []

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dayOfWeek = new Date(year, month - 1, d).getDay()

    let status: AvailabilityDay['status'] = 'available'
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      status = Math.random() > 0.4 ? 'available' : 'occupied'
    } else {
      status = Math.random() > 0.7 ? 'available' : Math.random() > 0.5 ? 'partial' : 'occupied'
    }

    const slots: TimeSlot[] = [
      { label: 'Morning (8AM - 12PM)', value: 'morning', isOccupied: status === 'occupied' || (status === 'partial' && d % 3 === 0) },
      { label: 'Afternoon (12PM - 5PM)', value: 'afternoon', isOccupied: status === 'occupied' || (status === 'partial' && d % 2 === 0) },
      { label: 'Evening (5PM - 10PM)', value: 'evening', isOccupied: status === 'occupied' },
      { label: 'Full Day', value: 'full_day', isOccupied: status === 'occupied' },
    ]

    days.push({ date: dateStr, status, slots })
  }

  return { vendorId, year, month, days }
}

export const MOCK_EVENT_BRIEFS: EventBriefReference[] = [
  { id: 'evt-1', eventName: 'Summer Wedding Gala', eventType: 'Wedding', eventDate: '2026-08-15' },
  { id: 'evt-2', eventName: 'Tech Conference 2026', eventType: 'Conference', eventDate: '2026-09-20' },
  { id: 'evt-3', eventName: 'Corporate Anniversary', eventType: 'Corporate', eventDate: '2026-07-10' },
]

export const SERVICE_OPTIONS = [
  'Catering',
  'Lights and sounds',
  'Event styling',
  'Venue decoration',
  'Photography',
  'Videography',
  'Entertainment',
  'Security',
  'Transportation',
  'Equipment rental',
  'Booth setup',
  'Stage production',
  'Event staff',
  'Cleanup crew',
]

export const EVENT_TYPE_OPTIONS_FILTER: EventTypeId[] = [
  'wedding', 'concert', 'corporate', 'conference', 'product-launch',
  'festival', 'birthday', 'expo', 'private',
]
