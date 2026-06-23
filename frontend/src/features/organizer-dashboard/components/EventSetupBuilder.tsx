import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, CalendarDays, MapPin, Palette, Sparkles, Users, UtensilsCrossed, Music4, ShieldCheck, Truck, Camera, LayoutPanelTop, Boxes } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { Select } from '../../../shared/components/Select'
import { PlaceholderMedia } from '../../../shared/components/PlaceholderMedia'
import {
  BOOTH_OPTIONS,
  COLOR_PALETTES,
  EVENT_MOODS,
  EVENT_TYPE_OPTIONS,
  SEATING_OPTIONS,
  SETUP_MODES,
  STAGE_OPTIONS,
  VENDOR_SERVICE_OPTIONS,
  type EventSetupBuilderProps,
  type EventSetupPayload,
  type EventTypeId
} from '../models/event-setup-builder.model'

const stepLabels = [
  'Select Event Type',
  'Select Venue / Location',
  'Add Event Details',
  'Choose Theme and Setup',
  'Choose Needed Vendor Services',
  'Budget, Schedule, Guest Count',
  'Review and Confirm Event Plan'
]

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

const serviceIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Catering': UtensilsCrossed,
  'Lights and sounds': Music4,
  'Event styling': Palette,
  'Venue decoration': Sparkles,
  'Photography': Camera,
  'Videography': Camera,
  'Hosts / emcees': ClipboardList,
  'Entertainment': Music4,
  'Security': ShieldCheck,
  'Transportation': Truck,
  'Equipment rental': Boxes,
  'Booth setup': Boxes,
  'Stage production': LayoutPanelTop,
  'Florist': Sparkles,
  'Event staff': Users,
  'Cleanup crew': CheckCircle2
}

const defaultByEventType = (eventType: EventTypeId) => EVENT_TYPE_OPTIONS.find((option) => option.id === eventType) ?? EVENT_TYPE_OPTIONS[0]

const initialState = {
  eventType: 'corporate' as EventTypeId,
  venue: 'Grand ballroom, convention center, or rooftop venue',
  title: '',
  description: '',
  theme: 'Clean corporate slate',
  colorPalette: 'Ivory + gold',
  mood: 'Professional, polished, and efficient',
  guests: '750',
  budget: '75000',
  eventDate: '',
  eventTime: '18:30',
  durationHours: '6',
  eventDays: '1',
  setupMode: 'indoor' as 'indoor' | 'outdoor' | 'hybrid',
  seating: 'Banquet',
  stageSetup: 'Panel stage',
  boothSetup: 'Single feature booth',
  cateringNeeds: 'Full-service catering with a plated dinner and late-night bites.',
  lightingNeeds: 'Architectural wash lighting and focused stage spots.',
  soundNeeds: 'Distributed speakers, microphones, and show playback.',
  decorationNeeds: 'Minimal branding, sculptural florals, and table accents.',
  photographyNeeds: 'Editorial capture with a same-day social recap.',
  securityNeeds: 'Guest check-in, VIP escort, and perimeter coverage.',
  transportationNeeds: 'Shuttle support for VIP arrivals.',
  equipmentRentalNeeds: 'Tables, chairs, lecterns, power distribution, and staging.',
  specialRequirements: 'Accessible routes, quiet room, and vendor staging access.',
  vendorNotes: 'Prioritize vendors with premium presentation and fast response times.',
  selectedServices: EVENT_TYPE_OPTIONS[2].recommendedServices
}

const stepMaxByIndex: Record<number, number> = {
  0: 1,
  1: 1,
  2: 4,
  3: 3,
  4: 1,
  5: 4,
  6: 0
}

function ServiceCard({
  label,
  description,
  detail,
  selected,
  onToggle
}: {
  label: string
  description: string
  detail: string
  selected: boolean
  onToggle: () => void
}) {
  const Icon = serviceIconMap[label] ?? CheckCircle2
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex h-full flex-col rounded-2xl border p-4 text-left transition-all duration-200 ${
        selected
          ? 'border-brand-500 bg-brand-50 shadow-sm shadow-brand-500/10'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2 text-slate-700">
          <Icon className="h-4 w-4" />
        </div>
        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          {selected ? 'Selected' : 'Add'}
        </span>
      </div>
      <h4 className="mt-4 text-sm font-semibold text-slate-950">{label}</h4>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <p className="mt-3 text-xs font-medium text-slate-500">{detail}</p>
    </button>
  )
}

