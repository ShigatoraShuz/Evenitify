import { useNavigate } from 'react-router-dom'
import { useAuthSession } from '../viewmodels/useAuthSession'
import { LoginView } from './LoginView'

export default function LoginViewWrapper() {
  const navigate = useNavigate()
  const { login, loading, error } = useAuthSession()

  const handleLogin = async (email: string, password: string) => {
    await login(email, password)
    navigate('/')
  }

  return (
    <LoginView
      onLogin={handleLogin}
      onSwitchToRegister={() => navigate('/register')}
      loading={loading}
      error={error}
    />
  )
}
