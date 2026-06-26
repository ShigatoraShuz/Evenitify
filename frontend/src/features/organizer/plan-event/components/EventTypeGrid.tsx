import { EVENT_TYPE_OPTIONS, type EventTypeId } from '../models/planEvent.model'
import { EVENT_TYPE_VISUALS } from '../models/planEventVisuals'
import { PlanEventChoiceCard } from './PlanEventChoiceCard'

interface EventTypeGridProps {
  selected: EventTypeId
  onSelect: (id: EventTypeId) => void
}

export function EventTypeGrid({ selected, onSelect }: EventTypeGridProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {EVENT_TYPE_OPTIONS.map((option) => {
        const isSelected = selected === option.id
        const visual = EVENT_TYPE_VISUALS[option.id]
        return (
          <PlanEventChoiceCard
            key={option.id}
            title={option.label}
            description={option.description}
            detail={`Recommended theme: ${option.defaultTheme}`}
            imageUrl={visual.src}
            imageAlt={visual.alt}
            selected={isSelected}
            onSelect={() => onSelect(option.id)}
            compact
          />
        )
      })}
    </div>
  )
}
