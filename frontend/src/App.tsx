import { BrowserRouter } from 'react-router-dom'
import { useAuthSession } from './features/auth/viewmodels/useAuthSession'
import { ErrorBoundary } from './shared/components/ErrorBoundary'
import { AppRoutes } from './routes'
import './App.css'

function AppContent() {
  const { user, loading, profileComplete, activeRole, userRoles, chosenRoles } = useAuthSession()
  const roleChosen = userRoles.length > 0 || chosenRoles.length > 0

  return (
    <AppRoutes
      user={user}
      activeRole={activeRole}
      userRoles={userRoles}
      roleChosen={roleChosen}
      profileComplete={profileComplete}
      loading={loading}
    />
  )
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
