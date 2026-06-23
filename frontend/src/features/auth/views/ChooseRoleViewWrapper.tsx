import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChooseRoleView } from './ChooseRoleView'
import { useAuthSession } from '../viewmodels/useAuthSession'
import type { UserRole } from '../../../services/authService'

export default function ChooseRoleViewWrapper() {
  const navigate = useNavigate()
  const { chooseRoles, loading } = useAuthSession()
  const [submitting, setSubmitting] = useState(false)

  const handleChoose = async (roles: UserRole[]) => {
    if (submitting) return
    setSubmitting(true)
    try {
      await chooseRoles(roles)
      navigate('/onboarding')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ChooseRoleView
      loading={loading || submitting}
      onChoose={handleChoose}
      onBack={() => navigate('/register?entry=landing')}
    />
  )
}
