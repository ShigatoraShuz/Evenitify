import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { Select } from '../../../shared/components/Select'
import type { OrganizerOnboardingForm, VendorOnboardingForm } from '../models/onboarding.model'
import { ORGANIZATION_TYPES, SERVICE_AREAS } from '../models/onboarding.model'

interface OnboardingViewProps {
  role: string | null
  organizerForm: OrganizerOnboardingForm
  vendorForm: VendorOnboardingForm
  submitting: boolean
  error: string | null
  onUpdateOrganizerForm: (next: Partial<OrganizerOnboardingForm>) => void
  onUpdateVendorForm: (next: Partial<VendorOnboardingForm>) => void
  onSubmit: () => Promise<void>
  onClearError: () => void
}

export function OnboardingView({
  role,
  organizerForm,
  vendorForm,
  submitting,
  error,
  onUpdateOrganizerForm,
  onUpdateVendorForm,
  onSubmit,
  onClearError
}: OnboardingViewProps) {
  const [step, setStep] = useState(1)
  const totalSteps = role === 'admin' ? 1 : 3

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Eventify</h1>
          <p className="text-gray-500 mt-2">Complete your profile to get started</p>
        </div>

        {role !== 'admin' && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${i < step ? 'bg-brand-600' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex justify-between items-center">
              <span>{error}</span>
              <button onClick={onClearError} className="text-red-500 hover:text-red-700">&times;</button>
            </div>
          )}

          {role === 'organizer' && (
            <>
              {step === 1 && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900">Organization Details</h2>
                  <Input
                    label="Organization Name"
                    value={organizerForm.organizationName}
                    onChange={(e) => onUpdateOrganizerForm({ organizationName: e.target.value })}
                    required
                    placeholder="e.g. Acme Corp"
                  />
                  <Select
                    label="Organization Type"
                    value={organizerForm.organizationType}
                    onChange={(e) => onUpdateOrganizerForm({ organizationType: e.target.value })}
                    options={ORGANIZATION_TYPES.map((t) => ({ value: t, label: t }))}
                    required
                  />
                  <div className="flex justify-end pt-2">
                    <Button type="button" onClick={() => setStep(2)}>Next</Button>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={organizerForm.phone}
                    onChange={(e) => onUpdateOrganizerForm({ phone: e.target.value })}
                    required
                    placeholder="e.g. +1 555-123-4567"
                  />
                  <Input
                    label="Address"
                    value={organizerForm.address}
                    onChange={(e) => onUpdateOrganizerForm({ address: e.target.value })}
                    required
                    placeholder="e.g. 123 Main St, City"
                  />
                  <div className="flex justify-between pt-2">
                    <Button type="button" variant="secondary" onClick={() => setStep(1)}>Back</Button>
                    <Button type="submit" loading={submitting}>Complete Setup</Button>
                  </div>
                </>
              )}
            </>
          )}

          {role === 'vendor' && (
            <>
              {step === 1 && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900">Business Details</h2>
                  <Input
                    label="Business Name"
                    value={vendorForm.businessName}
                    onChange={(e) => onUpdateVendorForm({ businessName: e.target.value })}
                    required
                    placeholder="e.g. Elite Catering Co."
                  />
                  <Select
                    label="Service Area"
                    value={vendorForm.serviceArea}
                    onChange={(e) => onUpdateVendorForm({ serviceArea: e.target.value })}
                    options={SERVICE_AREAS.map((a) => ({ value: a, label: a }))}
                    required
                  />
                  <div className="flex justify-end pt-2">
                    <Button type="button" onClick={() => setStep(2)}>Next</Button>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900">Contact & Description</h2>
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={vendorForm.phone}
                    onChange={(e) => onUpdateVendorForm({ phone: e.target.value })}
                    required
                    placeholder="e.g. +1 555-987-6543"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                    <textarea
                      value={vendorForm.businessDescription}
                      onChange={(e) => onUpdateVendorForm({ businessDescription: e.target.value })}
                      required
                      placeholder="Tell organizers about your services..."
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button type="button" variant="secondary" onClick={() => setStep(1)}>Back</Button>
                    <Button type="submit" loading={submitting}>Complete Setup</Button>
                  </div>
                </>
              )}
            </>
          )}

          {role === 'admin' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Admin Setup</h2>
              <p className="text-sm text-gray-500">Your admin account is ready. No additional setup required.</p>
              <Button type="submit" loading={submitting} fullWidth>Go to Dashboard</Button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
