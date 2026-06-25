import { X } from 'lucide-react'
import type { VendorFilterState, MatchLevel } from '../models/vendorMarketplace.model'
import { SERVICE_OPTIONS } from '../models/vendorMarketplace.model'
import { ComboBox } from '../../../../shared/components/ComboBox'

interface VendorMarketplaceFilterRowProps {
  filters: VendorFilterState
  onUpdateFilters: (next: Partial<VendorFilterState>) => void
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

export function VendorMarketplaceFilterRow({
  filters,
  onUpdateFilters,
}: VendorMarketplaceFilterRowProps) {
  const toggleFilter = (key: 'service' | 'availability', value: string) => {
    const current = filters[key] as string[]
    const next = current.includes(value) ? current.filter((s) => s !== value) : [...current, value]
    onUpdateFilters({ [key]: next } as Partial<VendorFilterState>)
  }

  const isSelected = (key: 'service' | 'availability', value: string) =>
    (filters[key] as string[]).includes(value)

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Service
        </span>
        <ComboBox<string>
          multiple
          searchIcon
          value={filters.service}
          onChange={(value) => onUpdateFilters({ service: value as string[] })}
          options={SERVICE_OPTIONS.map((svc) => ({ value: svc, label: svc }))}
          placeholder="Search services…"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Budget
        </span>
        <input
          type="number"
          value={filters.budgetMin ?? ''}
          onChange={(e) => onUpdateFilters({ budgetMin: e.target.value ? Number(e.target.value) : null })}
          placeholder="Min $"
          className={[
            'h-7 w-20 rounded-full border border-slate-200 bg-white',
            'px-3 text-xs font-medium text-slate-700 placeholder:text-slate-400',
            'focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200',
          ].join(' ')}
        />
        <span className="text-xs text-slate-400">-</span>
        <input
          type="number"
          value={filters.budgetMax ?? ''}
          onChange={(e) => onUpdateFilters({ budgetMax: e.target.value ? Number(e.target.value) : null })}
          placeholder="Max $"
          className={[
            'h-7 w-20 rounded-full border border-slate-200 bg-white',
            'px-3 text-xs font-medium text-slate-700 placeholder:text-slate-400',
            'focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200',
          ].join(' ')}
        />
      </div>

      <div className="flex items-center gap-2">
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

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Rating
        </span>
        <ComboBox<number>
          value={filters.ratingMin}
          onChange={(value) => onUpdateFilters({ ratingMin: Array.isArray(value) ? null : value })}
          options={RATING_OPTIONS.map((opt) => ({ value: opt.value, label: `${opt.label} ★` }))}
          placeholder="Minimum rating…"
        />
      </div>

      {(filters.matchLevel || null) && (
        <div className="flex items-center gap-2">
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
