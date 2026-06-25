import { useEffect } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { Select } from '../../../shared/components/Select'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { ValidationSummary } from '../../../shared/components/ValidationSummary'
import type { VendorProfileForm } from '../models/user-settings.model'
import { SERVICE_AREAS } from '../models/user-settings.model'

interface VendorProfileViewProps {
  profile: VendorProfileForm
  loading: boolean
  submitting: boolean
  error: string | null
  saved: boolean
  hasChanges: boolean
  validationErrors: string[]
  onUpdateProfile: (next: Partial<VendorProfileForm>) => void
  onSaveProfile: () => Promise<void>
  onClearError: () => void
}

export function VendorProfileView({
  profile,
  loading,
  submitting,
  error,
  saved,
  hasChanges,
  validationErrors,
  onUpdateProfile,
  onSaveProfile,
  onClearError
}: VendorProfileViewProps) {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasChanges])

  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Vendor Profile"
        subtitle="Manage your business details and service areas"
        action={
          <Button onClick={onSaveProfile} loading={submitting} disabled={!hasChanges}>
            Save Changes
          </Button>
        }
      />

      <div className="mt-8 max-w-3xl space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex justify-between items-center shadow-sm">
            <span className="font-medium">{error}</span>
            <button onClick={onClearError} className="text-rose-500 hover:text-rose-700">&times;</button>
          </div>
        )}

        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium shadow-sm">
            Profile saved successfully.
          </div>
        )}

        {hasChanges && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-medium shadow-sm">
            You have unsaved changes. Don't forget to save!
          </div>
        )}

        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="mb-6 pb-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
            <p className="text-sm text-slate-500 mt-1">This information will be displayed to organizers on the marketplace.</p>
          </div>

          <ValidationSummary errors={validationErrors} />
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="col-span-2">
              <Input
                label="Business Name"
                placeholder="e.g. Prestige Events Photography"
                value={profile.businessName}
                onChange={(e) => onUpdateProfile({ businessName: e.target.value })}
                required
              />
            </div>
            
            <Select
              label="Service Area"
              value={profile.serviceArea}
              onChange={(e) => onUpdateProfile({ serviceArea: e.target.value })}
              options={SERVICE_AREAS.map((a) => ({ value: a, label: a }))}
              required
            />
            
            <Input
              label="Contact Phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={profile.phone}
              onChange={(e) => onUpdateProfile({ phone: e.target.value })}
              required
            />
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Description</label>
              <textarea
                value={profile.businessDescription}
                onChange={(e) => onUpdateProfile({ businessDescription: e.target.value })}
                rows={5}
                placeholder="Tell organizers about your experience, your team, and what makes your services unique..."
                className={[
                  'w-full px-4 py-3 rounded-xl border border-slate-200',
                  'focus:outline-none focus:ring-4 focus:ring-brand-500/20',
                  'focus:border-brand-500 text-sm transition-all shadow-sm',
                  'resize-none bg-white placeholder:text-slate-400 text-slate-900',
                ].join(' ')}
              />
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}
