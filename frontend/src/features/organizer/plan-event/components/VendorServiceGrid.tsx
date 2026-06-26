import { PlanEventChoiceCard } from './PlanEventChoiceCard'
import { VENDOR_SERVICE_OPTIONS } from '../models/planEvent.model'
import { VENDOR_SERVICE_VISUALS } from '../models/planEventVisuals'

interface VendorServiceGridProps {
  selectedServices: string[]
  onToggleService: (service: string) => void
}

export function VendorServiceGrid({ selectedServices, onToggleService }: VendorServiceGridProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {VENDOR_SERVICE_OPTIONS.map((service) => {
        const image = VENDOR_SERVICE_VISUALS[service.id] ?? VENDOR_SERVICE_VISUALS['Event staff']
        return (
          <PlanEventChoiceCard
            key={service.id}
            title={service.label}
            description={service.description}
            detail={service.detail}
            imageUrl={image.src}
            imageAlt={image.alt}
            selected={selectedServices.includes(service.id)}
            onSelect={() => onToggleService(service.id)}
            compact
          />
        )
      })}
    </div>
  )
}
