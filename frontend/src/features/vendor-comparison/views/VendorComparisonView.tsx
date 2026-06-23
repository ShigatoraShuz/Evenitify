import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import type { CompareVendor, ShortlistEntry } from '../models/vendor-comparison.model'

interface VendorComparisonViewProps {
  compareVendors: CompareVendor[]
  shortlist: ShortlistEntry[]
  loading: boolean
  error: string | null
  onRemoveFromCompare: (vendorId: string) => void
  onClearComparison: () => void
  onAddToShortlist: (vendorId: string) => void
  onRemoveFromShortlist: (vendorId: string) => void
  isInShortlist: (vendorId: string) => boolean
  onClearError: () => void
}

export function VendorComparisonView({
  compareVendors,
  shortlist,
  loading,
  error,
  onRemoveFromCompare,
  onClearComparison,
  onAddToShortlist,
  onRemoveFromShortlist,
  isInShortlist,
  onClearError
}: VendorComparisonViewProps) {
  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Vendor Comparison"
        subtitle="Compare vendors side by side"
        action={
          compareVendors.length > 1 && (
            <Button variant="secondary" onClick={onClearComparison}>Clear All</Button>
          )
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={onClearError} className="text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}

      {shortlist.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Shortlist ({shortlist.length})</h3>
          <div className="flex flex-wrap gap-2">
            {shortlist.map((entry) => {
              const vendor = compareVendors.find((v) => v.id === entry.vendorId)
              return (
                <div key={entry.vendorId} className="bg-white rounded-lg px-3 py-1.5 text-sm flex items-center gap-2 border border-blue-100">
                  <span className="text-blue-800">{vendor?.businessName || entry.vendorId}</span>
                  <button onClick={() => onRemoveFromShortlist(entry.vendorId)} className="text-blue-400 hover:text-blue-600">&times;</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {compareVendors.length === 0 ? (
        <EmptyState
          title="No vendors selected"
          description="Search for vendors and add them to compare side by side"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white rounded-xl border border-gray-200">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-[140px]">Vendor</th>
                {compareVendors.map((v) => (
                  <th key={v.id} className="px-4 py-3 text-center min-w-[200px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold text-gray-900">{v.businessName}</span>
                      <Button variant="ghost" onClick={() => onRemoveFromCompare(v.id)} className="text-xs text-red-500">
                        Remove
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-3 font-medium text-gray-700">Rating</td>
                {compareVendors.map((v) => (
                  <td key={v.id} className="px-4 py-3 text-center text-yellow-600">★ {v.rating || 'N/A'}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-700">Service Area</td>
                {compareVendors.map((v) => (
                  <td key={v.id} className="px-4 py-3 text-center text-gray-600">{v.serviceArea || '-'}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-700">Verification</td>
                {compareVendors.map((v) => (
                  <td key={v.id} className="px-4 py-3 text-center"><StatusBadge status={v.verificationStatus} size="sm" /></td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-700">Services</td>
                {compareVendors.map((v) => (
                  <td key={v.id} className="px-4 py-3">
                    <div className="space-y-1">
                      {v.services.map((s, i) => (
                        <div key={i} className="text-xs bg-gray-50 rounded px-2 py-1">
                          <span className="font-medium">{s.serviceName}</span>
                          <span className="text-gray-500 ml-1">(${s.basePrice})</span>
                          <span className={`ml-1 ${s.availabilityStatus === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                            {s.availabilityStatus}
                          </span>
                        </div>
                      ))}
                      {v.services.length === 0 && <span className="text-gray-400 text-xs">No services listed</span>}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-700">Action</td>
                {compareVendors.map((v) => (
                  <td key={v.id} className="px-4 py-3 text-center">
                    {isInShortlist(v.id) ? (
                      <Button variant="secondary" onClick={() => onRemoveFromShortlist(v.id)}>Remove from Shortlist</Button>
                    ) : (
                      <Button onClick={() => onAddToShortlist(v.id)}>Add to Shortlist</Button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  )
}
