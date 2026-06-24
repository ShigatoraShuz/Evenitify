import { useMemo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Sparkles, MapPin, CalendarDays, Palette, UtensilsCrossed, Music4, ShieldCheck, Truck, Camera, LayoutPanelTop, Boxes, ClipboardList, Users, FileEdit, Archive } from 'lucide-react'
import { DashboardShell } from '../../../../shared/components/DashboardShell'
import { PageHeader } from '../../../../shared/components/PageHeader'
import { Button } from '../../../../shared/components/Button'
import { Input } from '../../../../shared/components/Input'
import { Select } from '../../../../shared/components/Select'
import { PlaceholderMedia } from '../../../../shared/components/PlaceholderMedia'
import { EventSetupSteps } from '../components/EventSetupSteps'
import { EventBuilderHeader } from '../components/EventBuilderHeader'
import { EventTypeGrid } from '../components/EventTypeGrid'
import { EventBuilderNavigation } from '../components/EventBuilderNavigation'
import { EventReviewPanel } from '../components/EventReviewPanel'
import { DraftEventsTab } from '../components/DraftEventsTab'
import { CompletedEventBriefsTab } from '../components/CompletedEventBriefsTab'
import type { PlanEventFormState, EventTypeOption, EventTypeId } from '../models/planEvent.model'
import {
  EVENT_TYPE_OPTIONS,
  VENDOR_SERVICE_OPTIONS,
  COLOR_PALETTES,
  EVENT_MOODS,
  SETUP_MODES,
  SEATING_OPTIONS,
  STAGE_OPTIONS,
  BOOTH_OPTIONS
} from '../models/planEvent.model'

type PlanTab = 'create' | 'drafts' | 'completed'

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

interface OrganizerPlanEventViewProps {
  currentStep: number
  form: PlanEventFormState
  errors: string[]
  submitted: boolean
  submitting: boolean
  createdEventId: string | null
  eventTypeMeta: EventTypeOption
  recommendedServices: string[]
  progress: number
  onUpdateForm: <K extends keyof PlanEventFormState>(key: K, value: PlanEventFormState[K]) => void
  onToggleService: (service: string) => void
  onSelectEventType: (id: EventTypeId) => void
  onGoNext: () => void
  onGoBack: () => void
  onSubmit: () => void
  onSaveDraft: () => void
  onReset: () => void
  onContinueToProcurement?: () => void
}

