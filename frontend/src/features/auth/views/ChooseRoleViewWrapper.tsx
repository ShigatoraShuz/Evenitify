import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChooseRoleView } from './ChooseRoleView'
import { useAuthSession } from '../viewmodels/useAuthSession'
import type { UserRole } from '../../../services/authService'

export default function ChooseRoleViewWrapper() {
  const navigate = useNavigate()
  const { chooseRoles, loading } = useAuthSession()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChoose = async (roles: UserRole[]) => {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await chooseRoles(roles)
      navigate('/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to choose role. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ChooseRoleView
      loading={loading || submitting}
      error={error}
      onChoose={handleChoose}
      onBack={() => navigate('/register?entry=landing')}
    />
  )
}
