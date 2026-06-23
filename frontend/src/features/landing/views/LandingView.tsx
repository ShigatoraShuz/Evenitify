import EventifyLandingPage from '@/components/ui/eventify-landing-page'
import { DemoRoleSwitcher } from '../../../shared/components/DemoRoleSwitcher'
import { useLandingViewModel } from '../viewmodels/useLandingViewModel'

export default function LandingView() {
  const { goToPlanning, goToVendors } = useLandingViewModel()

  return (
    <EventifyLandingPage
      onStartPlanning={goToPlanning}
      onBrowseVendors={goToVendors}
      demoPanel={<DemoRoleSwitcher />}
    />
  )
}
