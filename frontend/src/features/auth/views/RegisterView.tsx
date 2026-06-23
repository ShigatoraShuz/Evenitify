import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { Select } from '../../../shared/components/Select'

interface RegisterViewProps {
  onRegister: (email: string, password: string, role: string, displayName: string) => Promise<void>
  onSwitchToLogin: () => void
  loading: boolean
  error: string | null
}

const ROLE_OPTIONS = [
  { value: 'organizer', label: 'Organizer' },
  { value: 'vendor', label: 'Vendor' }
]

export function RegisterView({ onRegister, onSwitchToLogin, loading, error }: RegisterViewProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState('organizer')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onRegister(email, password, role, displayName)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-600">Eventify</h1>
          <p className="text-sm text-gray-500 mt-1">B2B Organizer Vendor Procurement</p>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-6">Create account</h2>

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
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
          <Input
            label="Organization / Business Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your company name"
            required
          />
          <Select
            label="I am a..."
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={ROLE_OPTIONS}
          />
          <Button type="submit" loading={loading} fullWidth>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
