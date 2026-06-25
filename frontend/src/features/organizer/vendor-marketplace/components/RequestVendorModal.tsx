import { Modal } from '../../../../shared/components/Modal'
import { Button } from '../../../../shared/components/Button'
import { Input } from '../../../../shared/components/Input'
import type { RequestFormData, VendorMarketplaceVendor, EventBrief } from '../models/vendorMarketplace.model'

interface RequestVendorModalProps {
  open: boolean
  vendor: VendorMarketplaceVendor | null
  brief: EventBrief | null
  requestForm: RequestFormData
  onClose: () => void
  onUpdateRequestForm: (next: Partial<RequestFormData>) => void
  onSubmitRequest: () => void
}

export function RequestVendorModal({
  open,
  vendor,
  brief,
  requestForm,
  onClose,
  onUpdateRequestForm,
  onSubmitRequest,
}: RequestVendorModalProps) {
  if (!open || !vendor) return null

  const canSubmit = !!requestForm.vendorId

  return (
    <Modal open={open} onClose={onClose} title={`Send Request to ${vendor.businessName}`}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">{brief?.eventName || 'Selected event'}</p>
          <p className="mt-1 text-slate-600">{vendor.serviceCategory.join(' · ')}</p>
        </div>

        <Input
          label="Requested Budget"
          type="number"
          min="0"
          step="0.01"
          value={requestForm.requestedBudget}
          onChange={(e) => onUpdateRequestForm({ requestedBudget: e.target.value })}
          placeholder="Enter your budget"
        />

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Message</span>
          <textarea
            value={requestForm.notes}
            onChange={(e) => onUpdateRequestForm({ notes: e.target.value })}
            placeholder="Share event details or special instructions..."
            className="min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
          />
        </label>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={onSubmitRequest} disabled={!canSubmit}>
            Send Request
          </Button>
        </div>
      </div>
    </Modal>
  )
}
