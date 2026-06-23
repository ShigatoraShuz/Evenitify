import { useVendorProfile } from '../viewmodels/useVendorProfile'
import { VendorProfileView } from './VendorProfileView'

export default function VendorProfileViewWrapper() {
  const vm = useVendorProfile()

  return (
    <VendorProfileView
      profile={vm.profile}
      loading={vm.loading}
      submitting={vm.submitting}
      error={vm.error}
      saved={vm.saved}
      hasChanges={vm.hasChanges}
      validationErrors={vm.validationErrors}
      onUpdateProfile={vm.updateProfile}
      onSaveProfile={vm.saveProfile}
      onClearError={vm.clearError}
    />
  )
}
