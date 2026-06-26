import { useMemo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Sparkles, MapPin, CalendarDays, Palette, FileEdit, Archive } from 'lucide-react'
import { DashboardShell } from '../../../../shared/components/DashboardShell'
import { OrganizerPage, OrganizerPageHeader } from '../../../../shared/components/OrganizerUI'
import { Input } from '../../../../shared/components/Input'
import { Select } from '../../../../shared/components/Select'
import { PlaceholderMedia } from '../../../../shared/components/PlaceholderMedia'
import { EventSetupSteps } from '../components/EventSetupSteps'
import { EventBuilderHeader } from '../components/EventBuilderHeader'
import { EventTypeGrid } from '../components/EventTypeGrid'
import { EventBuilderNavigation } from '../components/EventBuilderNavigation'
import { EventReviewPanel } from '../components/EventReviewPanel'
import { VenueSuggestionGrid } from '../components/VenueSuggestionGrid'
import { VendorServiceGrid } from '../components/VendorServiceGrid'
import { DraftEventsTab } from '../components/DraftEventsTab'
import { CompletedEventBriefsTab } from '../components/CompletedEventBriefsTab'
import type { PlanEventFormState, EventTypeOption, EventTypeId } from '../models/planEvent.model'
import {
  EVENT_TYPE_OPTIONS,
  COLOR_PALETTES,
  EVENT_MOODS,
  SETUP_MODES,
  SEATING_OPTIONS,
  STAGE_OPTIONS,
  BOOTH_OPTIONS
} from '../models/planEvent.model'
import { PLAN_EVENT_PREVIEW_VISUALS } from '../models/planEventVisuals'

type PlanTab = 'create' | 'drafts' | 'completed'

interface OrganizerPlanEventViewProps {
  currentStep: number
  form: PlanEventFormState
  drafts: Array<{
    id: string
    title: string
    eventType: string
    venue: string
    eventDate: string
    guests: string
    budget: string
    progress: number
    lastSaved: string
  }>
  completedBriefs: Array<{
    id: string
    title: string
    eventType: string
    status: string
    venue: string
    eventDate: string
    guests: number
    budget: number
    servicesRequested: number
    servicesConfirmed: number
    completedAt: string
  }>
  loading: boolean
  error: string | null
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
  onContinueDraft: (id: string) => void
  onEditDraft: (id: string) => void
  onDeleteDraft: (id: string) => void
}

