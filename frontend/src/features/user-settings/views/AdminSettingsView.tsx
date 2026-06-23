import { useEffect } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import type { AdminSettingsForm } from '../models/user-settings.model'

interface AdminSettingsViewProps {
  settings: AdminSettingsForm
  loading: boolean
  submitting: boolean
  error: string | null
  saved: boolean
  hasChanges: boolean
  onUpdateSettings: (next: Partial<AdminSettingsForm>) => void
  onSaveSettings: () => Promise<void>
  onClearError: () => void
}

export function AdminSettingsView({
  settings,
  loading,
  submitting,
  error,
  saved,
  hasChanges,
  onUpdateSettings,
  onSaveSettings,
  onClearError
}: AdminSettingsViewProps) {
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
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Admin Settings"
        subtitle="Manage your account settings"
        action={
          <Button onClick={onSaveSettings} loading={submitting} disabled={!hasChanges}>
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
          Settings saved successfully.
        </div>
      )}

      {hasChanges && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
          You have unsaved changes.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg space-y-4">
        <Input
          label="Display Name"
          value={settings.displayName}
          onChange={(e) => onUpdateSettings({ displayName: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={settings.email}
          onChange={(e) => onUpdateSettings({ email: e.target.value })}
          required
        />
      </div>
    </DashboardShell>
  )
}
