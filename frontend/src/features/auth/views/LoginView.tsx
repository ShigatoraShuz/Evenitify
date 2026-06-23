import { useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardCheck } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { ValidationSummary } from '../../../shared/components/ValidationSummary'

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSwitchToRegister: () => void
  loading: boolean
  error: string | null
}

export function LoginView({ onLogin, onSwitchToRegister, loading, error }: LoginViewProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = [
      !email.trim() ? 'Email is required.' : '',
      email && !email.includes('@') ? 'Enter a valid email address.' : '',
      !password ? 'Password is required.' : ''
    ].filter(Boolean)
    setValidationErrors(nextErrors)
    if (nextErrors.length > 0 || loading) return
    await onLogin(email, password)
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-10">
              <span className="text-2xl font-bold text-white">Eventify</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-300 border border-brand-400/30 rounded px-1.5 py-0.5">
                B2B
              </span>
            </div>
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <ClipboardCheck className="text-brand-300" size={26} />
              </div>
              <h2 className="text-3xl font-bold text-white leading-tight">
                Manage your event procurement
              </h2>
              <p className="text-brand-200 text-base leading-relaxed max-w-sm">
                Organize vendors, track bookings, and keep your events on schedule — all in one place.
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6">
            <p className="text-brand-300 text-sm">Trusted by 120+ event organizers</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-xl font-bold text-brand-600">Eventify</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-500 border border-brand-200 rounded px-1.5 py-0.5">
              B2B
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1 mb-8">Sign in to your Eventify workspace</p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <ValidationSummary errors={validationErrors} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Button type="submit" loading={loading} fullWidth>
                Sign in
              </Button>
            </motion.div>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Create one
            </button>
          </motion.p>
        </div>
      </div>
    </div>
  )
}
