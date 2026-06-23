import { useNavigate } from 'react-router-dom'

export function useLandingViewModel() {
  const navigate = useNavigate()

  const goToPlanning = () => navigate('/register?entry=landing')
  const goToVendors = () => navigate('/register?entry=landing')

  return { goToPlanning, goToVendors }
}
