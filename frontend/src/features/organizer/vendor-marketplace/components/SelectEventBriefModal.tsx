import { Calendar, ClipboardList, Send, MessageSquare } from 'lucide-react'
import { Modal } from '../../../../shared/components/Modal'
import { Button } from '../../../../shared/components/Button'
import type { EventBriefReference } from '../models/vendorMarketplace.model'

interface SelectEventBriefModalProps {
  open: boolean
  showGeneralInquiry: boolean
  generalInquiryMessage: string
  eventBriefs: EventBriefReference[]
  onClose: () => void
  onSelectEvent: (id: string) => void
  onPlanEvent: () => void
  onToggleGeneralInquiry: () => void
  onSetGeneralInquiryMessage: (msg: string) => void
  onSendGeneralInquiry: () => void
}

export function SelectEventBriefModal({
  open,
  showGeneralInquiry,
  generalInquiryMessage,
  eventBriefs,
  onClose,
  onSelectEvent,
  onPlanEvent,
  onToggleGeneralInquiry,
  onSetGeneralInquiryMessage,
  onSendGeneralInquiry,
}: SelectEventBriefModalProps) {
  if (!open) return null

  return (
    <Modal open={open} onClose={onClose} title="Select an Event Brief">
      <div className="space-y-4">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
          <p className="text-xs text-amber-800">
            To send a booking request, choose an event brief or create a new event plan first.
          </p>
        </div>

        {!showGeneralInquiry ? (
          <>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Choose Existing Event</p>
              <div className="space-y-2">
                {eventBriefs.map((brief) => (
                  <button
                    key={brief.id}
                    onClick={() => onSelectEvent(brief.id)}
                    className="w-full text-left flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:border-brand-300 hover:bg-brand-50 transition-all"
                  >
                    <div className="rounded-lg bg-brand-100 p-2">
                      <Calendar className="h-4 w-4 text-brand-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{brief.eventName}</p>
                      <p className="text-xs text-slate-500">{brief.eventType} · {brief.eventDate}</p>
                    </div>
                    <Send className="h-4 w-4 text-slate-300 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400">or</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onPlanEvent}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:bg-brand-50 transition-all"
              >
                <div className="rounded-full bg-brand-100 p-2">
                  <ClipboardList className="h-5 w-5 text-brand-600" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Plan an Event</span>
                <span className="text-[10px] text-slate-400 text-center">Create a new event plan</span>
              </button>
              <button
                onClick={onToggleGeneralInquiry}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:bg-brand-50 transition-all"
              >
                <div className="rounded-full bg-slate-100 p-2">
                  <MessageSquare className="h-5 w-5 text-slate-600" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Send General Inquiry</span>
                <span className="text-[10px] text-slate-400 text-center">Send a message without an event</span>
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs text-slate-600">
                Send a general inquiry to this vendor. They will respond with their availability and pricing.
              </p>
            </div>
            <textarea
              value={generalInquiryMessage}
              onChange={(e) => onSetGeneralInquiryMessage(e.target.value)}
              placeholder="Write your message to the vendor..."
              className={[
                'w-full rounded-xl border border-slate-200 p-3',
                'text-sm text-slate-700 placeholder:text-slate-400',
                'focus:border-brand-400 focus:outline-none',
                'focus:ring-1 focus:ring-brand-200 min-h-[100px] resize-none',
              ].join(' ')}
            />
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onToggleGeneralInquiry} className="flex-1">
                Back
              </Button>
              <Button onClick={onSendGeneralInquiry} className="flex-1" disabled={!generalInquiryMessage.trim()}>
                Send Inquiry
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
