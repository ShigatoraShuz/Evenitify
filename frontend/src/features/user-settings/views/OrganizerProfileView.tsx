import { useEffect } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { Select } from '../../../shared/components/Select'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { OrganizerCard, OrganizerPage, OrganizerPageHeader, SectionHeader } from '../../../shared/components/OrganizerUI'
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
        <OrganizerPage>
          <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        </OrganizerPage>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <OrganizerPage>
      <OrganizerPageHeader
        title="Organizer Profile"
        description="Manage organization details, contact information, and account readiness."
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

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <OrganizerCard>
          <SectionHeader title="Organization Profile" description="Core information used on event briefs and vendor requests." />
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>
        </OrganizerCard>

        <OrganizerCard>
          <SectionHeader title="Account / Security" description="Authentication details are managed by the signed-in account." />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Email and password changes are handled by the auth provider. This profile form updates organizer business details only.
          </div>
        </OrganizerCard>

        <OrganizerCard className="lg:col-span-2">
          <SectionHeader title="Contact Information" description="Used for vendor coordination and booking follow-up." />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Contact Number"
              type="tel"
              value={profile.phone}
              onChange={(e) => onUpdateProfile({ phone: e.target.value })}
              required
            />
            <Input
              label="Business Address"
              value={profile.address}
              onChange={(e) => onUpdateProfile({ address: e.target.value })}
              required
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={onSaveProfile} loading={submitting} disabled={!hasChanges}>
              Save Changes
            </Button>
          </div>
        </OrganizerCard>
      </div>
      </OrganizerPage>
    </DashboardShell>
  )
}
