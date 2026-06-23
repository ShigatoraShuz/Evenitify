import { useNavigate } from 'react-router-dom'

export function useLandingViewModel() {
  const navigate = useNavigate()

  const goToPlanning = () => navigate('/register')
  const goToVendors = () => navigate('/register')

  return { goToPlanning, goToVendors }
}
