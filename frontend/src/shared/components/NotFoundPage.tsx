import { useNavigate } from 'react-router-dom'
import { Button } from './Button'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl font-bold text-brand-500 mb-4">404</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="primary" onClick={() => navigate(-1)}>Go Back</Button>
          <Button variant="secondary" onClick={() => navigate('/')}>Home</Button>
        </div>
      </div>
    </div>
  )
}
