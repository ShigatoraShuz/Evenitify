import { useNavigate } from 'react-router-dom'
import { Button } from './Button'

export function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl font-bold text-red-400 mb-4">403</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-8">You don't have permission to access this page.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="primary" onClick={() => navigate(-1)}>Go Back</Button>
          <Button variant="secondary" onClick={() => navigate('/')}>Home</Button>
        </div>
      </div>
    </div>
  )
}
