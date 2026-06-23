import { useEffect, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { Select } from '../../../shared/components/Select'
import { Modal } from '../../../shared/components/Modal'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import type { EventRequirement } from '../../../services/eventService'
import type { VendorSearchResult, VendorService } from '../../../services/vendorService'
import type { RequirementCategory, ProcurementStep } from '../models/vendor-procurement.model'
import { REQUIREMENT_CATEGORIES } from '../models/vendor-procurement.model'

import type { VendorFilterState } from '../models/vendor-procurement.model'

interface VendorProcurementViewProps {
  eventId: string | null
  requirements: EventRequirement[]
  vendors: VendorSearchResult[]
  selectedRequirement: EventRequirement | null
  selectedVendor: VendorSearchResult | null
  currentStep: ProcurementStep
  filters: VendorFilterState
  loading: boolean
  submitting: boolean
  error: string | null
  draftSaved: boolean
  validationErrors: string[]
  onInitEvent: (eventId: string) => Promise<void>
  onSetStep: (step: ProcurementStep) => void
  onSelectRequirement: (req: EventRequirement) => void
  onSearchVendors: () => Promise<void>
  onSelectVendor: (vendor: VendorSearchResult) => void
  onCreateRequirement: (payload: { category: RequirementCategory; quantity: number; minBudget?: number | null; maxBudget?: number | null; notes?: string | null }) => Promise<void>
  onDeleteRequirement: (id: string) => Promise<void>
  onUpdateFilters: (next: Partial<VendorFilterState>) => void
  onSubmitBooking: (payload: { notes?: string; requestedBudget?: number }) => Promise<void>
  onSaveDraft: () => void
  onClearError: () => void
}

const STEP_LABELS: Record<ProcurementStep, string> = {
  requirements: 'Requirements',
  vendors: 'Find Vendors',
  booking: 'Booking',
  confirm: 'Confirmed'
}

const STEP_ORDER: ProcurementStep[] = ['requirements', 'vendors', 'booking', 'confirm']

export function VendorProcurementView({
  eventId,
  requirements,
  vendors,
  selectedRequirement,
  selectedVendor,
  currentStep,
  filters,
  loading,
  submitting,
  error,
  draftSaved,
  validationErrors,
  onInitEvent,
  onSetStep,
  onSelectRequirement,
  onSearchVendors,
  onSelectVendor,
  onCreateRequirement,
  onDeleteRequirement,
  onUpdateFilters,
  onSubmitBooking,
  onSaveDraft,
  onClearError
}: VendorProcurementViewProps) {
  const [showReqForm, setShowReqForm] = useState(false)
  const [category, setCategory] = useState<RequirementCategory>('Catering')
  const [quantity, setQuantity] = useState('1')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [reqNotes, setReqNotes] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [requestedBudget, setRequestedBudget] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (eventId) onInitEvent(eventId)
  }, [eventId])

  const currentStepIndex = STEP_ORDER.indexOf(currentStep)

  const handleDeleteReq = async () => {
    if (confirmDeleteId) {
      await onDeleteRequirement(confirmDeleteId)
      setConfirmDeleteId(null)
    }
  }

  const handleCreateReq = async (e: React.FormEvent) => {
    e.preventDefault()
    await onCreateRequirement({
      category,
      quantity: parseInt(quantity, 10) || 1,
      minBudget: minBudget ? parseFloat(minBudget) : null,
      maxBudget: maxBudget ? parseFloat(maxBudget) : null,
      notes: reqNotes || null
    })
    setShowReqForm(false)
    setCategory('Catering')
    setQuantity('1')
    setMinBudget('')
    setMaxBudget('')
    setReqNotes('')
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmitBooking({
      notes: bookingNotes || undefined,
      requestedBudget: requestedBudget ? parseFloat(requestedBudget) : undefined
    })
  }

  if (!eventId) {
    return (
      <DashboardShell>
        <PageHeader title="Vendor Procurement" subtitle="Select an event first" />
        <EmptyState title="No event selected" description="Go to your dashboard and select an event to start procurement" />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Remove Requirement"
        message="Are you sure you want to remove this requirement? Any associated bookings will be affected."
        confirmLabel="Remove"
        variant="danger"
        loading={submitting}
        onConfirm={handleDeleteReq}
        onCancel={() => setConfirmDeleteId(null)}
      />
      <PageHeader
        title="Vendor Procurement"
        subtitle={`Event ID: ${eventId}`}
        action={
          currentStep !== 'confirm' && (
            <Button variant="secondary" onClick={onSaveDraft}>Save Draft</Button>
          )
        }
      />

      {draftSaved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          Draft saved successfully.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={onClearError} className="text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <p className="font-medium mb-1">Please fix the following:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center">
          {STEP_ORDER.map((step, idx) => (
            <div key={step} className="flex items-center flex-1">
              <button
                onClick={() => {
                  if (idx <= currentStepIndex || currentStep === 'confirm') onSetStep(step)
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentStep === step
                    ? 'bg-brand-600 text-white shadow-sm'
                    : idx < currentStepIndex
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === step
                    ? 'bg-white text-brand-600'
                    : idx < currentStepIndex
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  {idx < currentStepIndex ? '\u2713' : idx + 1}
                </span>
                <span className="hidden sm:inline">{STEP_LABELS[step]}</span>
              </button>
              {idx < STEP_ORDER.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${idx < currentStepIndex ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {currentStep === 'requirements' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Event Requirements</h2>
            <Button onClick={() => setShowReqForm(true)}>+ Add Requirement</Button>
          </div>

          {requirements.length === 0 ? (
            <EmptyState
              title="No requirements yet"
              description="Add vendor categories you need for this event"
              action={<Button onClick={() => setShowReqForm(true)}>Add Requirement</Button>}
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {requirements.map((req) => (
                <div
                  key={req.id}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${selectedRequirement?.id === req.id ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-200 hover:border-brand-300'}`}
                  onClick={() => onSelectRequirement(req)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{req.category}</h3>
                    <StatusBadge status={req.requirement_status} size="sm" />
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Quantity: {req.quantity}</p>
                    {req.min_budget && <p>Min: ${Number(req.min_budget).toLocaleString()}</p>}
                    {req.max_budget && <p>Max: ${Number(req.max_budget).toLocaleString()}</p>}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(req.id) }}
                    className="mt-2 text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <Modal open={showReqForm} onClose={() => setShowReqForm(false)} title="Add Requirement">
            <form onSubmit={handleCreateReq} className="space-y-4">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as RequirementCategory)}
                options={REQUIREMENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
              <Input label="Quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
              <Input label="Min Budget ($)" type="number" min="0" step="0.01" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} />
              <Input label="Max Budget ($)" type="number" min="0" step="0.01" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} />
              <Input label="Notes" value={reqNotes} onChange={(e) => setReqNotes(e.target.value)} />
              <Button type="submit" loading={submitting} fullWidth>Add Requirement</Button>
            </form>
          </Modal>
        </div>
      )}

      {currentStep === 'vendors' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Vendors for {selectedRequirement?.category}
            </h2>
            <Button onClick={onSearchVendors} loading={loading}>Search Vendors</Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input
              placeholder="Business name"
              value={filters.businessName}
              onChange={(e) => onUpdateFilters({ businessName: e.target.value })}
            />
            <Input
              placeholder="Location"
              value={filters.location}
              onChange={(e) => onUpdateFilters({ location: e.target.value })}
            />
            <Select
              value={filters.availability}
              onChange={(e) => onUpdateFilters({ availability: e.target.value })}
              options={[
                { value: '', label: 'All Availability' },
                { value: 'available', label: 'Available' }
              ]}
            />
            <Select
              value={filters.sortBy}
              onChange={(e) => onUpdateFilters({ sortBy: e.target.value })}
              options={[
                { value: 'rating', label: 'Sort by Rating' },
                { value: 'name', label: 'Sort by Name' }
              ]}
            />
          </div>

          {vendors.length === 0 ? (
            <EmptyState
              title="No vendors found"
              description="Click 'Search Vendors' to find matching vendors"
              action={<Button onClick={onSearchVendors}>Search Vendors</Button>}
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${selectedVendor?.id === vendor.id ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-200 hover:border-brand-300'}`}
                  onClick={() => onSelectVendor(vendor)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{vendor.business_name}</h3>
                    <span className="text-sm text-yellow-600">★ {vendor.rating}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{vendor.service_area}</p>
                  <div className="flex flex-wrap gap-2">
                    {vendor.services?.map((svc: VendorService) => (
                      <span key={svc.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {svc.service_name} (${svc.base_price})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentStep === 'booking' && selectedVendor && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm Booking</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <h3 className="font-medium text-gray-900">{selectedVendor.business_name}</h3>
            <p className="text-sm text-gray-500">Rating: {selectedVendor.rating} | {selectedVendor.service_area}</p>
            {selectedRequirement && (
              <p className="text-sm text-gray-500 mt-1">Category: {selectedRequirement.category} | Qty: {selectedRequirement.quantity}</p>
            )}
          </div>
          <form onSubmit={handleBooking} className="space-y-4 max-w-md">
            <Input label="Requested Budget ($)" type="number" min="0" step="0.01" value={requestedBudget} onChange={(e) => setRequestedBudget(e.target.value)} />
            <Input label="Notes for Vendor" value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} />
            <Button type="submit" loading={submitting}>Submit Booking Request</Button>
          </form>
        </div>
      )}

      {currentStep === 'confirm' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-emerald-600">&#10003;</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Sent!</h2>
          <p className="text-gray-500 mb-6">The vendor will review and respond to your request.</p>
          <Button onClick={() => onSetStep('requirements')}>Start New Procurement</Button>
        </div>
      )}
    </DashboardShell>
  )
}
