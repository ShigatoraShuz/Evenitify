import type { VendorSearchResult } from '../../../services/vendorService'

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

export function buildCompareVendors(results: VendorSearchResult[]): CompareVendor[] {
  return results.map((r) => ({
    id: r.id,
    businessName: r.business_name,
    serviceArea: r.service_area,
    rating: r.rating,
    verificationStatus: r.verification_status || 'pending',
    services: (r.services || []).map((s) => ({
      category: s.category,
      serviceName: s.service_name,
      basePrice: s.base_price,
      availabilityStatus: s.availability_status
    }))
  }))
}
