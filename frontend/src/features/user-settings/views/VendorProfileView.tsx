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
        subtitle="Manage your business details"
        action={
          <Button onClick={onSaveProfile} loading={submitting} disabled={!hasChanges}>
            Save Changes
          </Button>
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={onClearError} className="text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}

      {saved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          Profile saved successfully.
        </div>
      )}

      {hasChanges && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
          You have unsaved changes.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg space-y-4">
        <ValidationSummary errors={validationErrors} />
        <Input
          label="Business Name"
          value={profile.businessName}
          onChange={(e) => onUpdateProfile({ businessName: e.target.value })}
          required
        />
        <Select
          label="Service Area"
          value={profile.serviceArea}
          onChange={(e) => onUpdateProfile({ serviceArea: e.target.value })}
          options={SERVICE_AREAS.map((a) => ({ value: a, label: a }))}
          required
        />
        <Input
          label="Phone"
          type="tel"
          value={profile.phone}
          onChange={(e) => onUpdateProfile({ phone: e.target.value })}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
          <textarea
            value={profile.businessDescription}
            onChange={(e) => onUpdateProfile({ businessDescription: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
          />
        </div>
      </div>
    </DashboardShell>
  )
}
