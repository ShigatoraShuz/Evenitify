import { useEffect, useState } from 'react'
import { Building2, Store, Repeat2, ArrowLeft, ArrowRight } from 'lucide-react'
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
  onBackToRoleChoice: () => void
}

function getRolePreview(role: string | null) {
  if (role === 'vendor') {
    return {
      title: 'Vendor workspace preview',
      description: 'Service listings, availability, and booking requests in one place.',
      icon: Store,
      gradient: 'from-teal-500 via-cyan-500 to-sky-500'
    }
  }

  if (role === 'admin') {
    return {
      title: 'Admin workspace preview',
      description: 'Operations overview, review queue, and booking oversight.',
      icon: Repeat2,
      gradient: 'from-slate-700 via-slate-600 to-slate-500'
    }
  }

  return {
    title: 'Organizer workspace preview',
    description: 'Large events, vendor search, and booking coordination.',
    icon: Building2,
    gradient: 'from-brand-700 via-brand-600 to-cyan-500'
  }
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
  onClearError,
  onBackToRoleChoice
}: OnboardingViewProps) {
  const [step, setStep] = useState(1)
  const totalSteps = role === 'admin' ? 1 : 2
  const preview = getRolePreview(role)
  const PreviewIcon = preview.icon

  useEffect(() => {
    setStep(1)
  }, [role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome to Eventify</h1>
          <p className="text-slate-500 mt-2">Complete your profile to get started</p>
        </div>

        {role !== 'admin' && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => {
              const isActive = i + 1 === step
              const isCompleted = i + 1 < step
              return (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-10 bg-brand-600'
                      : isCompleted
                      ? 'w-10 bg-brand-600/70'
                      : 'w-5 bg-slate-200'
                  }`}
                />
              )
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-[24px] shadow-xl border border-slate-100 p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex justify-between items-center">
              <span>{error}</span>
              <button type="button" onClick={onClearError} className="text-red-500 hover:text-red-700">&times;</button>
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden shadow-sm">
            <div className={`h-28 bg-gradient-to-br ${preview.gradient} relative`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_25%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-inner">
                  <PreviewIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="p-4 text-center">
              <h2 className="text-sm font-semibold text-slate-900">{preview.title}</h2>
              <p className="mt-1 text-xs text-slate-500">{preview.description}</p>
            </div>
          </div>

          {role === 'organizer' && (
            <>
              {step === 1 && (
                <>
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Organization Details</h2>
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
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <Button type="button" variant="ghost" onClick={onBackToRoleChoice} className="text-slate-500 hover:text-slate-700 gap-1.5">
                      <ArrowLeft className="w-4 h-4" /> Change role
                    </Button>
                    <Button type="button" onClick={() => setStep(2)} className="gap-1.5">
                      Next <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Contact Information</h2>
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
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={() => setStep(1)} className="gap-1.5">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button type="submit" loading={submitting}>
                      Complete Organizer Setup
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          {role === 'vendor' && (
            <>
              {step === 1 && (
                <>
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Business Details</h2>
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
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <Button type="button" variant="ghost" onClick={onBackToRoleChoice} className="text-slate-500 hover:text-slate-700 gap-1.5">
                      <ArrowLeft className="w-4 h-4" /> Change role
                    </Button>
                    <Button type="button" onClick={() => setStep(2)} className="gap-1.5">
                      Next <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Contact & Description</h2>
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={vendorForm.phone}
                      onChange={(e) => onUpdateVendorForm({ phone: e.target.value })}
                      required
                      placeholder="e.g. +1 555-987-6543"
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Description</label>
                      <textarea
                        value={vendorForm.businessDescription}
                        onChange={(e) => onUpdateVendorForm({ businessDescription: e.target.value })}
                        required
                        placeholder="Tell organizers about your services..."
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-brand-500/20 hover:border-slate-300 focus:outline-none focus:ring-4 text-sm bg-white text-slate-900 shadow-sm transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={() => setStep(1)} className="gap-1.5">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button type="submit" loading={submitting}>
                      Complete Vendor Setup
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          {role === 'admin' && (
            <>
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">Admin Setup</h2>
                <p className="text-sm text-slate-500">Your admin account is ready. No additional setup required.</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={onBackToRoleChoice} className="text-slate-500 hover:text-slate-700 gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Change role
                </Button>
                <Button type="submit" loading={submitting}>
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

