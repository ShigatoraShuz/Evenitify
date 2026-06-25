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
  const selectedServiceNames = requestForm.selectedServiceIds
    .map((serviceId) => vendor.services.find((service) => service.id === serviceId)?.serviceName)
    .filter((name): name is string => !!name)

  return (
    <Modal open={open} onClose={onClose} title={`Send Request to ${vendor.businessName}`}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Event brief</p>
          <p className="mt-1 font-semibold text-slate-900">{brief?.eventName || 'Selected event'}</p>
          <p className="mt-1 text-xs text-slate-500">
            {brief?.eventDate || 'No event date selected'} · {brief?.location || 'No location selected'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedServiceNames.length > 0 ? (
              selectedServiceNames.map((serviceName) => (
                <span
                  key={serviceName}
                  className="inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                >
                  {serviceName}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">No service selected yet.</span>
            )}
          </div>
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
