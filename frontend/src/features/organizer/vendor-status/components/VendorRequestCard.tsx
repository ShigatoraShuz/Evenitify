import { Calendar, MapPin, Building2, ChevronRight } from 'lucide-react'
import { type VendorRequest, STATUS_LABELS, STATUS_COLORS_VENDOR } from '../models/vendorStatus.model'

interface Props {
  request: VendorRequest
  onClick: () => void
}

export function VendorRequestCard({ request, onClick }: Props) {
  const statusColor = STATUS_COLORS_VENDOR[request.status] || STATUS_COLORS_VENDOR.pending
  const requestedServices = request.requestedServices.length > 0
    ? request.requestedServices
    : request.packageName
      ? [{ id: request.packageName, serviceName: request.packageName, category: request.vendorCategory }]
      : []

  return (
    <button
      onClick={onClick}
      className={[
        'group relative w-full overflow-hidden rounded-[24px] border border-slate-200/80 bg-white',
        'p-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)]',
        'transition-all hover:-translate-y-0.5 hover:border-brand-200',
        'hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]',
        'focus:outline-none focus:ring-2 focus:ring-brand-200',
      ].join(' ')}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-brand-500 to-cyan-400" aria-hidden="true" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="truncate font-semibold text-slate-900">{request.vendorName}</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-sm text-slate-500">{request.vendorCategory}</span>
          </div>

          <div className="mb-2 flex items-center gap-2 text-sm text-brand-600">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{request.eventName}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(request.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {request.location}
            </span>
            {request.quotedPrice != null && (
              <span className="font-semibold text-brand-700">${request.quotedPrice.toLocaleString()}</span>
            )}
          </div>

          <p className="mt-2 line-clamp-1 text-sm text-slate-500">{request.lastMessage}</p>

          {requestedServices.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {requestedServices.map((service) => (
                <span
                  key={service.id}
                  className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700"
                >
                  {service.serviceName}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${statusColor}`}>
            {STATUS_LABELS[request.status]}
          </span>
          <ChevronRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-brand-400" />
        </div>
      </div>
    </button>
  )
}
