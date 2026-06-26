import { PlanEventChoiceCard } from './PlanEventChoiceCard'
import { VENUE_VISUALS } from '../models/planEventVisuals'

interface VenueSuggestionGridProps {
  selectedVenue: string
  onSelect: (venue: string) => void
}

export function VenueSuggestionGrid({ selectedVenue, onSelect }: VenueSuggestionGridProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {VENUE_VISUALS.map((venue) => (
        <PlanEventChoiceCard
          key={venue.label}
          title={venue.label}
          description={venue.description}
          detail={venue.detail}
          imageUrl={venue.src}
          imageAlt={venue.alt}
          selected={selectedVenue === venue.label}
          onSelect={() => onSelect(venue.label)}
          compact
        />
      ))}
    </div>
  )
}

