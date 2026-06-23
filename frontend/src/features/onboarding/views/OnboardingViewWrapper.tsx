import { useOnboarding } from '../viewmodels/useOnboarding'
import { OnboardingView } from './OnboardingView'
import { useNavigate } from 'react-router-dom'

export default function OnboardingViewWrapper() {
  const navigate = useNavigate()
  const vm = useOnboarding()

  const handleSubmit = async () => {
    await vm.submitOnboarding()
    if (vm.role === 'admin') navigate('/admin')
    else if (vm.role === 'vendor') navigate('/vendor')
    else navigate('/organizer')
  }

  return (
    <OnboardingView
      role={vm.role}
      organizerForm={vm.organizerForm}
      vendorForm={vm.vendorForm}
      submitting={vm.submitting}
      error={vm.error}
      onUpdateOrganizerForm={vm.updateOrganizerForm}
      onUpdateVendorForm={vm.updateVendorForm}
      onSubmit={handleSubmit}
      onClearError={vm.clearError}
    />
  )
}
