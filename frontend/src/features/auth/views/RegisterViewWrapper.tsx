import { useNavigate } from 'react-router-dom'
import { useAuthSession } from '../viewmodels/useAuthSession'
import { RegisterView } from './RegisterView'

export default function RegisterViewWrapper() {
  const navigate = useNavigate()
  const { register, loading, error } = useAuthSession()

  const handleRegister = async (email: string, password: string, displayName: string) => {
    await register(email, password, undefined, displayName)
    navigate('/choose-role')
  }

  return (
    <RegisterView
      onRegister={handleRegister}
      onSwitchToLogin={() => navigate('/login?entry=landing')}
      loading={loading}
      error={error}
    />
  )
}
