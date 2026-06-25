import { Search } from 'lucide-react'
import type { VendorFilterState } from '../models/vendorMarketplace.model'

interface VendorMarketplaceFiltersProps {
  filters: VendorFilterState
  hasActiveFilters: boolean
  onUpdateFilters: (next: Partial<VendorFilterState>) => void
  onResetFilters: () => void
}

export function VendorMarketplaceFilters({
  filters,
  hasActiveFilters,
  onUpdateFilters,
  onResetFilters,
}: VendorMarketplaceFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-start">
      <div className="flex flex-wrap gap-2">
        <label className="relative block">
          <span className="sr-only">Search vendors by city or service area</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.location}
            onChange={(e) => onUpdateFilters({ location: e.target.value })}
            placeholder="Search city or service area..."
            className={[
              'h-10 w-full rounded-2xl border border-slate-200 bg-white',
              'pl-9 pr-3 text-sm font-medium text-slate-700',
              'placeholder:text-slate-400 focus:border-brand-400',
              'focus:outline-none focus:ring-2 focus:ring-brand-100 sm:w-72',
            ].join(' ')}
          />
        </label>
        <select
          disabled
          title="Sort is disabled until backend ordering is available."
          className="h-10 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-400"
          aria-label="Sort vendors, disabled until backend ordering is available"
        >
          <option>Sort by backend ranking</option>
        </select>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className={[
              'rounded-2xl border border-slate-200 bg-white',
              'px-3 py-2 text-xs font-semibold text-brand-600',
              'hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-200',
            ].join(' ')}
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