export function OrganizerPlanEventView({
  currentStep,
  form,
  errors,
  submitted,
  submitting,
  eventTypeMeta,
  recommendedServices,
  progress,
  onUpdateForm,
  onToggleService,
  onSelectEventType,
  onGoNext,
  onGoBack,
  onSubmit,
  onSaveDraft,
  onReset,
  onContinueToProcurement
}: OrganizerPlanEventViewProps) {
  const [activeTab, setActiveTab] = useState<PlanTab>('create')
  const navigate = useNavigate()

  const tabs = [
    { key: 'create' as PlanTab, label: 'Create Event', icon: Sparkles },
    { key: 'drafts' as PlanTab, label: 'Draft Events', icon: FileEdit },
    { key: 'completed' as PlanTab, label: 'Completed Briefs', icon: Archive },
  ]

  const update = useCallback(<K extends keyof PlanEventFormState>(key: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onUpdateForm(key, e.target.value as PlanEventFormState[K])
  }, [onUpdateForm])

  const venueSuggestions = ['Grand ballroom', 'Convention center', 'Rooftop venue', 'Private estate', 'Warehouse venue', 'Outdoor festival ground']

  const renderStepContent = useMemo(() => {
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
                <h3 className="text-2xl font-semibold text-emerald-950">Your event plan is ready for the marketplace</h3>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm text-emerald-900/80">
              The core event has been created and matched against the selected vendor services. Use the Vendor Marketplace next to send booking requests.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">Type: {eventTypeMeta.label}</span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">Guests: {form.guests}</span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">Budget: ${Number(form.budget).toLocaleString()}</span>
            </div>
          </div>
          <PlaceholderMedia
            title="Procurement handoff"
            subtitle="Vendor matching begins from the selected services and event setup."
            tone="emerald"
            icon={<Sparkles className="h-5 w-5" />}
          />
        </div>
      )
    }

    return (
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
            <EventTypeGrid selected={form.eventType} onSelect={onSelectEventType} />
          )}

          {currentStep === 1 && (
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                <Input label="Venue or location" value={form.venue} onChange={update('venue')} placeholder="Convention center, private estate, rooftop, expo hall..." />
                <div className="grid gap-3 sm:grid-cols-2">
                  {venueSuggestions.map((place) => (
                    <button
                      key={place}
                      type="button"
                      onClick={() => onUpdateForm('venue', place)}
                      className={`rounded-2xl border px-3 py-3 text-left text-sm transition-all ${
                        form.venue === place ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
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
                <Input label="Event name" value={form.title} onChange={update('title')} placeholder="e.g. Horizon Capital Annual Summit" />
                <Input label="Event description" value={form.description} onChange={update('description')} placeholder="One sentence describing the occasion, audience, and purpose." />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Guest count" type="number" min="1" value={form.guests} onChange={update('guests')} />
                  <Input label="Budget range" type="number" min="0" step="500" value={form.budget} onChange={update('budget')} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Event date" type="date" value={form.eventDate} onChange={update('eventDate')} />
                  <Input label="Event time" type="time" value={form.eventTime} onChange={update('eventTime')} />
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
                <Select label="Theme" value={form.theme} onChange={update('theme')} options={EVENT_TYPE_OPTIONS.map((option) => ({ value: option.defaultTheme, label: option.defaultTheme }))} />
                <Select label="Color palette" value={form.colorPalette} onChange={update('colorPalette')} options={COLOR_PALETTES.map((palette) => ({ value: palette, label: palette }))} />
                <Select label="Event mood" value={form.mood} onChange={update('mood')} options={EVENT_MOODS.map((mood) => ({ value: mood, label: mood }))} />
                <Select label="Setup mode" value={form.setupMode} onChange={update('setupMode')} options={SETUP_MODES.map((mode) => ({ value: mode, label: mode.charAt(0).toUpperCase() + mode.slice(1) }))} />
                <Select label="Seating arrangement" value={form.seating} onChange={update('seating')} options={SEATING_OPTIONS.map((item) => ({ value: item, label: item }))} />
                <Select label="Stage setup" value={form.stageSetup} onChange={update('stageSetup')} options={STAGE_OPTIONS.map((item) => ({ value: item, label: item }))} />
                <Select label="Booth setup" value={form.boothSetup} onChange={update('boothSetup')} options={BOOTH_OPTIONS.map((item) => ({ value: item, label: item }))} />
                <Input label="Number of event days" type="number" min="1" value={form.eventDays} onChange={update('eventDays')} />
              </div>
              <PlaceholderMedia
                title="Theme board"
                subtitle={`Palette: ${form.colorPalette}. Mood: ${form.mood}.`}
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
                  selected={form.selectedServices.includes(service.id)}
                  onToggle={() => onToggleService(service.id)}
                />
              ))}
            </div>
          )}

          {currentStep === 5 && (
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Duration in hours" type="number" min="1" value={form.durationHours} onChange={update('durationHours')} />
                <Input label="Number of event days" type="number" min="1" value={form.eventDays} onChange={update('eventDays')} />
                <Input label="Lighting needs" value={form.lightingNeeds} onChange={update('lightingNeeds')} />
                <Input label="Sound needs" value={form.soundNeeds} onChange={update('soundNeeds')} />
                <Input label="Catering needs" value={form.cateringNeeds} onChange={update('cateringNeeds')} />
                <Input label="Decoration needs" value={form.decorationNeeds} onChange={update('decorationNeeds')} />
                <Input label="Photography / videography" value={form.photographyNeeds} onChange={update('photographyNeeds')} />
                <Input label="Security needs" value={form.securityNeeds} onChange={update('securityNeeds')} />
                <Input label="Transportation needs" value={form.transportationNeeds} onChange={update('transportationNeeds')} />
                <Input label="Equipment rental needs" value={form.equipmentRentalNeeds} onChange={update('equipmentRentalNeeds')} />
                <Input label="Special requirements" value={form.specialRequirements} onChange={update('specialRequirements')} />
                <Input label="Notes for vendors" value={form.vendorNotes} onChange={update('vendorNotes')} />
              </div>
              <PlaceholderMedia
                title="Requirements"
                subtitle={`${recommendedServices.length} vendor services selected for the marketplace.`}
                tone="rose"
                icon={<CheckCircle2 className="h-5 w-5" />}
              />
            </div>
          )}

          {currentStep === 6 && (
            <EventReviewPanel form={form} eventTypeMeta={eventTypeMeta} recommendedServices={recommendedServices} />
          )}
        </div>
      </div>
    )
  }, [currentStep, form, errors, submitted, submitting, eventTypeMeta, recommendedServices, progress, onSelectEventType, onToggleService, onUpdateForm, update])

  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeader
          title="Plan an Event"
          subtitle="Build a complete event brief before sending vendor requirements."
        />

        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-navy-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'create' && (
          <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
            <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                <PlaceholderMedia
                  title="Event setup"
                  subtitle="Start from one of the live planning templates or build a fresh brief."
                  tone="indigo"
                  icon={<Sparkles className="h-5 w-5" />}
                  compact
                />
                <EventSetupSteps currentStep={currentStep} />
              </aside>

              <div className="space-y-5">
                {!submitted && (
                  <EventBuilderHeader
                    currentStep={currentStep}
                    progress={progress}
                    eventTypeMeta={eventTypeMeta}
                    recommendedServicesCount={recommendedServices.length}
                    theme={form.theme}
                  />
                )}

                {renderStepContent}

                {!submitted && (
                  <EventBuilderNavigation
                    currentStep={currentStep}
                    submitting={submitting}
                    isLastStep={currentStep === 6}
                    onBack={onGoBack}
                    onNext={onGoNext}
                    onSubmit={onSubmit}
                  />
                )}

                {submitted && (
                  <EventBuilderNavigation
                    currentStep={currentStep}
                    submitting={submitting}
                    isLastStep={true}
                    onBack={onGoBack}
                    onNext={onGoNext}
                    onSubmit={onSubmit}
                    submitted={true}
                    onContinueToProcurement={onContinueToProcurement}
                    onCreateAnother={onReset}
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'drafts' && (
          <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
            <DraftEventsTab
              onContinue={(id) => { setActiveTab('create'); onReset() }}
              onEdit={(id) => { setActiveTab('create') }}
              onDelete={(id) => {}}
            />
          </section>
        )}

        {activeTab === 'completed' && (
          <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
            <CompletedEventBriefsTab
              onViewMarketplace={(eventId) => navigate(`/organizer/vendor-marketplace?eventId=${eventId}`)}
            />
          </section>
        )}
      </div>
    </DashboardShell>
  )
}
