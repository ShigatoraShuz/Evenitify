import { useEffect, useMemo, useState } from 'react'
import { Building2, CheckCircle2, Repeat2, Store } from 'lucide-react'
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

type RoleTone = 'brand' | 'emerald' | 'slate'

function getRolePreview(role: string | null): { title: string; description: string; icon: React.ComponentType<{ className?: string }>; tone: RoleTone } {
  if (role === 'vendor') {
    return {
      title: 'Vendor workspace',
      description: 'Manage services, availability, and B2B requests from one queue.',
      icon: Store,
      tone: 'emerald',
    }
  }

  if (role === 'admin') {
    return {
      title: 'Admin workspace',
      description: 'Review platform operations, users, vendors, and booking exceptions.',
      icon: Repeat2,
      tone: 'slate',
    }
  }

  return {
    title: 'Organizer workspace',
    description: 'Define event portfolios, vendor requirements, and procurement progress.',
    icon: Building2,
    tone: 'brand',
  }
}

const roleToneClasses: Record<RoleTone, string> = {
  brand: 'border-brand-200 bg-brand-50 text-brand-900',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  slate: 'border-slate-200 bg-slate-50 text-slate-900',
} as const

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
  onBackToRoleChoice,
}: OnboardingViewProps) {
  const [step, setStep] = useState(1)
  const totalSteps = role === 'admin' ? 1 : 2
  const [dirty, setDirty] = useState(false)
  const preview = useMemo(() => getRolePreview(role), [role])
  const PreviewIcon = preview.icon

  useEffect(() => {
    if (!dirty) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirty])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit()
    setDirty(false)
  }

  const roleLabel = role === 'vendor' ? 'Vendor setup' : role === 'admin' ? 'Admin setup' : 'Organizer setup'

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Onboarding</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tighter text-slate-950 sm:text-4xl">{roleLabel}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Complete the minimum profile details so your workspace is ready for procurement, booking requests, and reporting.
          </p>
        </div>

        {role !== 'admin' && (
          <div className="mt-6 flex items-center gap-3">
            {Array.from({ length: totalSteps }).map((_, index) => {
              const currentStep = index + 1
              const active = currentStep <= step
              return (
                <div key={currentStep} className="flex items-center gap-3">
                  <div className={`h-2.5 w-14 rounded-full ${active ? 'bg-brand-900' : 'bg-slate-200'}`} />
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Step {currentStep}</span>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.72fr]">
          <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            {error && (
              <div className="mb-5 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert" aria-live="polite">
                <div className="flex items-start justify-between gap-3">
                  <span>{error}</span>
                  <button type="button" onClick={onClearError} className="font-semibold text-red-700 hover:text-red-900">
                    Dismiss
                  </button>
                </div>
              </div>
            )}

              <div className={`rounded-[24px] border p-4 ${roleToneClasses[preview.tone]}`}>
              <div className="flex items-start gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
                  <PreviewIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-950">{preview.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{preview.description}</p>
                </div>
              </div>
            </div>

            {role === 'organizer' && (
              <div className="mt-6 space-y-5">
                {step === 1 ? (
                  <>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-950">Organization details</h2>
                    <Input
                      label="Organization name"
                      value={organizerForm.organizationName}
                      onChange={(e) => {
                        onUpdateOrganizerForm({ organizationName: e.target.value })
                        setDirty(true)
                      }}
                      required
                      placeholder="Acme Events Group…"
                    />
                    <Select
                      label="Organization type"
                      value={organizerForm.organizationType}
                      onChange={(e) => {
                        onUpdateOrganizerForm({ organizationType: e.target.value })
                        setDirty(true)
                      }}
                      options={ORGANIZATION_TYPES.map((t) => ({ value: t, label: t }))}
                      placeholder="Select organization type"
                      required
                    />
                    <div className="flex justify-end">
                      <Button type="button" onClick={() => setStep(2)}>
                        Continue
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-950">Contact information</h2>
                    <Input
                      label="Phone number"
                      type="tel"
                      value={organizerForm.phone}
                      onChange={(e) => {
                        onUpdateOrganizerForm({ phone: e.target.value })
                        setDirty(true)
                      }}
                      required
                      placeholder="+1 555 123 4567…"
                    />
                    <Input
                      label="Address"
                      value={organizerForm.address}
                      onChange={(e) => {
                        onUpdateOrganizerForm({ address: e.target.value })
                        setDirty(true)
                      }}
                      required
                      placeholder="123 Market Street, Singapore…"
                    />
                    <div className="flex flex-wrap justify-between gap-3">
                      <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button type="submit" loading={submitting}>
                        Save organizer profile
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {role === 'vendor' && (
              <div className="mt-6 space-y-5">
                {step === 1 ? (
                  <>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-950">Business details</h2>
                    <Input
                      label="Business name"
                      value={vendorForm.businessName}
                      onChange={(e) => {
                        onUpdateVendorForm({ businessName: e.target.value })
                        setDirty(true)
                      }}
                      required
                      placeholder="Acme Catering Co.…"
                    />
                    <Select
                      label="Primary service area"
                      value={vendorForm.serviceArea}
                      onChange={(e) => {
                        onUpdateVendorForm({ serviceArea: e.target.value })
                        setDirty(true)
                      }}
                      options={SERVICE_AREAS.map((a) => ({ value: a, label: a }))}
                      placeholder="Select a service area"
                      required
                    />
                    <div className="flex justify-end">
                      <Button type="button" onClick={() => setStep(2)}>
                        Continue
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-950">Contact and description</h2>
                    <Input
                      label="Phone number"
                      type="tel"
                      value={vendorForm.phone}
                      onChange={(e) => {
                        onUpdateVendorForm({ phone: e.target.value })
                        setDirty(true)
                      }}
                      required
                      placeholder="+1 555 987 6543…"
                    />
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500" htmlFor="business-description">
                        Business description
                      </label>
                      <textarea
                        id="business-description"
                        value={vendorForm.businessDescription}
                        onChange={(e) => {
                          onUpdateVendorForm({ businessDescription: e.target.value })
                          setDirty(true)
                        }}
                        required
                        placeholder="Describe your services, coverage, and event strengths…"
                        rows={5}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-[border-color,box-shadow] duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 hover:border-slate-300"
                      />
                    </div>
                    <div className="flex flex-wrap justify-between gap-3">
                      <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button type="submit" loading={submitting}>
                        Save vendor profile
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {role === 'admin' && (
              <div className="mt-6 space-y-5">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950">Admin setup</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Your admin access is ready. No additional profile details are required.</p>
                </div>
                <Button type="submit" loading={submitting} fullWidth>
                  Go to dashboard
                </Button>
              </div>
            )}

            <div className="mt-6 flex justify-start">
              <Button type="button" variant="secondary" onClick={onBackToRoleChoice}>
                Change role
              </Button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-900">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-slate-950">What happens next</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">You will move directly to the workspace that matches your selected role.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Setup checklist</p>
              <ul className="mt-4 space-y-3">
                {[
                  'Use work contact details so procurement and support stay organized.',
                  'Keep descriptions specific so matching and review are easier later.',
                  'Save once, then continue to your role-specific workspace.',
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
