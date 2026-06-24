import { Sparkles, Music4, ClipboardList, Users, Boxes } from 'lucide-react'
import { EVENT_TYPE_OPTIONS, type EventTypeId } from '../models/planEvent.model'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wedding: Sparkles,
  concert: Music4,
  corporate: ClipboardList,
  conference: Users,
  'product-launch': Sparkles,
  festival: Sparkles,
  birthday: Sparkles,
  expo: Boxes,
  private: Sparkles,
  custom: Sparkles
}

interface EventTypeGridProps {
  selected: EventTypeId
  onSelect: (id: EventTypeId) => void
}

export function EventTypeGrid({ selected, onSelect }: EventTypeGridProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {EVENT_TYPE_OPTIONS.map((option) => {
        const isSelected = selected === option.id
        const Icon = iconMap[option.id] ?? Sparkles
        return (
          <button
            type="button"
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`rounded-[22px] border p-4 text-left transition-all ${
              isSelected ? 'border-brand-500 bg-brand-50 shadow-sm shadow-brand-500/10' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2 text-slate-700">
                <Icon className="h-4 w-4" />
              </div>
              {isSelected && <span className="rounded-full bg-brand-600 px-2 py-1 text-[11px] font-semibold text-white">Selected</span>}
            </div>
            <h4 className="mt-4 text-base font-semibold text-slate-950">{option.label}</h4>
            <p className="mt-2 text-sm text-slate-600">{option.description}</p>
            <p className="mt-3 text-xs font-medium text-slate-500">Recommended theme: {option.defaultTheme}</p>
          </button>
        )
      })}
    </div>
  )
}
