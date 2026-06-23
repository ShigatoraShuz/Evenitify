import { BrowserRouter } from 'react-router-dom'
import { useAuthSession } from './features/auth/viewmodels/useAuthSession'
import { AppRoutes } from './routes'
import './App.css'

function AppContent() {
  const { user, loading, profileComplete } = useAuthSession()

  return <AppRoutes userRole={user?.role || null} profileComplete={profileComplete} loading={loading} />
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
