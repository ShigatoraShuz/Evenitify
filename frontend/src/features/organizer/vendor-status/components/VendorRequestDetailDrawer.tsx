import { X, Building2, Calendar, MapPin, DollarSign } from 'lucide-react'
import { type VendorRequest, type VendorMessage, type VendorRequestStatus, type VendorStatusTimelineItem, STATUS_LABELS, STATUS_COLORS_VENDOR } from '../models/vendorStatus.model'
import { VendorStatusTimeline } from './VendorStatusTimeline'
import { VendorChatPanel } from './VendorChatPanel'

interface Props {
  request: VendorRequest
  messages: VendorMessage[]
  messageInput: string
  onMessageInputChange: (v: string) => void
  onSendMessage: () => void
  onClose: () => void
  onStatusUpdate: (requestId: string, newStatus: VendorRequestStatus) => void
  timelineItems: VendorStatusTimelineItem[]
}

const liveStatusCopy: Partial<Record<VendorRequestStatus, { label: string; description: string; tone: string }>> = {
  viewed: {
    label: 'Vendor viewed',
    description: 'The vendor has opened and reviewed the request.',
    tone: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  negotiating: {
    label: 'Vendor negotiating',
    description: 'The vendor is actively discussing terms or pricing.',
    tone: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  accepted: {
    label: 'Vendor accepted',
    description: 'The vendor accepted the request and it is ready for the next step.',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  rejected: {
    label: 'Vendor rejected',
    description: 'The vendor declined the request.',
    tone: 'bg-red-50 text-red-700 border-red-200'
  },
  confirmed: {
    label: 'Booking confirmed',
    description: 'The booking has been confirmed and is moving forward.',
    tone: 'bg-green-50 text-green-700 border-green-200'
  }
}

export function VendorRequestDetailDrawer({
  request,
  messages,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  onClose,
  onStatusUpdate,
  timelineItems,
}: Props) {
  const statusColor = STATUS_COLORS_VENDOR[request.status]
  const currentTimeline = [...timelineItems].reverse().find((item) => item.state === 'current')
  const liveStatus = liveStatusCopy[request.status] || currentTimeline && liveStatusCopy[currentTimeline.status]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor}`}>
              {STATUS_LABELS[request.status]}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900 mb-1">{request.vendorName}</h2>
          <p className="text-sm text-slate-500 mb-3">{request.vendorCategory}</p>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Building2 className="w-4 h-4 text-brand-400" />
              <span className="truncate">{request.eventName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span>{new Date(request.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-4 h-4 text-brand-400" />
              <span>{request.location}</span>
            </div>
            {request.quotedPrice != null && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <DollarSign className="w-4 h-4 text-brand-400" />
                <span className="font-semibold text-brand-700">${request.quotedPrice.toLocaleString()}</span>
              </div>
            )}
          </div>

          {request.packageName && (
            <p className="text-sm text-brand-600 mt-2">Package: <span className="font-medium">{request.packageName}</span></p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {liveStatus && (
            <div className={`mx-4 mt-4 rounded-2xl border px-4 py-3 ${liveStatus.tone}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest">{liveStatus.label}</p>
                  <p className="mt-1 text-sm leading-relaxed">{liveStatus.description}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusColor}`}>
                  {STATUS_LABELS[request.status]}
                </span>
              </div>
            </div>
          )}
          {request.status === 'negotiating' && request.lastMessage && (
            <div className="mx-4 mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-700">Negotiation message</p>
              <p className="mt-2 text-sm leading-relaxed text-orange-900 whitespace-pre-wrap">{request.lastMessage}</p>
            </div>
          )}
          <VendorStatusTimeline items={timelineItems} />

          <div className="border-t border-slate-200">
            <VendorChatPanel
              messages={messages}
              messageInput={messageInput}
              onMessageInputChange={onMessageInputChange}
              onSendMessage={onSendMessage}
            />
          </div>
        </div>

        <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
          {request.status === 'quoted' && (
            <>
              <button
                onClick={() => onStatusUpdate(request.id, 'accepted')}
                className="flex-1 px-3 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Accept Quote
              </button>
              <button
                onClick={() => onStatusUpdate(request.id, 'negotiating')}
                className="flex-1 px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
              >
                Negotiate
              </button>
            </>
          )}
          {request.status === 'accepted' && (
            <button
              onClick={() => onStatusUpdate(request.id, 'confirmed')}
              className="flex-1 px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
            >
              Confirm Booking
            </button>
          )}
          {request.status === 'negotiating' && (
            <>
              <button
                onClick={() => onStatusUpdate(request.id, 'accepted')}
                className="flex-1 px-3 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Accept Quote
              </button>
              <button
                onClick={() => onStatusUpdate(request.id, 'rejected')}
                className="flex-1 px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                Decline
              </button>
            </>
          )}
          {(request.status === 'pending' || request.status === 'sent' || request.status === 'viewed') && (
            <button
              onClick={() => onStatusUpdate(request.id, 'rejected')}
              className="flex-1 px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              Cancel Request
            </button>
          )}
          {request.status === 'contract_pending' && (
            <button
              onClick={() => onStatusUpdate(request.id, 'confirmed')}
              className="flex-1 px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
            >
              Confirm Contract
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
