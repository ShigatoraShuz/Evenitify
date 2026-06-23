import { useEffect } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { Select } from '../../../shared/components/Select'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import type { OrganizerProfileForm } from '../models/user-settings.model'
import { ORGANIZATION_TYPES } from '../models/user-settings.model'

interface OrganizerProfileViewProps {
  profile: OrganizerProfileForm
  loading: boolean
  submitting: boolean
  error: string | null
  saved: boolean
  hasChanges: boolean
  onUpdateProfile: (next: Partial<OrganizerProfileForm>) => void
  onSaveProfile: () => Promise<void>
  onClearError: () => void
}

export function OrganizerProfileView({
  profile,
  loading,
  submitting,
  error,
  saved,
  hasChanges,
  onUpdateProfile,
  onSaveProfile,
  onClearError
}: OrganizerProfileViewProps) {
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
        title="Organizer Profile"
        subtitle="Manage your organization details"
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
        <Input
          label="Organization Name"
          value={profile.organizationName}
          onChange={(e) => onUpdateProfile({ organizationName: e.target.value })}
          required
        />
        <Select
          label="Organization Type"
          value={profile.organizationType}
          onChange={(e) => onUpdateProfile({ organizationType: e.target.value })}
          options={ORGANIZATION_TYPES.map((t) => ({ value: t, label: t }))}
          required
        />
        <Input
          label="Phone"
          type="tel"
          value={profile.phone}
          onChange={(e) => onUpdateProfile({ phone: e.target.value })}
          required
        />
        <Input
          label="Address"
          value={profile.address}
          onChange={(e) => onUpdateProfile({ address: e.target.value })}
          required
        />
      </div>
    </DashboardShell>
  )
}
