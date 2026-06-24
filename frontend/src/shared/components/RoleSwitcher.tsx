import type { UserRole } from '../../services/authService'
import { ROLE_LABELS } from '../constants/roleLabels'

interface RoleSwitcherProps {
  roles: UserRole[]
  activeRole: UserRole | null
  onChange: (role: UserRole) => void
}

export function RoleSwitcher({ roles, activeRole, onChange }: RoleSwitcherProps) {
  if (roles.length <= 1) return null

  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
      {roles.map((role) => {
        const active = role === activeRole
        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className={`rounded-full px-3.5 py-2 text-xs font-semibold capitalize transition-[background-color,color,box-shadow] duration-200 ${
              active ? 'bg-brand-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
          >
            {ROLE_LABELS[role] ?? role}
          </button>
        )
      })}
    </div>
  )
}
