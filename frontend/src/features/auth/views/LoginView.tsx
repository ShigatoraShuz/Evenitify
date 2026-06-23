import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSwitchToRegister: () => void
  loading: boolean
  error: string | null
}

export function LoginView({ onLogin, onSwitchToRegister, loading, error }: LoginViewProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onLogin(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-600">Eventify</h1>
          <p className="text-sm text-gray-500 mt-1">B2B Organizer Vendor Procurement</p>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-6">Sign in</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
          <Button type="submit" loading={loading} fullWidth>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  )
}
