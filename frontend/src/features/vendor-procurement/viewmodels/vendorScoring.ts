import type { EventRequirement } from '../../../services/eventService'
import type { VendorSearchResult } from '../../../services/vendorService'
import type { VendorFilterState, VendorRecommendation } from '../models/vendor-procurement.model'
import { PROCUREMENT_SCORING_WEIGHTS } from '../models/vendor-procurement.model'

function hasBudgetFit(vendor: VendorSearchResult, requirement: EventRequirement | null) {
  if (!requirement?.max_budget) return false
  return vendor.services?.some((service) => service.base_price <= Number(requirement.max_budget)) || false
}

export function buildVendorRecommendations(
  vendors: VendorSearchResult[],
  requirement: EventRequirement | null,
  filters: VendorFilterState
): VendorRecommendation[] {
  const highestRating = Math.max(...vendors.map((vendor) => vendor.rating || 0), 0)

  return vendors.map((vendor) => {
    const insights: VendorRecommendation['insights'] = []
    let score = 0

    if ((vendor.rating || 0) >= Math.max(4, highestRating)) {
      score += PROCUREMENT_SCORING_WEIGHTS.rating
      insights.push({ label: 'Highest rated', tone: 'success' })
    } else if ((vendor.rating || 0) >= 3.5) {
      score += Math.round(PROCUREMENT_SCORING_WEIGHTS.rating * 0.7)
      insights.push({ label: 'Well rated', tone: 'neutral' })
    }

    if (hasBudgetFit(vendor, requirement)) {
      score += PROCUREMENT_SCORING_WEIGHTS.budgetFit
      insights.push({ label: 'Budget fit', tone: 'success' })
    } else if (requirement?.max_budget) {
      insights.push({ label: 'Review budget', tone: 'warning' })
    }

    if (vendor.services?.some((service) => service.availability_status === 'available')) {
      score += PROCUREMENT_SCORING_WEIGHTS.availability
      insights.push({ label: 'Fastest available', tone: 'success' })
    }

    if (vendor.verification_status === 'verified') {
      score += PROCUREMENT_SCORING_WEIGHTS.verification
      insights.push({ label: 'Verified', tone: 'success' })
    }

    if (filters.location && vendor.service_area?.toLowerCase().includes(filters.location.toLowerCase())) {
      score += PROCUREMENT_SCORING_WEIGHTS.serviceArea
      insights.push({ label: 'Service area match', tone: 'success' })
    } else if (vendor.service_area) {
      score += Math.round(PROCUREMENT_SCORING_WEIGHTS.serviceArea * 0.4)
    }

    return { vendorId: vendor.id, score: Math.min(score, 100), insights }
  }).sort((a, b) => b.score - a.score)
}
