import { useNavigate } from 'react-router-dom'
import { GitCompare, Plus, Star } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { EmptyStateCard, OrganizerCard, OrganizerPage, OrganizerPageHeader, SectionHeader } from '../../../shared/components/OrganizerUI'
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

const comparisonRows = [
  'Service category',
  'Rating',
  'Price range',
  'Availability',
  'Location',
  'Capacity',
  'Response time',
  'Requirements match',
  'Notes',
]

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
  const navigate = useNavigate()

  if (loading) {
    return (
      <DashboardShell>
        <OrganizerPage>
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}</div>
        </OrganizerPage>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <OrganizerPage>
        <OrganizerPageHeader
          title="Compare Vendors"
          description="Evaluate selected vendors side by side before sending requests or building a shortlist."
          action={
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate('/organizer/vendor-marketplace')}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Vendor
              </Button>
              {compareVendors.length > 1 && <Button variant="secondary" onClick={onClearComparison}>Clear All</Button>}
            </div>
          }
        />

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <div className="flex items-center justify-between gap-3">
              <span>{error}</span>
              <button onClick={onClearError} className="font-medium">Dismiss</button>
            </div>
          </div>
        )}

        {shortlist.length > 0 && (
          <OrganizerCard>
            <SectionHeader title={`Shortlist (${shortlist.length})`} description="Vendors marked as preferred during comparison." />
            <div className="flex flex-wrap gap-2">
              {shortlist.map((entry) => {
                const vendor = compareVendors.find((v) => v.id === entry.vendorId)
                return (
                  <div key={entry.vendorId} className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm">
                    <span className="font-semibold text-blue-900">{vendor?.businessName || entry.vendorId}</span>
                    <button onClick={() => onRemoveFromShortlist(entry.vendorId)} className="text-blue-500 hover:text-blue-700" aria-label="Remove vendor from shortlist">Remove</button>
                  </div>
                )
              })}
            </div>
          </OrganizerCard>
        )}

        {compareVendors.length === 0 ? (
          <EmptyStateCard
            title="Select vendors to compare"
            description="Add real vendors from the marketplace to compare service fit, pricing, availability, and notes."
            icon={GitCompare}
            action={<Button onClick={() => navigate('/organizer/vendor-marketplace')}>Browse Marketplace</Button>}
          />
        ) : (
          <OrganizerCard className="overflow-hidden p-0">
            <div className="border-b border-slate-100 p-5">
              <SectionHeader title="Comparison Table" description="Only backend-provided vendor fields are shown. Missing values remain blank instead of being mocked." />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left">
                    <th className="min-w-[170px] px-4 py-3 font-semibold text-slate-600">Field</th>
                    {compareVendors.map((vendor) => (
                      <th key={vendor.id} className="min-w-[220px] px-4 py-3 text-left">
                        <div className="flex flex-col gap-2">
                          <span className="font-semibold text-slate-950">{vendor.businessName}</span>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="ghost" onClick={() => onRemoveFromCompare(vendor.id)} className="px-2 py-1 text-xs text-red-600">Remove</Button>
                            <Button variant="secondary" onClick={() => navigate('/organizer/vendor-marketplace')} className="px-2 py-1 text-xs">View Profile</Button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonRows.map((row) => (
                    <tr key={row}>
                      <td className="bg-slate-50/70 px-4 py-4 font-semibold text-slate-700">{row}</td>
                      {compareVendors.map((vendor) => (
                        <td key={vendor.id} className="px-4 py-4 text-slate-600">{renderComparisonValue(row, vendor)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="bg-slate-50/70 px-4 py-4 font-semibold text-slate-700">Actions</td>
                    {compareVendors.map((vendor) => (
                      <td key={vendor.id} className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {isInShortlist(vendor.id) ? (
                            <Button variant="secondary" onClick={() => onRemoveFromShortlist(vendor.id)}>Remove Shortlist</Button>
                          ) : (
                            <Button onClick={() => onAddToShortlist(vendor.id)}>Add Shortlist</Button>
                          )}
                          <Button variant="secondary" onClick={() => navigate('/organizer/vendor-marketplace')}>Send Request</Button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </OrganizerCard>
        )}
      </OrganizerPage>
    </DashboardShell>
  )
}

function renderComparisonValue(row: string, vendor: CompareVendor) {
  const firstService = vendor.services[0]
  if (row === 'Service category') return vendor.services.length > 0 ? vendor.services.map((service) => service.category).join(', ') : '-'
  if (row === 'Rating') {
    return (
      <span className="inline-flex items-center gap-1 text-amber-600">
        <Star className="h-4 w-4 fill-amber-400" />
        {vendor.rating || 'N/A'}
      </span>
    )
  }
  if (row === 'Price range') return firstService ? `$${Number(firstService.basePrice || 0).toLocaleString()}+` : '-'
  if (row === 'Availability') return firstService ? firstService.availabilityStatus : '-'
  if (row === 'Location') return vendor.serviceArea || '-'
  if (row === 'Capacity') return '-'
  if (row === 'Response time') return '-'
  if (row === 'Requirements match') return <StatusBadge status={vendor.verificationStatus} size="sm" />
  if (row === 'Notes') return 'Add notes in shortlist workflow'
  return '-'
}
