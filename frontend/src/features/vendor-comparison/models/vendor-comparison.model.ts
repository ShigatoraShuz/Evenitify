export interface CompareVendor {
  id: string
  businessName: string
  serviceArea: string | null
  rating: number
  verificationStatus: string
  services: CompareService[]
}

export interface CompareService {
  category: string
  serviceName: string
  basePrice: number
  availabilityStatus: string
}

export interface ShortlistEntry {
  vendorId: string
  addedAt: string
  notes: string
}

export interface ComparisonState {
  selectedVendors: CompareVendor[]
  shortlist: ShortlistEntry[]
}

export function buildCompareVendors(results: Record<string, unknown>[]): CompareVendor[] {
  return results.map((r) => ({
    id: r.id as string,
    businessName: r.business_name as string,
    serviceArea: r.service_area as string | null,
    rating: r.rating as number,
    verificationStatus: (r.verification_status as string) || 'pending',
    services: ((r.services as Record<string, unknown>[]) || []).map((s) => ({
      category: s.category as string,
      serviceName: s.service_name as string,
      basePrice: s.base_price as number,
      availabilityStatus: s.availability_status as string
    }))
  }))
}
