import { BrowserRouter } from 'react-router-dom'
import { useAuthSession } from './features/auth/viewmodels/useAuthSession'
import { AppRoutes } from './routes'
import './App.css'

function AppContent() {
  const { user, loading } = useAuthSession()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return <AppRoutes userRole={user?.role || null} />
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
