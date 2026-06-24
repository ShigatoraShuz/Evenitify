import { Calendar, MapPin, Building2, ChevronRight } from 'lucide-react'
import { type VendorRequest, STATUS_LABELS, STATUS_COLORS_VENDOR } from '../models/vendorStatus.model'

interface Props {
  request: VendorRequest
  onClick: () => void
}

export function VendorRequestCard({ request, onClick }: Props) {
  const statusColor = STATUS_COLORS_VENDOR[request.status] || STATUS_COLORS_VENDOR.pending

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg hover:border-navy-200 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-900 truncate">{request.vendorName}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-sm text-slate-500">{request.vendorCategory}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-navy-600 mb-2">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{request.eventName}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(request.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {request.location}
            </span>
            {request.quotedPrice != null && (
              <span className="font-semibold text-navy-700">${request.quotedPrice.toLocaleString()}</span>
            )}
          </div>

          <p className="text-sm text-slate-500 mt-2 line-clamp-1">{request.lastMessage}</p>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor}`}>
            {STATUS_LABELS[request.status]}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-navy-400 transition-colors" />
        </div>
      </div>
    </button>
  )
}
