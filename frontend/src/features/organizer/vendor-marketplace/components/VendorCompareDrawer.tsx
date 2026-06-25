import { X, Star, MapPin, DollarSign } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { StatusBadge } from '../../../../shared/components/StatusBadge'
import type { VendorMarketplaceVendor } from '../models/vendorMarketplace.model'

interface VendorCompareDrawerProps {
  open: boolean
  vendors: VendorMarketplaceVendor[]
  onClose: () => void
  onRemove: (id: string) => void
  onClear: () => void
  onSendRequest: (vendor: VendorMarketplaceVendor) => void
}

export function VendorCompareDrawer({
  open,
  vendors,
  onClose,
  onRemove,
  onClear,
  onSendRequest,
}: VendorCompareDrawerProps) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Compare Vendors</h2>
            <p className="text-sm text-slate-500">{vendors.length} of 4 selected</p>
          </div>
          <div className="flex items-center gap-2">
            {vendors.length > 0 && (
              <Button variant="ghost" onClick={onClear} className="text-xs">
                Clear all
              </Button>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {vendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-sm text-slate-500">Select vendors to compare side by side</p>
            </div>
          ) : (
            <div className="space-y-6">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{vendor.businessName}</h3>
                      <p className="text-xs text-slate-500">{vendor.serviceCategory.join(' · ')}</p>
                    </div>
                    <button
                      onClick={() => onRemove(vendor.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="font-medium">{vendor.rating}</span>
                        <span className="text-slate-400">Rating</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{vendor.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">${vendor.startingPrice.toLocaleString()}+</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase">Match</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                vendor.matchScore >= 75 ? 'bg-emerald-500' : vendor.matchScore >= 40 ? 'bg-amber-400' : 'bg-slate-300'
                              }`}
                              style={{ width: `${vendor.matchScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold">{vendor.matchScore}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase">Status</span>
                        <div className="mt-1">
                          <StatusBadge status={vendor.availabilityStatus} size="sm" />
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase">Packages</span>
                        <div className="mt-1 space-y-1">
                          {vendor.packageTiers.map((tier) => (
                            <div key={tier.name} className="text-xs">
                              <span className="font-medium text-slate-700">{tier.name}</span>
                              <span className="text-slate-500 ml-1">${tier.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <Button variant="primary" className="w-full text-xs" onClick={() => onSendRequest(vendor)}>
                      Send Request to {vendor.businessName}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
