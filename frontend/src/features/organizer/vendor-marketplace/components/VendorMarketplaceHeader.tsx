import { ShoppingBag } from 'lucide-react'

export function VendorMarketplaceHeader() {
  return (
    <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-4 shadow-md">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-white/20 p-2">
          <ShoppingBag className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Vendor Marketplace</h2>
          <p className="text-sm text-brand-100">
            Browse vendors, compare services, check availability, and send requests.
          </p>
        </div>
      </div>
    </div>
  )
}
