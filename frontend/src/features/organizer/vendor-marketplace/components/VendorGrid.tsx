import { PackageOpen, Filter, ShoppingBag } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { VendorCard } from './VendorCard'
import type { VendorMarketplaceVendor } from '../models/vendorMarketplace.model'

interface VendorGridProps {
  vendors: VendorMarketplaceVendor[]
  hasActiveFilters: boolean
  eventFilterActive: boolean
  isInCompare: (id: string) => boolean
  isSaved: (id: string) => boolean
  onVendorClick: (vendor: VendorMarketplaceVendor) => void
  onToggleCompare: (id: string) => void
  onToggleSave: (id: string) => void
  onSendRequest: (vendor: VendorMarketplaceVendor) => void
  onResetFilters: () => void
  onClearEventFilter: () => void
}

export function VendorGrid({
  vendors,
  hasActiveFilters,
  eventFilterActive,
  isInCompare,
  isSaved,
  onVendorClick,
  onToggleCompare,
  onToggleSave,
  onSendRequest,
  onResetFilters,
  onClearEventFilter,
}: VendorGridProps) {
  if (vendors.length === 0) {
    if (!eventFilterActive && !hasActiveFilters) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-16 text-center">
          <div className="rounded-full bg-slate-100 p-5 mb-4">
            <ShoppingBag className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">No vendors available yet</h3>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Vendor records will appear here after backend marketplace data is available. No mock vendors are shown in production.
          </p>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-12 text-center">
        <div className="rounded-full bg-slate-100 p-4 mb-4">
          <PackageOpen className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No vendors match all filters</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Try resetting filters or browse all categories to see available backend vendor records.
        </p>
        <div className="mt-5 flex items-center gap-3">
          {hasActiveFilters && (
            <Button variant="secondary" onClick={onResetFilters} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Reset Filters
            </Button>
          )}
          {eventFilterActive && (
            <Button variant="primary" onClick={onClearEventFilter}>
              Browse All Categories
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {vendors.map((vendor) => (
        <VendorCard
          key={vendor.id}
          vendor={vendor}
          showMatchScore={eventFilterActive}
          isInCompare={isInCompare(vendor.id)}
          isSaved={isSaved(vendor.id)}
          onCardClick={onVendorClick}
          onToggleCompare={onToggleCompare}
          onToggleSave={onToggleSave}
          onSendRequest={onSendRequest}
        />
      ))}
    </div>
  )
}
