import { Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, Search, Filter } from 'lucide-react'

export interface VendorRequest {
  id: string
  vendorName: string
  vendorCategory: string
  eventName: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  sentAt: string
  respondedAt?: string
  message?: string
}

interface OrganizerVendorStatusViewProps {
  requests: VendorRequest[]
  searchQuery: string
  statusFilter: string
  onSearchChange: (query: string) => void
  onStatusFilterChange: (status: string) => void
  onViewDetails: (requestId: string) => void
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Pending' },
  accepted: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Accepted' },
  declined: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'Declined' },
  expired: { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Expired' },
}

export function OrganizerVendorStatusView({
  requests,
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onViewDetails,
}: OrganizerVendorStatusViewProps) {
  const statuses = ['all', 'pending', 'accepted', 'declined', 'expired']

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Vendor Request Status</h1>
          <p className="text-gray-500 mt-1">Track the status of your vendor booking requests</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors or events..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all text-sm"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Filter className="w-4 h-4 text-gray-400" />
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => onStatusFilterChange(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  statusFilter === s
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Request List */}
        {requests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No vendor requests found</p>
            <p className="text-gray-400 text-sm mt-1">Send requests from the Vendor Marketplace</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => {
              const config = statusConfig[request.status]
              const StatusIcon = config.icon
              return (
                <button
                  key={request.id}
                  onClick={() => onViewDetails(request.id)}
                  className={`w-full flex items-center gap-4 p-4 bg-white rounded-xl border ${config.border} hover:shadow-md transition-all text-left group`}
                >
                  <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{request.vendorName}</p>
                    <p className="text-xs text-gray-500 truncate">{request.vendorCategory} · {request.eventName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs font-medium ${config.color} ${config.bg} px-2.5 py-1 rounded-full`}>
                      {config.label}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1">{request.sentAt}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 transition-colors flex-shrink-0" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
