import { X, SlidersHorizontal } from 'lucide-react'
import type { VendorFilterState, MatchLevel, EventTypeId } from '../models/vendorMarketplace.model'
import { SERVICE_OPTIONS, EVENT_TYPE_OPTIONS_FILTER } from '../models/vendorMarketplace.model'

interface VendorMarketplaceFiltersProps {
  filters: VendorFilterState
  hasActiveFilters: boolean
  onUpdateFilters: (next: Partial<VendorFilterState>) => void
  onResetFilters: () => void
}

const MATCH_LEVEL_OPTIONS: Array<{ value: MatchLevel; label: string }> = [
  { value: 'recommended', label: 'Recommended Match' },
  { value: 'partial', label: 'Partial Match' },
]

const RATING_OPTIONS = [
  { value: 4.5, label: '4.5+' },
  { value: 4.0, label: '4.0+' },
  { value: 3.5, label: '3.5+' },
]

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'limited', label: 'Limited' },
  { value: 'unavailable', label: 'Unavailable' },
]

const CAPACITY_OPTIONS = [
  { value: 100, label: '100+' },
  { value: 300, label: '300+' },
  { value: 500, label: '500+' },
  { value: 1000, label: '1000+' },
]

export function VendorMarketplaceFilters({
  filters,
  hasActiveFilters,
  onUpdateFilters,
  onResetFilters,
}: VendorMarketplaceFiltersProps) {
  const toggleFilter = (key: 'service' | 'availability' | 'eventTypeExperience', value: string) => {
    const current = filters[key] as string[]
    const next = current.includes(value) ? current.filter((s) => s !== value) : [...current, value]
    onUpdateFilters({ [key]: next } as Partial<VendorFilterState>)
  }

  const isSelected = (key: 'service' | 'availability' | 'eventTypeExperience', value: string) =>
    (filters[key] as string[]).includes(value)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filters</span>
        </div>
        {hasActiveFilters && (
          <button onClick={onResetFilters} className="text-xs font-medium text-brand-600 hover:text-brand-700">
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Service
        </span>
        {SERVICE_OPTIONS.map((svc) => (
          <button
            key={svc}
            onClick={() => toggleFilter('service', svc)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
              isSelected('service', svc)
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700'
            }`}
          >
            {svc}
            {isSelected('service', svc) && <X className="h-3 w-3" />}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Location
        </span>
        <input
          type="text"
          value={filters.location}
          onChange={(e) => onUpdateFilters({ location: e.target.value })}
          placeholder="City or area..."
          className="h-7 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Budget
        </span>
        <input
          type="number"
          value={filters.budgetMin ?? ''}
          onChange={(e) => onUpdateFilters({ budgetMin: e.target.value ? Number(e.target.value) : null })}
          placeholder="Min $"
          className="h-7 w-20 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
        />
        <span className="self-center text-xs text-slate-400">-</span>
        <input
          type="number"
          value={filters.budgetMax ?? ''}
          onChange={(e) => onUpdateFilters({ budgetMax: e.target.value ? Number(e.target.value) : null })}
          placeholder="Max $"
          className="h-7 w-20 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Availability
        </span>
        {AVAILABILITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggleFilter('availability', opt.value)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
              isSelected('availability', opt.value)
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700'
            }`}
          >
            {opt.label}
            {isSelected('availability', opt.value) && <X className="h-3 w-3" />}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Capacity
        </span>
        {CAPACITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onUpdateFilters({ capacityMin: filters.capacityMin === opt.value ? null : opt.value })}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
              filters.capacityMin === opt.value
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Rating
        </span>
        {RATING_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onUpdateFilters({ ratingMin: filters.ratingMin === opt.value ? null : opt.value })}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
              filters.ratingMin === opt.value
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700'
            }`}
          >
            {opt.label} ★
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Event Type
        </span>
        {EVENT_TYPE_OPTIONS_FILTER.map((et) => (
          <button
            key={et}
            onClick={() => toggleFilter('eventTypeExperience', et)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize transition-all ${
              isSelected('eventTypeExperience', et)
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700'
            }`}
          >
            {et.replace('-', ' ')}
            {isSelected('eventTypeExperience', et) && <X className="h-3 w-3" />}
          </button>
        ))}
      </div>

      {(filters.matchLevel || null) && (
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Match
          </span>
          {MATCH_LEVEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdateFilters({ matchLevel: filters.matchLevel === opt.value ? null : opt.value })}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                filters.matchLevel === opt.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
