import { BadgeCheck, CalendarCheck, DollarSign, Eye, GitCompare, Heart, MapPin, Star } from 'lucide-react'
import type { VendorMarketplaceVendor } from '../models/vendorMarketplace.model'

interface VendorCardProps {
  vendor: VendorMarketplaceVendor
  showMatchScore: boolean
  isInCompare: boolean
  isSaved: boolean
  onCardClick: (vendor: VendorMarketplaceVendor) => void
  onToggleCompare: (id: string) => void
  onToggleSave: (id: string) => void
  onSendRequest: (vendor: VendorMarketplaceVendor) => void
}

export function VendorCard({
  vendor,
  showMatchScore,
  isInCompare,
  isSaved,
  onCardClick,
  onToggleCompare,
  onToggleSave,
  onSendRequest,
}: VendorCardProps) {
  const availabilityClasses = {
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    limited: 'bg-amber-50 text-amber-700 border-amber-200',
    unavailable: 'bg-rose-50 text-rose-700 border-rose-200',
  }[vendor.availabilityStatus]

  const availabilityLabel = {
    available: 'Available',
    limited: 'Limited',
    unavailable: 'Unavailable',
  }[vendor.availabilityStatus]

  const matchColor = vendor.matchScore >= 75 ? 'bg-emerald-500' : vendor.matchScore >= 40 ? 'bg-amber-500' : 'bg-slate-400'

  return (
    <article className={[
        'group relative overflow-hidden rounded-[26px] border border-slate-200/80',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,250,252,0.95)_100%)] p-5',
        'shadow-[0_14px_42px_rgba(15,23,42,0.05)]',
        'transition-all hover:-translate-y-0.5 hover:border-brand-200',
        'hover:shadow-[0_22px_60px_rgba(15,23,42,0.09)]',
      ].join(' ')}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-cyan-400 to-emerald-400" aria-hidden="true" />
      <div className="absolute right-4 top-4 flex items-center gap-1.5">
        <button
          onClick={(event) => { event.stopPropagation(); onToggleSave(vendor.id) }}
          className={
            'rounded-xl p-1.5 transition-colors focus:outline-none ' +
            'focus:ring-2 focus:ring-brand-200 ' +
            (isSaved ? 'bg-rose-50 text-rose-500' : 'text-slate-300 hover:bg-rose-50 hover:text-rose-400')
          }
          aria-label={isSaved ? 'Remove vendor from saved list' : 'Save vendor'}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-rose-500' : ''}`} />
        </button>
        <button
          onClick={(event) => { event.stopPropagation(); onToggleCompare(vendor.id) }}
          className={
            'rounded-xl p-1.5 transition-colors focus:outline-none ' +
            'focus:ring-2 focus:ring-brand-200 ' +
            (isInCompare ? 'bg-brand-50 text-brand-600' : 'text-slate-300 hover:bg-brand-50 hover:text-brand-500')
          }
          aria-label={isInCompare ? 'Remove vendor from comparison' : 'Add vendor to comparison'}
        >
          <GitCompare className="h-4 w-4" />
        </button>
      </div>

      <button type="button" onClick={() => onCardClick(vendor)} className="block w-full cursor-pointer text-left focus:outline-none">
        <div className="mb-4 flex items-start gap-3 pr-16">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-100 bg-[linear-gradient(135deg,rgba(8,145,178,0.14),rgba(16,185,129,0.14))] text-sm font-bold text-brand-700 shadow-sm">
            {vendor.businessName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-1.5">
              <h3 className="truncate text-base font-semibold text-slate-950">{vendor.businessName}</h3>
              {vendor.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-brand-500" />}
            </div>
            <p className="truncate text-xs text-slate-500">{vendor.serviceCategory.join(' - ')}</p>
            <p className="mt-1 truncate text-xs text-slate-400">{vendor.serviceArea}</p>
          </div>
        </div>

        {showMatchScore && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-slate-500">Requirements match</span>
              <span className="font-bold text-slate-900">{vendor.matchScore}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${matchColor}`} style={{ width: `${vendor.matchScore}%` }} />
            </div>
          </div>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {vendor.rating || 'N/A'}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {vendor.location}
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-800">
            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
            {vendor.startingPrice.toLocaleString()}+
          </span>
        </div>

        <p className="mb-3 line-clamp-2 text-xs leading-5 text-slate-500">{vendor.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${availabilityClasses}`}>
            {availabilityLabel}
          </span>
        </div>
      </button>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-4">
        <button
          onClick={() => onCardClick(vendor)}
          className={[
            'inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-600/20',
            'bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-sm',
            'transition-colors hover:bg-brand-700 focus:outline-none',
            'focus:ring-2 focus:ring-brand-200',
          ].join(' ')}
        >
          <Eye className="h-3.5 w-3.5" />
          Details
        </button>
        <button
          onClick={() => onCardClick(vendor)}
          className={[
            'inline-flex items-center justify-center gap-1.5 rounded-xl border',
            'border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600',
            'transition-colors hover:border-brand-300 hover:bg-slate-50',
            'focus:outline-none focus:ring-2 focus:ring-brand-200',
          ].join(' ')}
        >
          <CalendarCheck className="h-3.5 w-3.5" />
          Schedule
        </button>
        <button
          onClick={() => onSendRequest(vendor)}
          className={[
            'inline-flex items-center justify-center rounded-xl border',
            'border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600',
            'transition-colors hover:border-brand-300 hover:bg-slate-50',
            'focus:outline-none focus:ring-2 focus:ring-brand-200',
          ].join(' ')}
        >
          Request
        </button>
        <button
          onClick={() => onToggleCompare(vendor.id)}
          className={[
            'inline-flex items-center justify-center rounded-xl border',
            'border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600',
            'transition-colors hover:border-brand-300 hover:bg-slate-50',
            'focus:outline-none focus:ring-2 focus:ring-brand-200',
          ].join(' ')}
        >
          {isInCompare ? 'Remove' : 'Compare'}
        </button>
      </div>
    </article>
  )
}
