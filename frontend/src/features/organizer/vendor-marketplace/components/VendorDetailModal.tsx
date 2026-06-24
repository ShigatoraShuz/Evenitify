import { Star, MapPin, Users, ShieldCheck, Clock, BadgeCheck, Heart, GitCompare, X } from 'lucide-react'
import { StatusBadge } from '../../../../shared/components/StatusBadge'
import { VendorImageGallery } from './VendorImageGallery'
import { VendorAvailabilityCalendar } from './VendorAvailabilityCalendar'
import { VendorTimeSlotList } from './VendorTimeSlotList'
import type { VendorMarketplaceVendor, VendorAvailability, TimeSlotType } from '../models/vendorMarketplace.model'

interface VendorDetailModalProps {
  open: boolean
  vendor: VendorMarketplaceVendor | null
  selectedGalleryImage: string
  selectedDate: string | null
  selectedTimeSlot: TimeSlotType | null
  currentAvailability: VendorAvailability | null
  eventFilterActive: boolean
  isInCompare: (id: string) => boolean
  isSaved: (id: string) => boolean
  requestStatus: string | null
  onClose: () => void
  onSelectGalleryImage: (url: string) => void
  onSelectDate: (date: string) => void
  onSelectTimeSlot: (slot: TimeSlotType) => void
  onSendRequest: (vendor: VendorMarketplaceVendor) => void
  onToggleCompare: (id: string) => void
  onToggleSave: (id: string) => void
}

export function VendorDetailModal({
  open,
  vendor,
  selectedGalleryImage,
  selectedDate,
  selectedTimeSlot,
  currentAvailability,
  eventFilterActive,
  isInCompare,
  isSaved,
  requestStatus,
  onClose,
  onSelectGalleryImage,
  onSelectDate,
  onSelectTimeSlot,
  onSendRequest,
  onToggleCompare,
  onToggleSave,
}: VendorDetailModalProps) {
  if (!open || !vendor) return null

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch { return d }
  }

  const availabilityColor = {
    available: 'bg-emerald-100 text-emerald-700',
    limited: 'bg-amber-100 text-amber-700',
    unavailable: 'bg-red-100 text-red-700',
  }[vendor.availabilityStatus]

  const availabilityLabel = {
    available: 'Available',
    limited: 'Limited',
    unavailable: 'Unavailable',
  }[vendor.availabilityStatus]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl mx-4 my-8 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900 truncate">{vendor.businessName}</h2>
            {vendor.verified && <BadgeCheck className="h-5 w-5 text-brand-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(vendor.id)}
              className={`p-2 rounded-lg transition-colors ${
                isSaved(vendor.id) ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-400 hover:bg-red-50'
              }`}
              title={isSaved(vendor.id) ? 'Remove from saved' : 'Save vendor'}
            >
              <Heart className={`h-4 w-4 ${isSaved(vendor.id) ? 'fill-red-500' : ''}`} />
            </button>
            <button
              onClick={() => onToggleCompare(vendor.id)}
              className={`p-2 rounded-lg transition-colors ${
                isInCompare(vendor.id) ? 'text-brand-600 bg-brand-50' : 'text-slate-400 hover:text-brand-500 hover:bg-brand-50'
              }`}
              title={isInCompare(vendor.id) ? 'Remove from compare' : 'Add to compare'}
            >
              <GitCompare className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <VendorImageGallery
            images={vendor.galleryImages}
            selectedImage={selectedGalleryImage}
            onSelect={onSelectGalleryImage}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold uppercase mb-1">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                Rating
              </div>
              <p className="text-lg font-bold text-slate-900">{vendor.rating}</p>
              <p className="text-[10px] text-slate-400">{vendor.totalReviews} reviews</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold uppercase mb-1">
                <MapPin className="h-3 w-3" />
                Location
              </div>
              <p className="text-sm font-semibold text-slate-900 truncate">{vendor.location}</p>
              <p className="text-[10px] text-slate-400">{vendor.serviceArea}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold uppercase mb-1">
                <Users className="h-3 w-3" />
                Capacity
              </div>
              <p className="text-lg font-bold text-slate-900">{vendor.capacity.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">guests max</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold uppercase mb-1">
                <Clock className="h-3 w-3" />
                Response
              </div>
              <p className="text-lg font-bold text-slate-900">{vendor.responseTime}</p>
              <p className="text-[10px] text-slate-400">{vendor.responseRate} rate</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">About</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{vendor.description}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {requestStatus && <StatusBadge status={requestStatus} size="sm" />}
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${availabilityColor}`}>
              {availabilityLabel}
            </span>
            {vendor.serviceCategory.map((cat) => (
              <span key={cat} className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 px-2.5 py-1 text-xs font-medium">
                {cat}
              </span>
            ))}
            {vendor.eventTypeExperience.map((et) => (
              <span key={et} className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 px-2.5 py-1 text-xs font-medium capitalize">
                {et.replace('-', ' ')}
              </span>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Packages & Pricing</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {vendor.packageTiers.map((tier) => (
                <div key={tier.name} className="rounded-xl border border-slate-200 p-4">
                  <h4 className="text-sm font-bold text-slate-900">{tier.name}</h4>
                  <p className="text-lg font-bold text-brand-600 mt-1">${tier.price.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">{tier.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">What's Included</h3>
              <ul className="space-y-1.5">
                {vendor.inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-slate-600">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Add-Ons</h3>
              <ul className="space-y-1.5">
                {vendor.addOns.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-brand-500 mt-0.5 shrink-0">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {currentAvailability && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Availability Calendar</h3>
              <VendorAvailabilityCalendar
                availability={currentAvailability}
                selectedDate={selectedDate}
                eventDate={null}
                onSelectDate={onSelectDate}
              />
            </div>
          )}

          {selectedDate && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Available Time Slots for {formatDate(selectedDate)}
              </h3>
              <VendorTimeSlotList
                slots={currentAvailability?.days.find((d) => d.date === selectedDate)?.slots || []}
                selectedSlot={selectedTimeSlot}
                onSelectSlot={onSelectTimeSlot}
              />
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Reviews & Testimonials</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {vendor.reviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                        {review.authorAvatar}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{review.authorName}</p>
                        <p className="text-[10px] text-slate-400">{review.eventType} · {formatDate(review.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-slate-700">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Cancellation Policy</h3>
            <p className="text-xs text-slate-500">{vendor.cancellationPolicy}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Booking Notes</h3>
            <p className="text-xs text-slate-500">{vendor.bookingNotes}</p>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-slate-100 pt-4 flex items-center gap-3">
            <button
              onClick={() => onSendRequest(vendor)}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              {eventFilterActive ? 'Send Request' : 'Send Request'}
            </button>
            <button
              onClick={() => onToggleCompare(vendor.id)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                isInCompare(vendor.id)
                  ? 'border-brand-300 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              {isInCompare(vendor.id) ? 'In Compare' : 'Add to Compare'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
