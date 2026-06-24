import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, CalendarCheck2, ShieldCheck } from 'lucide-react'
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
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({})
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (validationErrors.email) {
      emailRef.current?.focus()
      return
    }
    if (validationErrors.password) {
      passwordRef.current?.focus()
    }
  }, [validationErrors])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: { email?: string; password?: string } = {}
    if (!email.trim()) nextErrors.email = 'Enter your work email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (!password) nextErrors.password = 'Enter your password.'
    setValidationErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || loading) return
    await onLogin(email, password)
  }

  return (
    <div className="grid min-h-screen bg-transparent lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="hidden overflow-hidden border-r border-slate-200 bg-slate-950 text-white lg:flex">
        <div className="flex w-full flex-col justify-between p-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-semibold tracking-tight">Eventify</p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">B2B procurement</p>
              </div>
            </div>
            <div className="mt-12 max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Organizers, vendors, and admin</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tighter text-white">Sign in to your event procurement workspace.</h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
                Keep event portfolios, B2B booking requests, contracts, and reports in one controlled workspace.
              </p>
            </div>
            <div className="mt-10 grid gap-3">
              {[
                ['Create event portfolios', 'Map budget, venue, scope, and service requirements.'],
                ['Track vendor requests', 'Keep B2B bookings separate from other work.'],
                ['Move contracts forward', 'Review signatures, timelines, and next actions.'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                      <ShieldCheck className="h-4 w-4 text-brand-200" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Trusted workflow</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Keep your procurement motion visible from first request to signed agreement.</p>
          </div>
        </div>
      </aside>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-lg">
          <div className="lg:hidden">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-900 text-white">
                <Building2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-base font-semibold tracking-tight text-slate-950">Eventify</p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">B2B procurement</p>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <h1 className="mt-8 text-3xl font-semibold tracking-tighter text-slate-950 sm:text-4xl">Sign in</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use your Eventify account to continue planning, vendor responses, or operations.</p>
          </motion.div>

          <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            {error && (
              <div className="mb-5 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert" aria-live="polite">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <ValidationSummary
                errors={Object.values(validationErrors).filter(Boolean) as string[]}
                title="Check the highlighted fields"
              />

              <Input
                ref={emailRef}
                label="Work email"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com…"
                error={validationErrors.email}
                hint="Use the email linked to your organizer, vendor, or admin account."
                required
              />

              <Input
                ref={passwordRef}
                label="Password"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password…"
                error={validationErrors.password}
                required
              />

              <Button type="submit" loading={loading} fullWidth>
                Sign in
              </Button>
            </form>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Organizer', text: 'Portfolio, procurement, and contracts.', icon: CalendarCheck2 },
                { label: 'Vendor', text: 'Requests, availability, and bookings.', icon: ShieldCheck },
                { label: 'Admin', text: 'Approvals, reports, and oversight.', icon: Building2 },
              ].map(({ label, text, icon: Icon }) => (
                <div key={label} className="rounded-[20px] border border-slate-200 bg-slate-50 p-3">
                  <Icon className="h-4 w-4 text-brand-800" />
                  <p className="mt-3 text-sm font-semibold text-slate-950">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              Need an account?{' '}
              <button type="button" onClick={onSwitchToRegister} className="font-semibold text-brand-800 hover:text-brand-950">
                Create one
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
