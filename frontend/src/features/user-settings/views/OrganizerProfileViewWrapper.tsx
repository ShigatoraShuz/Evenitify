import { useOrganizerProfile } from '../viewmodels/useOrganizerProfile'
import { OrganizerProfileView } from './OrganizerProfileView'

export default function OrganizerProfileViewWrapper() {
  const vm = useOrganizerProfile()

  return (
    <OrganizerProfileView
      profile={vm.profile}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      saved={vm.saved}
      hasChanges={vm.hasChanges}
      onUpdateProfile={vm.updateProfile}
      onSaveProfile={vm.saveProfile}
      onClearError={vm.clearError}
    />
  )
}
