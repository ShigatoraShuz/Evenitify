import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Modal } from '../../../../shared/components/Modal'
import { Button } from '../../../../shared/components/Button'

interface RequestSuccessModalProps {
  open: boolean
  vendorName: string
  eventName: string
  onClose: () => void
  onGoToTracker: () => void
}

export function RequestSuccessModal({
  open,
  vendorName,
  eventName,
  onClose,
  onGoToTracker,
}: RequestSuccessModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Request Sent">
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">Your booking request was sent successfully.</p>
              <p className="mt-1 text-sm text-emerald-800">
                {vendorName} can now review the request for {eventName}.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            Next step: open the vendor tracker to review status updates, responses, and confirmations.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button className="flex-1 gap-2" onClick={onGoToTracker}>
            Go to Vendor Tracker
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Modal>
  )
}
