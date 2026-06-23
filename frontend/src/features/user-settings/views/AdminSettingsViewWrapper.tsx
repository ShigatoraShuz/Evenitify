import { useAdminSettings } from '../viewmodels/useAdminSettings'
import { AdminSettingsView } from './AdminSettingsView'

export default function AdminSettingsViewWrapper() {
  const vm = useAdminSettings()

  return (
    <AdminSettingsView
      settings={vm.settings}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      saved={vm.saved}
      hasChanges={vm.hasChanges}
      onUpdateSettings={vm.updateSettings}
      onSaveSettings={vm.saveSettings}
      onClearError={vm.clearError}
    />
  )
}
