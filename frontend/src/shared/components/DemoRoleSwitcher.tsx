import { useNavigate } from 'react-router-dom'
import { demoJourneyService, type DemoRole } from '../../services/demoJourneyService'

interface DemoRoleSwitcherProps {
  compact?: boolean
}

export function DemoRoleSwitcher({ compact = false }: DemoRoleSwitcherProps) {
  const navigate = useNavigate()

  if (!demoJourneyService.isAvailable()) return null

  const startJourney = (role: DemoRole) => {
    const journey = demoJourneyService.start(role)
    navigate(journey.route)
  }

  return (
    <div className={`${compact ? 'rounded-lg border border-blue-100 bg-blue-50 p-3' : 'rounded-xl border border-blue-100 bg-blue-50 p-4'}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-900">Development/demo only</p>
          {!compact && <p className="text-xs text-blue-700">Launch a complete frontend-only role journey with typed mock data. Disable mock mode for production API integration.</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {demoJourneyService.getJourneys().map((journey) => (
            <button
              key={journey.role}
              onClick={() => startJourney(journey.role)}
              className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
              title={journey.description}
            >
              {journey.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
