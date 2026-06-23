import { BrowserRouter } from 'react-router-dom'
import { useAuthSession } from './features/auth/viewmodels/useAuthSession'
import { AppRoutes } from './routes'
import './App.css'

function AppContent() {
  const { user, loading } = useAuthSession()

  return <AppRoutes userRole={user?.role || null} loading={loading} />
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
