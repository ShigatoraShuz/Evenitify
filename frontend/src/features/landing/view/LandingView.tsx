import EventifyLandingPage from '@/components/ui/eventify-landing-page'
import { useLandingViewModel } from '../viewmodel/useLandingViewModel'

export default function LandingView() {
  const { goToPlanning, goToVendors } = useLandingViewModel()

  return (
    <EventifyLandingPage
      onStartPlanning={goToPlanning}
      onBrowseVendors={goToVendors}
    />
  )
}