function StepRail({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible">
      {stepLabels.map((label, index) => {
        const active = index === currentStep
        const complete = index < currentStep
        return (
          <div
            key={label}
            className={`flex min-w-[10rem] items-center gap-3 rounded-2xl border px-3 py-3 lg:min-w-0 ${
              active
                ? 'border-brand-500 bg-brand-50'
                : complete
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-slate-200 bg-white'
            }`}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              active
                ? 'bg-brand-600 text-white'
                : complete
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-500'
            }`}>
              {index + 1}
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Step {index + 1}</p>
              <p className="text-sm font-semibold text-slate-950">{label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function EventSetupBuilder({ existingEventCount, onSubmit, submitting }: EventSetupBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [state, setState] = useState(initialState)
  const [errors, setErrors] = useState<string[]>([])

  const eventTypeMeta = useMemo(() => defaultByEventType(state.eventType), [state.eventType])
  const recommendedServices = useMemo(
    () => Array.from(new Set([...eventTypeMeta.recommendedServices, ...state.selectedServices])),
    [eventTypeMeta.recommendedServices, state.selectedServices]
  )

  const progress = Math.round(((currentStep + 1) / stepLabels.length) * 100)

  const update = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) => {
    setState((current) => ({ ...current, [key]: value }))
  }

  const toggleService = (service: string) => {
    setState((current) => ({
      ...current,
      selectedServices: current.selectedServices.includes(service)
        ? current.selectedServices.filter((item) => item !== service)
        : [...current.selectedServices, service]
    }))
  }

  const validateStep = (step: number) => {
    const nextErrors: string[] = []
    if (step === 0 && !state.eventType) nextErrors.push('Choose an event type to continue.')
    if (step === 1 && !state.venue.trim()) nextErrors.push('Add a venue or location.')
    if (step === 2) {
      if (!state.title.trim()) nextErrors.push('Event name is required.')
      if (!state.description.trim()) nextErrors.push('Event description is required.')
    }
    if (step === 3) {
      if (!state.theme.trim()) nextErrors.push('Select a theme.')
      if (!state.colorPalette.trim()) nextErrors.push('Select a color palette.')
    }
    if (step === 4 && state.selectedServices.length === 0) nextErrors.push('Pick at least one vendor service.')
    if (step === 5) {
      if (!state.eventDate) nextErrors.push('Date is required.')
      if (!state.eventTime) nextErrors.push('Time is required.')
      if (!state.guests || Number(state.guests) <= 0) nextErrors.push('Guest count must be greater than zero.')
      if (!state.budget || Number(state.budget) <= 0) nextErrors.push('Budget must be greater than zero.')
    }
    setErrors(nextErrors)
    return nextErrors.length === 0
  }

  const goNext = () => {
    if (!validateStep(currentStep)) return
    setCurrentStep((value) => Math.min(value + 1, stepLabels.length - 1))
  }

  const goBack = () => {
    setErrors([])
    setCurrentStep((value) => Math.max(value - 1, 0))
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) return
    const payload: EventSetupPayload = {
      title: state.title.trim() || `${eventTypeMeta.label} planning draft`,
      description: state.description.trim(),
      eventType: state.eventType,
      venue: state.venue.trim(),
      theme: state.theme.trim(),
      colorPalette: state.colorPalette.trim(),
      mood: state.mood.trim(),
      guests: Number(state.guests),
      budget: Number(state.budget),
      eventDate: state.eventDate,
      eventTime: state.eventTime,
      durationHours: Number(state.durationHours),
      eventDays: Number(state.eventDays),
      setupMode: state.setupMode,
      seating: state.seating,
      stageSetup: state.stageSetup,
      boothSetup: state.boothSetup,
      cateringNeeds: state.cateringNeeds,
      lightingNeeds: state.lightingNeeds,
      soundNeeds: state.soundNeeds,
      decorationNeeds: state.decorationNeeds,
      photographyNeeds: state.photographyNeeds,
      securityNeeds: state.securityNeeds,
      transportationNeeds: state.transportationNeeds,
      equipmentRentalNeeds: state.equipmentRentalNeeds,
      specialRequirements: state.specialRequirements,
      vendorNotes: state.vendorNotes,
      selectedServices: recommendedServices
    }

    await onSubmit(payload)
    setSubmitted(true)
    setCurrentStep(6)
  }

  const currentIcon = iconMap[state.eventType] ?? Sparkles
  const CurrentIcon = currentIcon

  if (submitted) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-600 p-2 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Event saved</p>
              <h3 className="text-2xl font-semibold text-emerald-950">Your event plan is ready for procurement</h3>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-emerald-900/80">
            The core event has been created and matched against the selected vendor services. Use the procurement workspace next to send booking requests.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">Type: {eventTypeMeta.label}</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">Guests: {state.guests}</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">Budget: ${Number(state.budget).toLocaleString()}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => { setSubmitted(false); setCurrentStep(0) }}>Create another event</Button>
          </div>
        </div>
        <PlaceholderMedia
          title="Procurement handoff"
          subtitle="Vendor matching begins from the selected services and event setup."
          tone="emerald"
          icon={<CurrentIcon className="h-5 w-5" />}
        />
      </div>
    )
  }

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
          <PlaceholderMedia
            title="Event setup"
            subtitle={`Start from one of ${existingEventCount > 0 ? `${existingEventCount} existing events` : 'the live planning templates'} or build a fresh brief.`}
            tone="indigo"
            icon={<CurrentIcon className="h-5 w-5" />}
            compact
          />
          <StepRail currentStep={currentStep} />
        </aside>

        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-950 px-5 py-5 text-white md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Event builder</p>
              <h3 className="mt-2 text-2xl font-semibold">{stepLabels[currentStep]}</h3>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Step {currentStep + 1} of {stepLabels.length}. Progress: {progress}%.
              </p>
            </div>
            <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Type: {eventTypeMeta.label}</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Theme: {state.theme}</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Services: {recommendedServices.length}</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
            <div className="h-1 bg-slate-100">
              <div className="h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>

            <div className="p-5 md:p-6">
              {errors.length > 0 && (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errors.map((error) => <p key={error}>{error}</p>)}
                </div>
              )}

              {currentStep === 0 && (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {EVENT_TYPE_OPTIONS.map((option) => {
                    const selected = state.eventType === option.id
                    const Icon = iconMap[option.id] ?? Sparkles
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => {
                          update('eventType', option.id)
                          update('theme', option.defaultTheme)
                          update('mood', option.mood)
                          update('selectedServices', option.recommendedServices)
                        }}
                        className={`rounded-[22px] border p-4 text-left transition-all ${
                          selected ? 'border-brand-500 bg-brand-50 shadow-sm shadow-brand-500/10' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2 text-slate-700">
                            <Icon className="h-4 w-4" />
                          </div>
                          {selected && <span className="rounded-full bg-brand-600 px-2 py-1 text-[11px] font-semibold text-white">Selected</span>}
                        </div>
                        <h4 className="mt-4 text-base font-semibold text-slate-950">{option.label}</h4>
                        <p className="mt-2 text-sm text-slate-600">{option.description}</p>
                        <p className="mt-3 text-xs font-medium text-slate-500">Recommended theme: {option.defaultTheme}</p>
                      </button>
                    )
                  })}
                </div>
              )}

              {currentStep === 1 && (
                <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                  <div className="space-y-4">
                    <Input label="Venue or location" value={state.venue} onChange={(e) => update('venue', e.target.value)} placeholder="Convention center, private estate, rooftop, expo hall..." />
                    <div className="grid gap-3 sm:grid-cols-2">
                      {['Grand ballroom', 'Convention center', 'Rooftop venue', 'Private estate', 'Warehouse venue', 'Outdoor festival ground'].map((place) => (
                        <button
                          key={place}
                          type="button"
                          onClick={() => update('venue', place)}
                          className={`rounded-2xl border px-3 py-3 text-left text-sm transition-all ${
                            state.venue === place ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {place}
                        </button>
                      ))}
                    </div>
                  </div>
                  <PlaceholderMedia
                    title="Venue framing"
                    subtitle="Keep guest arrival, loading, and stage sightlines in view while selecting the location."
                    tone="amber"
                    icon={<MapPin className="h-5 w-5" />}
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                  <div className="grid gap-4">
                    <Input label="Event name" value={state.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Horizon Capital Annual Summit" />
                    <Input label="Event description" value={state.description} onChange={(e) => update('description', e.target.value)} placeholder="One sentence describing the occasion, audience, and purpose." />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input label="Guest count" type="number" min="1" value={state.guests} onChange={(e) => update('guests', e.target.value)} />
                      <Input label="Budget range" type="number" min="0" step="500" value={state.budget} onChange={(e) => update('budget', e.target.value)} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input label="Event date" type="date" value={state.eventDate} onChange={(e) => update('eventDate', e.target.value)} />
                      <Input label="Event time" type="time" value={state.eventTime} onChange={(e) => update('eventTime', e.target.value)} />
                    </div>
                  </div>
                  <PlaceholderMedia
                    title="Planning brief"
                    subtitle="Capture the essentials organizers need before sending vendor requests."
                    tone="slate"
                    icon={<CalendarDays className="h-5 w-5" />}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Select label="Theme" value={state.theme} onChange={(e) => update('theme', e.target.value)} options={EVENT_TYPE_OPTIONS.map((option) => ({ value: option.defaultTheme, label: option.defaultTheme }))} />
                    <Select label="Color palette" value={state.colorPalette} onChange={(e) => update('colorPalette', e.target.value)} options={COLOR_PALETTES.map((palette) => ({ value: palette, label: palette }))} />
                    <Select label="Event mood" value={state.mood} onChange={(e) => update('mood', e.target.value)} options={EVENT_MOODS.map((mood) => ({ value: mood, label: mood }))} />
                    <Select label="Setup mode" value={state.setupMode} onChange={(e) => update('setupMode', e.target.value as typeof state.setupMode)} options={SETUP_MODES.map((mode) => ({ value: mode, label: mode.charAt(0).toUpperCase() + mode.slice(1) }))} />
                    <Select label="Seating arrangement" value={state.seating} onChange={(e) => update('seating', e.target.value)} options={SEATING_OPTIONS.map((item) => ({ value: item, label: item }))} />
                    <Select label="Stage setup" value={state.stageSetup} onChange={(e) => update('stageSetup', e.target.value)} options={STAGE_OPTIONS.map((item) => ({ value: item, label: item }))} />
                    <Select label="Booth setup" value={state.boothSetup} onChange={(e) => update('boothSetup', e.target.value)} options={BOOTH_OPTIONS.map((item) => ({ value: item, label: item }))} />
                    <Input label="Number of event days" type="number" min="1" value={state.eventDays} onChange={(e) => update('eventDays', e.target.value)} />
                  </div>
                  <PlaceholderMedia
                    title="Theme board"
                    subtitle={`Palette: ${state.colorPalette}. Mood: ${state.mood}.`}
                    tone="indigo"
                    icon={<Palette className="h-5 w-5" />}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="grid gap-4 xl:grid-cols-3">
                  {VENDOR_SERVICE_OPTIONS.map((service) => (
                    <ServiceCard
                      key={service.id}
                      label={service.label}
                      description={service.description}
                      detail={service.detail}
                      selected={state.selectedServices.includes(service.id)}
                      onToggle={() => toggleService(service.id)}
                    />
                  ))}
                </div>
              )}

              {currentStep === 5 && (
                <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Duration in hours" type="number" min="1" value={state.durationHours} onChange={(e) => update('durationHours', e.target.value)} />
                    <Input label="Number of event days" type="number" min="1" value={state.eventDays} onChange={(e) => update('eventDays', e.target.value)} />
                    <Input label="Lighting needs" value={state.lightingNeeds} onChange={(e) => update('lightingNeeds', e.target.value)} />
                    <Input label="Sound needs" value={state.soundNeeds} onChange={(e) => update('soundNeeds', e.target.value)} />
                    <Input label="Catering needs" value={state.cateringNeeds} onChange={(e) => update('cateringNeeds', e.target.value)} />
                    <Input label="Decoration needs" value={state.decorationNeeds} onChange={(e) => update('decorationNeeds', e.target.value)} />
                    <Input label="Photography / videography" value={state.photographyNeeds} onChange={(e) => update('photographyNeeds', e.target.value)} />
                    <Input label="Security needs" value={state.securityNeeds} onChange={(e) => update('securityNeeds', e.target.value)} />
                    <Input label="Transportation needs" value={state.transportationNeeds} onChange={(e) => update('transportationNeeds', e.target.value)} />
                    <Input label="Equipment rental needs" value={state.equipmentRentalNeeds} onChange={(e) => update('equipmentRentalNeeds', e.target.value)} />
                    <Input label="Special requirements" value={state.specialRequirements} onChange={(e) => update('specialRequirements', e.target.value)} />
                    <Input label="Notes for vendors" value={state.vendorNotes} onChange={(e) => update('vendorNotes', e.target.value)} />
                  </div>
                  <PlaceholderMedia
                    title="Requirements"
                    subtitle={`${recommendedServices.length} vendor services selected for procurement.`}
                    tone="rose"
                    icon={<CheckCircle2 className="h-5 w-5" />}
                  />
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-5">
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Event</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{state.title || `${eventTypeMeta.label} planning draft`}</p>
                      <p className="mt-2 text-sm text-slate-600">{state.description}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Schedule</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{state.eventDate || 'Date pending'}</p>
                      <p className="mt-2 text-sm text-slate-600">{state.eventTime} · {state.durationHours} hours · {state.eventDays} day(s)</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Budget</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">${Number(state.budget).toLocaleString()}</p>
                      <p className="mt-2 text-sm text-slate-600">{state.guests} guests · {state.setupMode} setup</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                      <h4 className="text-sm font-semibold text-slate-950">Selected services</h4>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recommendedServices.map((service) => (
                          <span key={service} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{service}</span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                      <h4 className="text-sm font-semibold text-slate-950">Vendor notes</h4>
                      <p className="mt-2 text-sm text-slate-600">{state.vendorNotes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-600">
              {currentStep === 6
                ? 'Review the plan before creating the event and generating procurement requirements.'
                : 'Use the guided steps to build the full event setup before vendor outreach.'}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={goBack} disabled={currentStep === 0 || submitting}>
                <ChevronLeft className="mr-1.5 h-4 w-4" />
                Back
              </Button>
              {currentStep < 6 ? (
                <Button onClick={goNext} disabled={submitting}>
                  Next
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => { void handleSubmit() }} loading={submitting}>
                  Create Event
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