export function OrganizerPlanEventView({
  currentStep,
  form,
  drafts,
  completedBriefs,
  loading,
  error,
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
  onContinueToProcurement,
  onContinueDraft,
  onEditDraft,
  onDeleteDraft
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

  const renderStepContent = useMemo(() => {
    if (submitted) {
      return (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-600 p-2 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Event saved</p>
                <h3 className="text-xl font-semibold text-emerald-950">Your event plan is ready for the marketplace</h3>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm text-emerald-900/80">
              The core event has been created and matched against the selected vendor services. Use the Vendor Marketplace next to send booking requests.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">Type: {eventTypeMeta.label}</span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">Guests: {form.guests}</span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">Budget: ${Number(form.budget || 0).toLocaleString()}</span>
            </div>
          </div>
          <PlaceholderMedia
            title={PLAN_EVENT_PREVIEW_VISUALS.submitted.title}
            subtitle={PLAN_EVENT_PREVIEW_VISUALS.submitted.subtitle}
            imageUrl={PLAN_EVENT_PREVIEW_VISUALS.submitted.imageUrl}
            imageAlt={PLAN_EVENT_PREVIEW_VISUALS.submitted.imageAlt}
            tone="emerald"
            icon={<Sparkles className="h-5 w-5" />}
            compact
            chips={[
              `Type: ${eventTypeMeta.label}`,
              `Guests: ${form.guests}`,
              `Budget: $${Number(form.budget || 0).toLocaleString()}`
            ]}
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
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-3">
                <Input
                  label="Venue or location"
                  value={form.venue}
                  onChange={update('venue')}
                  placeholder="Convention center, private estate, rooftop, expo hall..."
                  className="px-3 py-2"
                />
                <VenueSuggestionGrid selectedVenue={form.venue} onSelect={(place) => onUpdateForm('venue', place)} />
              </div>
              <PlaceholderMedia
                title={PLAN_EVENT_PREVIEW_VISUALS.venue.title}
                subtitle={PLAN_EVENT_PREVIEW_VISUALS.venue.subtitle}
                imageUrl={PLAN_EVENT_PREVIEW_VISUALS.venue.imageUrl}
                imageAlt={PLAN_EVENT_PREVIEW_VISUALS.venue.imageAlt}
                tone="amber"
                icon={<MapPin className="h-5 w-5" />}
                compact
                chips={[`Venue: ${form.venue}`, 'Arrival flow', 'Load-in ready']}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="grid gap-3">
                <Input label="Event name" value={form.title} onChange={update('title')} placeholder="e.g. Horizon Capital Annual Summit" className="px-3 py-2" />
                <Input label="Event description" value={form.description} onChange={update('description')} placeholder="One sentence describing the occasion, audience, and purpose." className="px-3 py-2" />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input label="Guest count" type="number" min="1" value={form.guests} onChange={update('guests')} className="px-3 py-2" />
                  <Input label="Budget range" type="number" min="0" step="500" value={form.budget} onChange={update('budget')} className="px-3 py-2" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input label="Event date" type="date" value={form.eventDate} onChange={update('eventDate')} className="px-3 py-2" />
                  <Input label="Event time" type="time" value={form.eventTime} onChange={update('eventTime')} className="px-3 py-2" />
                </div>
              </div>
              <PlaceholderMedia
                title={PLAN_EVENT_PREVIEW_VISUALS.details.title}
                subtitle={PLAN_EVENT_PREVIEW_VISUALS.details.subtitle}
                imageUrl={PLAN_EVENT_PREVIEW_VISUALS.details.imageUrl}
                imageAlt={PLAN_EVENT_PREVIEW_VISUALS.details.imageAlt}
                tone="slate"
                icon={<CalendarDays className="h-5 w-5" />}
                compact
                chips={[`Guests: ${form.guests}`, `Budget: $${Number(form.budget || 0).toLocaleString()}`, form.eventDate || 'Date pending']}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="grid gap-3 md:grid-cols-2">
                <Select label="Theme" value={form.theme} onChange={update('theme')} className="px-3 py-2" options={EVENT_TYPE_OPTIONS.map((option) => ({ value: option.defaultTheme, label: option.defaultTheme }))} />
                <Select label="Color palette" value={form.colorPalette} onChange={update('colorPalette')} className="px-3 py-2" options={COLOR_PALETTES.map((palette) => ({ value: palette, label: palette }))} />
                <Select label="Event mood" value={form.mood} onChange={update('mood')} className="px-3 py-2" options={EVENT_MOODS.map((mood) => ({ value: mood, label: mood }))} />
                <Select label="Setup mode" value={form.setupMode} onChange={update('setupMode')} className="px-3 py-2" options={SETUP_MODES.map((mode) => ({ value: mode, label: mode.charAt(0).toUpperCase() + mode.slice(1) }))} />
                <Select label="Seating arrangement" value={form.seating} onChange={update('seating')} className="px-3 py-2" options={SEATING_OPTIONS.map((item) => ({ value: item, label: item }))} />
                <Select label="Stage setup" value={form.stageSetup} onChange={update('stageSetup')} className="px-3 py-2" options={STAGE_OPTIONS.map((item) => ({ value: item, label: item }))} />
                <Select label="Booth setup" value={form.boothSetup} onChange={update('boothSetup')} className="px-3 py-2" options={BOOTH_OPTIONS.map((item) => ({ value: item, label: item }))} />
                <Input label="Number of event days" type="number" min="1" value={form.eventDays} onChange={update('eventDays')} className="px-3 py-2" />
              </div>
              <PlaceholderMedia
                title={PLAN_EVENT_PREVIEW_VISUALS.theme.title}
                subtitle={PLAN_EVENT_PREVIEW_VISUALS.theme.subtitle}
                imageUrl={PLAN_EVENT_PREVIEW_VISUALS.theme.imageUrl}
                imageAlt={PLAN_EVENT_PREVIEW_VISUALS.theme.imageAlt}
                tone="indigo"
                icon={<Palette className="h-5 w-5" />}
                compact
                chips={[form.theme, form.colorPalette, form.mood]}
              />
            </div>
          )}

          {currentStep === 4 && (
            <VendorServiceGrid selectedServices={form.selectedServices} onToggleService={onToggleService} />
          )}

          {currentStep === 5 && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Duration in hours" type="number" min="1" value={form.durationHours} onChange={update('durationHours')} className="px-3 py-2" />
                <Input label="Number of event days" type="number" min="1" value={form.eventDays} onChange={update('eventDays')} className="px-3 py-2" />
                <Input label="Lighting needs" value={form.lightingNeeds} onChange={update('lightingNeeds')} className="px-3 py-2" />
                <Input label="Sound needs" value={form.soundNeeds} onChange={update('soundNeeds')} className="px-3 py-2" />
                <Input label="Catering needs" value={form.cateringNeeds} onChange={update('cateringNeeds')} className="px-3 py-2" />
                <Input label="Decoration needs" value={form.decorationNeeds} onChange={update('decorationNeeds')} className="px-3 py-2" />
                <Input label="Photography / videography" value={form.photographyNeeds} onChange={update('photographyNeeds')} className="px-3 py-2" />
                <Input label="Security needs" value={form.securityNeeds} onChange={update('securityNeeds')} className="px-3 py-2" />
                <Input label="Transportation needs" value={form.transportationNeeds} onChange={update('transportationNeeds')} className="px-3 py-2" />
                <Input label="Equipment rental needs" value={form.equipmentRentalNeeds} onChange={update('equipmentRentalNeeds')} className="px-3 py-2" />
                <Input label="Special requirements" value={form.specialRequirements} onChange={update('specialRequirements')} className="px-3 py-2" />
                <Input label="Notes for vendors" value={form.vendorNotes} onChange={update('vendorNotes')} className="px-3 py-2" />
              </div>
              <PlaceholderMedia
                title={PLAN_EVENT_PREVIEW_VISUALS.budget.title}
                subtitle={PLAN_EVENT_PREVIEW_VISUALS.budget.subtitle}
                imageUrl={PLAN_EVENT_PREVIEW_VISUALS.budget.imageUrl}
                imageAlt={PLAN_EVENT_PREVIEW_VISUALS.budget.imageAlt}
                tone="rose"
                icon={<CheckCircle2 className="h-5 w-5" />}
                compact
                chips={[`Services: ${recommendedServices.length}`, `Guests: ${form.guests}`, `Budget: $${Number(form.budget || 0).toLocaleString()}`]}
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
      <OrganizerPage>
        <OrganizerPageHeader
          title="Plan an Event"
          description="Build a complete event brief through a guided setup before sending vendor requirements."
        />

        {loading && (
          <div className="mb-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
            Loading events...
          </div>
        )}
        {error && (
          <div className="mb-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        <div className="mb-2 flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'create' && (
          <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-5">
            <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
              <aside className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50/80 p-3.5">
                <PlaceholderMedia
                  title={PLAN_EVENT_PREVIEW_VISUALS.setupSidebar.title}
                  subtitle={PLAN_EVENT_PREVIEW_VISUALS.setupSidebar.subtitle}
                  imageUrl={PLAN_EVENT_PREVIEW_VISUALS.setupSidebar.imageUrl}
                  imageAlt={PLAN_EVENT_PREVIEW_VISUALS.setupSidebar.imageAlt}
                  tone="indigo"
                  icon={<Sparkles className="h-5 w-5" />}
                  compact
                />
                <EventSetupSteps currentStep={currentStep} />
              </aside>

              <div className="space-y-4">
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
                    onSaveDraft={onSaveDraft}
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
              drafts={drafts}
              onContinue={(id) => { setActiveTab('create'); onContinueDraft(id) }}
              onEdit={(id) => { setActiveTab('create'); onEditDraft(id) }}
              onDelete={onDeleteDraft}
            />
          </section>
        )}

        {activeTab === 'completed' && (
          <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
            <CompletedEventBriefsTab
              events={completedBriefs}
              onViewMarketplace={(eventId) => navigate(`/organizer/vendor-marketplace?eventId=${eventId}`)}
            />
          </section>
        )}
      </OrganizerPage>
    </DashboardShell>
  )
}
