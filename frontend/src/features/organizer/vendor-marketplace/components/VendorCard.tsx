import { Star, MapPin, DollarSign, BadgeCheck, Heart, GitCompare } from 'lucide-react'
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
  isSaved: saved,
  onCardClick,
  onToggleCompare,
  onToggleSave,
  onSendRequest,
}: VendorCardProps) {
  const availabilityColor = {
    available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    limited: 'bg-amber-100 text-amber-700 border-amber-200',
    unavailable: 'bg-red-100 text-red-700 border-red-200',
  }[vendor.availabilityStatus]

  const availabilityLabel = {
    available: 'Available',
    limited: 'Limited',
    unavailable: 'Unavailable',
  }[vendor.availabilityStatus]

  const matchColor = vendor.matchScore >= 75
    ? 'bg-emerald-500'
    : vendor.matchScore >= 40
    ? 'bg-amber-500'
    : 'bg-slate-400'

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:shadow-lg hover:border-brand-200 hover:-translate-y-0.5">
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave(vendor.id) }}
          className={`p-1.5 rounded-lg transition-colors ${
            saved ? 'text-red-500 bg-red-50' : 'text-slate-300 hover:text-red-400 hover:bg-red-50'
          }`}
          title={saved ? 'Remove from saved' : 'Save vendor'}
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-red-500' : ''}`} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCompare(vendor.id) }}
          className={`p-1.5 rounded-lg transition-colors ${
            isInCompare ? 'text-brand-600 bg-brand-50' : 'text-slate-300 hover:text-brand-500 hover:bg-brand-50'
          }`}
          title={isInCompare ? 'Remove from compare' : 'Add to compare'}
        >
          <GitCompare className="h-4 w-4" />
        </button>
      </div>

      <div className="cursor-pointer" onClick={() => onCardClick(vendor)}>
        <div className="flex items-start justify-between mb-3 pr-16">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-base font-semibold text-slate-900 truncate">{vendor.businessName}</h3>
              {vendor.verified && <BadgeCheck className="h-4 w-4 text-brand-500 shrink-0" />}
            </div>
            <p className="text-xs text-slate-500 truncate">{vendor.serviceCategory.join(' · ')}</p>
          </div>
        </div>

        {showMatchScore && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">Match score</span>
              <span className="font-bold text-slate-900">{vendor.matchScore}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full rounded-full ${matchColor}`} style={{ width: `${vendor.matchScore}%` }} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-600 mb-3">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            {vendor.rating}
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

        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{vendor.description}</p>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${availabilityColor}`}>
            {availabilityLabel}
          </span>
          <span className="text-[10px] text-slate-400">{vendor.completedBookings} bookings</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onCardClick(vendor)}
          className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => onSendRequest(vendor)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-brand-300 transition-colors"
        >
          Send Request
        </button>
      </div>
    </div>
  )
}
