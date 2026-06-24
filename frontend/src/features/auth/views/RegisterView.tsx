import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, CheckCircle2, LayoutGrid, ShieldCheck } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { ValidationSummary } from '../../../shared/components/ValidationSummary'

interface RegisterViewProps {
  onRegister: (email: string, password: string, displayName: string) => Promise<void>
  onSwitchToLogin: () => void
  loading: boolean
  error: string | null
}

export function RegisterView({ onRegister, onSwitchToLogin, loading, error }: RegisterViewProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string; displayName?: string }>({})
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const displayNameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (validationErrors.email) {
      emailRef.current?.focus()
      return
    }
    if (validationErrors.password) {
      passwordRef.current?.focus()
      return
    }
    if (validationErrors.displayName) {
      displayNameRef.current?.focus()
    }
  }, [validationErrors])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: { email?: string; password?: string; displayName?: string } = {}
    if (!email.trim()) nextErrors.email = 'Enter a work email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (!displayName.trim()) nextErrors.displayName = 'Enter your organization or business name.'
    setValidationErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || loading) return
    await onRegister(email, password, displayName)
  }

  return (
    <div className="grid min-h-screen bg-transparent lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="hidden overflow-hidden border-r border-slate-200 bg-brand-950 text-white lg:flex">
        <div className="flex w-full flex-col justify-between p-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-950">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-semibold tracking-tight">Eventify</p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Create your workspace</p>
              </div>
            </div>
            <div className="mt-12 max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Procurement-ready setup</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tighter text-white">Register once and keep your work separated by role.</h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
                Build an organizer workspace, vendor profile, or dual-role setup without losing the structure needed for enterprise event procurement.
              </p>
            </div>
            <div className="mt-10 grid gap-3">
              {[
                ['Organizers', 'Define event portfolios and procurement requirements.'],
                ['Vendors', 'Respond to organizer requests and manage service packages.'],
                ['Admins', 'Review platform operations and exceptions.'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                      <CheckCircle2 className="h-4 w-4 text-brand-200" />
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Why it matters</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">A strong setup keeps procurement, vendor management, and operations clean from day one.</p>
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
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Create your workspace</p>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <h1 className="mt-8 text-3xl font-semibold tracking-tighter text-slate-950 sm:text-4xl">Create your account</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Start with a clean profile and move into role selection right after registration.</p>
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
                required
              />
              <Input
                ref={passwordRef}
                label="Password"
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters…"
                error={validationErrors.password}
                required
              />
              <Input
                ref={displayNameRef}
                label="Organization or business name"
                name="displayName"
                autoComplete="organization"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Acme Event Group…"
                error={validationErrors.displayName}
                required
              />

              <Button type="submit" loading={loading} fullWidth>
                Create account
              </Button>
            </form>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Organizers', text: 'Event planning and procurement.', icon: LayoutGrid },
                { label: 'Vendors', text: 'Requests, packages, and availability.', icon: ShieldCheck },
                { label: 'Admins', text: 'Operations and oversight.', icon: Building2 },
              ].map(({ label, text, icon: Icon }) => (
                <div key={label} className="rounded-[20px] border border-slate-200 bg-slate-50 p-3">
                  <Icon className="h-4 w-4 text-brand-800" />
                  <p className="mt-3 text-sm font-semibold text-slate-950">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <button type="button" onClick={onSwitchToLogin} className="font-semibold text-brand-800 hover:text-brand-950">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
