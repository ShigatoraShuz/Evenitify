import { useNavigate } from 'react-router-dom'
import { useAuthSession } from '../viewmodels/useAuthSession'
import { RegisterView } from './RegisterView'

export default function RegisterViewWrapper() {
  const navigate = useNavigate()
  const { register, loading, error } = useAuthSession()

  const handleRegister = async (email: string, password: string, role: string, displayName: string) => {
    await register(email, password, role, displayName)
    navigate('/')
  }

  return (
    <RegisterView
      onRegister={handleRegister}
      onSwitchToLogin={() => navigate('/login')}
      loading={loading}
      error={error}
    />
  )
}
