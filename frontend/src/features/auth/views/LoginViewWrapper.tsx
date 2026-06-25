import { useNavigate } from 'react-router-dom'
import { useAuthSession } from '../viewmodels/useAuthSession'
import { LoginView } from './LoginView'
import type { UserProfile, UserRole } from '../../../services/authService'

function getCachedUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem('auth_user_cache')
    return raw ? (JSON.parse(raw) as UserProfile) : null
  } catch {
    return null
  }
}

function getUserRoles(user: UserProfile | null): UserRole[] {
  if (!user) return []
  if (user.roles?.length) return user.roles
  return user.role ? [user.role] : []
}

export default function LoginViewWrapper() {
  const navigate = useNavigate()
  const { login, loading, error } = useAuthSession()

  const handleLogin = async (email: string, password: string) => {
    await login(email, password)

    const user = getCachedUser()
    const roles = getUserRoles(user)
    const setupComplete = user?.setupComplete ?? false

    if (!user || roles.length === 0) {
      navigate('/choose-role')
    } else if (!setupComplete) {
      navigate('/onboarding')
    } else if (roles.includes('vendor')) {
      navigate('/vendor')
    } else if (roles.includes('admin')) {
      navigate('/admin')
    } else {
      navigate('/organizer')
    }
  }

  return (
    <LoginView
      onLogin={handleLogin}
      onSwitchToRegister={() => navigate('/register?entry=landing')}
      loading={loading}
      error={error}
    />
  )
}
