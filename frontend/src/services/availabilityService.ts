export type AvailabilityStatus = 'available' | 'limited' | 'unavailable'

export interface AvailabilityDay {
  date: string
  status: AvailabilityStatus
  label: string
}

export interface BlockedDate {
  id: string
  date: string
  reason: string
}

export interface VendorAvailabilityPreview {
  vendorId: string
  status: AvailabilityStatus
  days: AvailabilityDay[]
  blockedDates: BlockedDate[]
  conflictDate: string | null
  conflictReason: string | null
  updatedAt: string
}

const today = new Date()
const addDays = (days: number) => {
  const date = new Date(today)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

const buildDays = (seed: number): AvailabilityDay[] =>
  Array.from({ length: 14 }).map((_, index) => {
    const date = addDays(index + 1)
    const blocked = (index + seed) % 6 === 0
    const limited = (index + seed) % 4 === 0
    return {
      date,
      status: blocked ? 'unavailable' : limited ? 'limited' : 'available',
      label: blocked ? 'Booked' : limited ? 'Limited crew' : 'Open'
    }
  })

const buildPreview = (vendorId: string, seed: number): VendorAvailabilityPreview => {
  const days = buildDays(seed)
  const blockedDates = days
    .filter((day) => day.status === 'unavailable')
    .slice(0, 4)
    .map((day, index) => ({
      id: `${vendorId}-blocked-${index}`,
      date: day.date,
      reason: index % 2 === 0 ? 'Existing large event booking' : 'Crew blackout'
    }))
  const conflict = days.find((day) => day.status === 'unavailable')

  return {
    vendorId,
    status: days.some((day) => day.status === 'available') ? 'available' : 'limited',
    days,
    blockedDates,
    conflictDate: conflict?.date || null,
    conflictReason: conflict ? 'Selected event date may overlap a blocked vendor date.' : null,
    updatedAt: new Date().toISOString()
  }
}

export const availabilityService = {
  // Future endpoint: GET /vendors/:vendorId/availability?eventId=:eventId
  getVendorAvailabilityPreview: async (vendorId: string, eventId?: string | null): Promise<VendorAvailabilityPreview> =>
    buildPreview(vendorId, (eventId?.length || 0) + vendorId.length),

  // Future endpoint: GET /vendor/availability
  getMyAvailability: async (): Promise<VendorAvailabilityPreview> =>
    buildPreview('current-vendor', 3),

  // Future endpoint: PATCH /vendor/availability/status
  updateMyAvailabilityStatus: async (status: AvailabilityStatus): Promise<VendorAvailabilityPreview> => {
    const preview = buildPreview('current-vendor', status === 'available' ? 1 : status === 'limited' ? 4 : 6)
    return { ...preview, status, updatedAt: new Date().toISOString() }
  }
}

