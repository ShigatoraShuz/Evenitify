import { Building2, Store, Repeat2 } from 'lucide-react'
import type { UserRole } from '../../../services/authService'

interface ChooseRoleViewProps {
  loading: boolean
  error?: string | null
  onChoose: (roles: UserRole[]) => Promise<void>
  onBack: () => void
}

type RoleOption = {
  label: string
  roles: UserRole[]
  icon: React.ComponentType<{ className?: string }>
  image: string
  imageAlt: string
}

function createPlaceholderImage(title: string, accent: string, iconLabel: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" rx="28" fill="url(#g)" />
      <circle cx="96" cy="88" r="46" fill="rgba(255,255,255,0.12)" />
      <circle cx="536" cy="76" r="62" fill="rgba(255,255,255,0.08)" />
      <circle cx="520" cy="280" r="88" fill="rgba(255,255,255,0.06)" />
      <rect x="56" y="228" width="250" height="18" rx="9" fill="rgba(255,255,255,0.78)" />
      <rect x="56" y="256" width="180" height="14" rx="7" fill="rgba(255,255,255,0.55)" />
      <rect x="56" y="282" width="210" height="14" rx="7" fill="rgba(255,255,255,0.42)" />
      <text x="56" y="126" fill="white" font-family="Arial, sans-serif" font-size="34" font-weight="700">${title}</text>
      <text x="56" y="164" fill="rgba(255,255,255,0.78)" font-family="Arial, sans-serif" font-size="18">${iconLabel}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const OPTIONS: RoleOption[] = [
  {
    label: 'Organizer',
    roles: ['organizer'],
    icon: Building2,
    image: createPlaceholderImage('Organizer', '#1d4ed8', 'Plan large events and manage procurement'),
    imageAlt: 'Organizer role illustration'
  },
  {
    label: 'Vendor',
    roles: ['vendor'],
    icon: Store,
    image: createPlaceholderImage('Vendor', '#0f766e', 'Manage services and B2B requests'),
    imageAlt: 'Vendor role illustration'
  }
]

export function ChooseRoleView({ loading, error, onChoose, onBack }: ChooseRoleViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Choose your role</h1>
          <p className="mt-2 text-sm text-slate-500">Select how you want to use Eventify.</p>
        </div>
        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 text-center max-w-3xl mx-auto">
            {error}
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.label}
                type="button"
                disabled={loading}
                onClick={() => onChoose(option.roles)}
                className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-brand-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                  <img src={option.image} alt={option.imageAlt} className="h-44 w-full object-cover" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-brand-600" />
                  <span className="block text-base font-semibold text-slate-900">{option.label}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {option.label === 'Organizer'
                    ? 'Event planning, vendor search, procurement, and contracts.'
                    : option.label === 'Vendor'
                      ? 'Business profile, service management, and booking requests.'
                      : 'Use both organizer and vendor capabilities in one account.'}
                </p>
              </button>
            )
          })}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-300 hover:text-brand-700"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
