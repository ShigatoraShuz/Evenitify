import { useNavigate } from 'react-router-dom'

export function useLandingViewModel() {
  const navigate = useNavigate()

  const goToPlanning = () => navigate('/register?entry=landing&role=organizer')
  const goToVendors = () => navigate('/register?entry=landing&role=vendor')

  return { goToPlanning, goToVendors }
}
