import { useNavigate } from 'react-router-dom'
import { Button } from './Button'

export function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(244,114,182,0.12),transparent_30%),linear-gradient(180deg,#07111f_0%,#0a1425_100%)] px-4">
      <div className="max-w-md rounded-[32px] border border-white/10 bg-white/5 p-8 text-center shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl">
        <div className="mb-4 text-7xl font-bold text-rose-200">403</div>
        <h1 className="mb-2 text-2xl font-semibold text-white">Access Denied</h1>
        <p className="mb-8 text-slate-300">You don&apos;t have permission to access this page.</p>
        <div className="flex justify-center gap-3">
          <Button variant="primary" onClick={() => navigate(-1)}>Go Back</Button>
          <Button variant="secondary" onClick={() => navigate('/')}>Home</Button>
        </div>
      </div>
    </div>
  )
}
