import { Star, MapPin, BadgeCheck, Heart, GitCompare, X, Package } from 'lucide-react'
import { StatusBadge } from '../../../../shared/components/StatusBadge'
import { VendorAvailabilityCalendar } from './VendorAvailabilityCalendar'
import { VendorTimeSlotList } from './VendorTimeSlotList'
import type { RequestFormData, VendorMarketplaceVendor, VendorAvailability, TimeSlotType } from '../models/vendorMarketplace.model'

interface VendorDetailModalProps {
  open: boolean
  vendor: VendorMarketplaceVendor | null
  selectedDate: string | null
  selectedTimeSlot: TimeSlotType | null
  currentAvailability: VendorAvailability | null
  requestForm: RequestFormData
  isInCompare: (id: string) => boolean
  isSaved: (id: string) => boolean
  onClose: () => void
  onSelectDate: (date: string) => void
  onSelectTimeSlot: (slot: TimeSlotType) => void
  onUpdateRequestForm: (next: Partial<RequestFormData>) => void
  onSendRequest: (vendor: VendorMarketplaceVendor) => void
  onToggleCompare: (id: string) => void
  onToggleSave: (id: string) => void
}

type ParsedServiceContent = {
  text: string
  image: string | null
}

function parseServiceContent(description: string | null | undefined): ParsedServiceContent {
  const fallback = { text: description || '', image: null }
  if (!description) return fallback

  const raw = description.trim()
  if (!raw) return fallback

  if (!raw.startsWith('{') && !raw.startsWith('[')) return fallback

  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return {
        text: typeof parsed.text === 'string' && parsed.text.trim() ? parsed.text : description,
        image: typeof parsed.image === 'string' && parsed.image.trim() ? parsed.image : null,
      }
    }
  } catch {
    // Ignore malformed JSON and render the original text instead.
  }

  return fallback
}

export function VendorDetailModal({
  open,
  vendor,
  selectedDate,
  selectedTimeSlot,
  currentAvailability,
  requestForm,
  isInCompare,
  isSaved,
  onClose,
  onSelectDate,
  onSelectTimeSlot,
  onUpdateRequestForm,
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

  const vendorAvailability = currentAvailability?.vendorId === vendor.id ? currentAvailability : null
  const selectedServiceIds = requestForm.vendorId === vendor.id ? requestForm.selectedServiceIds : []
  const toggleService = (serviceId: string) => {
    const next = selectedServiceIds.includes(serviceId)
      ? selectedServiceIds.filter((id) => id !== serviceId)
      : [...selectedServiceIds, serviceId]
    onUpdateRequestForm({ selectedServiceIds: next })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl mx-4 my-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 truncate">{vendor.businessName}</h2>
                {vendor.verified && <BadgeCheck className="h-5 w-5 shrink-0 text-brand-500" />}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium">{vendor.location}</span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium">{vendor.serviceArea}</span>
                <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 font-medium text-brand-700">{vendor.serviceCategory.join(' · ')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => onToggleSave(vendor.id)}
                className={`rounded-lg p-2 transition-colors ${
                isSaved(vendor.id) ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-400 hover:bg-red-50'
              }`}
              title={isSaved(vendor.id) ? 'Remove from saved' : 'Save vendor'}
            >
              <Heart className={`h-4 w-4 ${isSaved(vendor.id) ? 'fill-red-500' : ''}`} />
            </button>
            <button
              onClick={() => onToggleCompare(vendor.id)}
                className={`rounded-lg p-2 transition-colors ${
                isInCompare(vendor.id) ? 'text-brand-600 bg-brand-50' : 'text-slate-400 hover:text-brand-500 hover:bg-brand-50'
              }`}
              title={isInCompare(vendor.id) ? 'Remove from compare' : 'Add to compare'}
            >
              <GitCompare className="h-4 w-4" />
            </button>
              <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <section className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                Rating
              </div>
              <p className="text-2xl font-bold tracking-tight text-slate-900">{vendor.rating}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <MapPin className="h-3 w-3" />
                Location
              </div>
              <p className="text-sm font-semibold text-slate-900">{vendor.location || 'Not specified'}</p>
              <p className="mt-1 text-xs text-slate-500">{vendor.serviceArea || 'Service area not specified'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <BadgeCheck className="h-3 w-3" />
                Member Since
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {new Date(vendor.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">About</h3>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">{vendor.description || 'No description provided.'}</p>
          </section>

          <section className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Select Services</h3>
                <p className="text-xs text-slate-500">Choose one or more services before sending the request.</p>
              </div>
              {selectedServiceIds.length > 0 && (
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  {selectedServiceIds.length} selected
                </span>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {vendor.services.map((service) => {
                const selected = selectedServiceIds.includes(service.id)
                const parsedContent = parseServiceContent(service.description)
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`group overflow-hidden rounded-2xl border text-left transition-all ${
                      selected
                        ? 'border-brand-300 bg-brand-50/60 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50'
                    }`}
                  >
                    {parsedContent.image ? (
                      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                        <img
                          src={parsedContent.image}
                          alt={service.serviceName}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent" />
                        <div className="absolute left-3 top-3">
                          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700 backdrop-blur">
                            {service.category}
                          </span>
                        </div>
                        <div className="absolute right-3 top-3">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm ${selected ? 'bg-brand-600 text-white' : 'bg-white/90 text-slate-600 backdrop-blur'}`}>
                            {selected ? 'Selected' : 'Tap to select'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className={`flex h-40 w-full flex-col items-center justify-center border-b px-4 text-center transition-colors ${
                        selected ? 'bg-brand-50/70 border-brand-200' : 'bg-slate-50 border-slate-100 group-hover:bg-brand-50/50'
                      }`}>
                        <Package className="mb-2 h-9 w-9 text-slate-300 transition-colors group-hover:text-brand-200" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">{service.category}</span>
                        <span className={`mt-2 rounded-full px-2.5 py-1 text-[10px] font-semibold ${selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {selected ? 'Selected' : 'Tap to select'}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{service.serviceName}</p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{service.category}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold text-brand-700">
                        ${service.basePrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="px-4 pb-4">
                      <p className="line-clamp-2 text-xs leading-5 text-slate-600">
                        {parsedContent.text || 'No description provided.'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {vendorAvailability && (
            <section className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Availability Calendar</h3>
                  <p className="text-xs text-slate-500">Live availability for {vendor.businessName}</p>
                </div>
                <StatusBadge status={vendor.availabilityStatus} size="sm" />
              </div>
              <VendorAvailabilityCalendar
                availability={vendorAvailability}
                selectedDate={selectedDate}
                eventDate={null}
                onSelectDate={onSelectDate}
              />
            </section>
          )}

          {!vendorAvailability && (
            <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-700">Availability Calendar</h3>
              <p className="text-sm text-slate-500">Loading live availability for {vendor.businessName}.</p>
            </section>
          )}

          {selectedDate && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">
                Available Time Slots for {formatDate(selectedDate)}
              </h3>
              <VendorTimeSlotList
                slots={vendorAvailability?.days.find((d) => d.date === selectedDate)?.slots || []}
                selectedSlot={selectedTimeSlot}
                onSelectSlot={onSelectTimeSlot}
              />
            </section>
          )}

          <div className="sticky bottom-0 flex items-center gap-3 border-t border-slate-100 bg-white pt-4">
            <button
              onClick={() => onSendRequest(vendor)}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Send Request
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
