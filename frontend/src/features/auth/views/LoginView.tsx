import { useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardCheck } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { ValidationSummary } from '../../../shared/components/ValidationSummary'
import { BackgroundCarousel } from '../../../shared/components/BackgroundCarousel'

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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-transparent">
      <BackgroundCarousel />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/15 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-[100px] pointer-events-none z-0" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-[1000px] min-h-[600px] flex flex-col lg:flex-row rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm shadow-xl border border-slate-100"
      >
        <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-brand-50 to-white p-12 relative overflow-hidden border-r border-slate-100">
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-10">
                <span className="text-2xl font-bold text-brand-600">Eventify</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-500 border border-brand-200 bg-brand-50 rounded px-1.5 py-0.5">
                  B2B
                </span>
              </div>
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center border border-brand-200">
                  <ClipboardCheck className="text-brand-600" size={26} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 leading-tight">
                  Manage your event procurement
                </h2>
                <p className="text-slate-600 text-base leading-relaxed max-w-sm">
                  Organize vendors, track bookings, and keep your events on schedule — all in one place.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-6">
              <p className="text-slate-500 text-sm font-medium">Trusted by 120+ event organizers</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <span className="text-xl font-bold text-slate-900">Eventify</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-600 border border-brand-200 bg-brand-50 rounded px-1.5 py-0.5">
                B2B
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Welcome back</h1>
              <p className="text-slate-500 mt-2 mb-8">Sign in to your Eventify workspace</p>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600"
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
              className="mt-8 text-center text-sm text-slate-500"
            >
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                Create one
              </button>
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
