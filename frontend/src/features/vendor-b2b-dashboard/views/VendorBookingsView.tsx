import { useMemo, useState } from 'react'
import { CalendarDays, Music4, Camera, ShieldCheck, Truck, LayoutPanelTop, Mail, Wallet } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EmptyState } from '../../../shared/components/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { ContractTimeline, buildContractTimeline } from '../../contract-booking/components/ContractTimeline'
import { RealtimeIndicator } from '../../../shared/components/RealtimeIndicator'
import { AuditTimeline } from '../../../shared/components/AuditTimeline'
import { BookingMessageThread } from '../../../shared/components/CommunicationComponents'
import { Modal } from '../../../shared/components/Modal'
import { B2B_TABS, REQUEST_TYPE_TABS, type RequestType } from '../models/vendor-b2b-dashboard.model'
import type { BookingRequest } from '../../../services/bookingService'
import type { ContractDetail } from '../../../services/contractService'
import type { AuditActivity } from '../../../services/auditService'
import type { RealtimeSnapshot } from '../../../services/realtimeService'
import type { BookingMessage } from '../../../services/communicationService'

interface VendorBookingsViewProps {
  bookings: BookingRequest[]
  selectedBooking: BookingRequest | null
  activeTab: string
  activeTypeTab: RequestType
  loading: boolean
  submitting: boolean
  error: string | null
  contract: ContractDetail | null
  contractLoading: boolean
  auditActivities: AuditActivity[]
  bookingMessages: BookingMessage[]
  realtimeSnapshot: RealtimeSnapshot | null
  realtimeRefreshing: boolean
  onRefreshRealtime: () => Promise<void>
  onLoadBookings: (status?: string) => Promise<void>
  onSetTab: (tab: string) => void
  onSetTypeTab: (tab: RequestType) => void
  onSelectBooking: (bookingId: string) => Promise<void>
  onUpdateStatus: (bookingId: string, status: 'accepted' | 'rejected' | 'changes_requested', reason?: string) => Promise<void>
  onClearError: () => void
  onLoadContract: (bookingId: string) => Promise<void>
  onSignVendorContract: (contractId: string) => Promise<void>
  onSendBookingMessage: (body: string) => Promise<void>
  userRole?: string | null
}

interface RequestCard {
  title: string
  organizer: string
  budget: number | null
  eventDate: string
  venue: string
  guests: number
  category: string
  requestedServices: Array<{
    id: string
    serviceName: string
    category: string | null
  }>
  booking: BookingRequest
}

interface BookingRequestVendorMeta {
  id?: string
  status?: string
  request_message?: string | null
  budget_min?: number | null
  budget_max?: number | null
  deadline?: string | null
  viewed_at?: string | null
  accepted_at?: string | null
  rejected_at?: string | null
  changes_requested_at?: string | null
  responded_at?: string | null
}

interface ParsedNoteField {
  rawLabel: string
  value: string
}

interface OrganizerBriefField {
  label: string
  value: string
  wide: boolean
}

interface OrganizerBriefSection {
  title: string
  subtitle: string
  fields: OrganizerBriefField[]
}

const ORGANIZER_NOTE_LABEL_ALIASES: Record<string, string> = {
  setup: 'Setup mode',
  'setup mode': 'Setup mode',
  schedule: 'Schedule',
  'event type': 'Event type',
  type: 'Event type',
  description: 'Description',
  theme: 'Theme',
  'color palette': 'Color palette',
  mood: 'Mood',
  'event date': 'Event date',
  'event time': 'Event time',
  duration: 'Duration',
  days: 'Days',
  seating: 'Seating',
  'stage setup': 'Stage setup',
  'booth setup': 'Booth setup',
  services: 'Services',
  'selected services': 'Services',
  'services requested': 'Services',
  'service focus': 'Service focus',
  'catering needs': 'Catering needs',
  'lighting needs': 'Lighting needs',
  'sound needs': 'Sound needs',
  'decoration needs': 'Decoration needs',
  'photography needs': 'Photography needs',
  'photography / videography': 'Photography needs',
  'photo/video': 'Photography needs',
  'security needs': 'Security needs',
  'transportation needs': 'Transportation needs',
  'equipment rental needs': 'Equipment rental needs',
  'special requirements': 'Special requirements',
  'vendor notes': 'Vendor notes',
  notes: 'Vendor notes',
  'notes for vendors': 'Vendor notes',
}

const ORGANIZER_BRIEF_SECTION_DEFS: Array<{
  title: string
  subtitle: string
  labels: string[]
  wideLabels?: string[]
}> = [
  {
    title: 'Core Brief',
    subtitle: 'Organizer choices',
    labels: ['Event type', 'Description', 'Theme', 'Color palette', 'Mood'],
    wideLabels: ['Description']
  },
  {
    title: 'Timing & Setup',
    subtitle: 'Schedule and layout',
    labels: ['Setup mode', 'Event date', 'Event time', 'Duration', 'Days', 'Schedule'],
    wideLabels: ['Schedule']
  },
  {
    title: 'Production Needs',
    subtitle: 'Venue and technical setup',
    labels: [
      'Seating',
      'Stage setup',
      'Booth setup',
      'Lighting needs',
      'Sound needs',
      'Decoration needs',
      'Photography needs',
      'Security needs',
      'Transportation needs',
      'Equipment rental needs'
    ],
    wideLabels: ['Seating']
  },
  {
    title: 'Vendor Brief',
    subtitle: 'Selected services and constraints',
    labels: ['Services', 'Service focus', 'Catering needs', 'Special requirements', 'Vendor notes'],
    wideLabels: ['Services', 'Special requirements', 'Vendor notes']
  }
]

function normalizeOrganizerNoteLabel(label: string) {
  const compact = label.trim().replace(/\s+/g, ' ')
  const normalized = compact.toLowerCase()
  return ORGANIZER_NOTE_LABEL_ALIASES[normalized] || compact
}

const bookingIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Catering: CalendarDays,
  'Lights and sounds': Music4,
  Photography: Camera,
  Security: ShieldCheck,
  Transportation: Truck,
  'Stage production': LayoutPanelTop
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatMoney(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return 'N/A'
  return `$${Number(value).toLocaleString()}`
}

function formatDeadline(value?: string | null) {
  if (!value) return 'Not set'
  return formatDate(value)
}

function formatBudgetRange(meta: BookingRequestVendorMeta | null, requestedBudget: number | null) {
  if (meta?.budget_min != null && meta?.budget_max != null) {
    if (meta.budget_min === meta.budget_max) return formatMoney(meta.budget_min)
    return `${formatMoney(meta.budget_min)} - ${formatMoney(meta.budget_max)}`
  }

  return formatMoney(requestedBudget)
}

function getRequestVendorMeta(booking: BookingRequest | null): BookingRequestVendorMeta | null {
  if (!booking?.request_vendors) return null
  return Array.isArray(booking.request_vendors) ? booking.request_vendors[0] || null : booking.request_vendors
}

function parseStructuredNotes(notes?: string | null): ParsedNoteField[] {
  if (!notes) return []

  return notes
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(':')
      if (separatorIndex <= 0) {
        return { rawLabel: 'Notes', value: line }
      }

      return {
        rawLabel: line.slice(0, separatorIndex).trim(),
        value: line.slice(separatorIndex + 1).trim() || 'Not provided',
      }
    })
}

function buildOrganizerBriefSections(fields: ParsedNoteField[]) {
  const lookup = new Map<string, ParsedNoteField>()

  fields.forEach((field) => {
    const normalizedLabel = normalizeOrganizerNoteLabel(field.rawLabel).toLowerCase()
    if (!lookup.has(normalizedLabel)) {
      lookup.set(normalizedLabel, field)
    }
  })

  const used = new Set<string>()

  const sections = ORGANIZER_BRIEF_SECTION_DEFS.map((section) => {
    const sectionFields = section.labels
      .map((label) => {
        const normalizedLabel = normalizeOrganizerNoteLabel(label)
        const field = lookup.get(normalizedLabel.toLowerCase())
        if (!field) return null

        used.add(normalizeOrganizerNoteLabel(field.rawLabel).toLowerCase())
        return {
          label: normalizedLabel,
          value: field.value,
          wide: section.wideLabels?.some((wideLabel) => normalizeOrganizerNoteLabel(wideLabel).toLowerCase() === normalizedLabel.toLowerCase()) ?? false,
        }
      })
      .filter(Boolean) as OrganizerBriefField[]

    return {
      ...section,
      fields: sectionFields,
    }
  }).filter((section) => section.fields.length > 0)

  const fallbackFields = fields
    .filter((field) => !used.has(normalizeOrganizerNoteLabel(field.rawLabel).toLowerCase()))
    .map((field) => ({
      label: normalizeOrganizerNoteLabel(field.rawLabel),
      value: field.value,
      wide: true,
    }))

  return { sections, fallbackFields }
}

function BookingChip({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 ${className}`}>
      <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-snug text-slate-900 break-words">{value}</p>
    </div>
  )
}

function DetailTile({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-white px-3 py-2.5 shadow-[0_6px_18px_rgba(15,23,42,0.03)] ${className}`}>
      <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap break-words">{value}</p>
    </div>
  )
}

export function VendorBookingsView({
  bookings,
  selectedBooking,
  activeTab,
  activeTypeTab,
  loading,
  submitting,
  error,
  contract,
  contractLoading,
  auditActivities,
  bookingMessages,
  realtimeSnapshot,
  realtimeRefreshing,
  onRefreshRealtime,
  onLoadBookings,
  onSetTab,
  onSetTypeTab,
  onSelectBooking,
  onUpdateStatus,
  onClearError,
  onLoadContract,
  onSignVendorContract,
  onSendBookingMessage,
  userRole,
}: VendorBookingsViewProps) {
  const [confirmDecline, setConfirmDecline] = useState<string | null>(null)
  const [negotiateOpen, setNegotiateOpen] = useState(false)
  const [negotiationReason, setNegotiationReason] = useState('')

  const requestCards = useMemo<RequestCard[]>(() => bookings.map((booking) => ({
    title: booking.large_events?.title || 'Organizer request',
    organizer: booking.organizer_profiles?.organization_name || 'Organizer',
    budget: booking.requested_budget,
    eventDate: booking.large_events?.event_date || booking.requested_at,
    venue: booking.large_events?.venue || 'Venue pending',
    guests: booking.large_events?.expected_guests || 0,
    category: booking.event_requirements?.category || booking.booking_type || 'Request',
    requestedServices: booking.requestedServices || [],
    booking
  })), [bookings])

  const handleDecline = async () => {
    if (confirmDecline) {
      await onUpdateStatus(confirmDecline, 'rejected')
      setConfirmDecline(null)
    }
  }

  const handleNegotiate = async () => {
    if (!selectedBooking) return
    const reason = negotiationReason.trim()
    if (!reason) return
    await onUpdateStatus(selectedBooking.id, 'changes_requested', reason)
    setNegotiateOpen(false)
    setNegotiationReason('')
  }

  const selectedCategory = selectedBooking?.event_requirements?.category || selectedBooking?.booking_type || 'Booking'
  const SelectedIcon = bookingIconMap[selectedCategory] ?? CalendarDays
  const selectedRequirement = selectedBooking?.event_requirements
  const selectedRequestVendor = getRequestVendorMeta(selectedBooking)
  const selectedRequirementFields = useMemo(() => parseStructuredNotes(selectedRequirement?.notes), [selectedRequirement?.notes])
  const organizerBrief = useMemo(() => buildOrganizerBriefSections(selectedRequirementFields), [selectedRequirementFields])
  const organizerMessage = selectedRequestVendor?.request_message || selectedBooking?.notes || ''

  return (
    <DashboardShell>
      <ConfirmDialog
        open={!!confirmDecline}
        title="Decline booking request"
        message="Declining will remove this request from the active response queue."
        confirmLabel="Decline"
        variant="danger"
        loading={submitting}
        onConfirm={handleDecline}
        onCancel={() => setConfirmDecline(null)}
      />

      <Modal
        open={negotiateOpen}
        onClose={() => {
          setNegotiateOpen(false)
          setNegotiationReason('')
        }}
        title="Request negotiation"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Add a short message describing what you want to negotiate. This will be sent to the organizer and saved in the request record.
          </p>
          <textarea
            value={negotiationReason}
            onChange={(e) => setNegotiationReason(e.target.value)}
            placeholder="Example: Can we reduce the budget slightly or adjust the service scope?"
            className="min-h-32 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => {
              setNegotiateOpen(false)
              setNegotiationReason('')
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleNegotiate()}
              loading={submitting}
              disabled={!negotiationReason.trim()}
            >
              Send Request
            </Button>
          </div>
        </div>
      </Modal>

      <div className="space-y-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            title="Bookings & Requests"
            subtitle="Manage your incoming B2B requests and confirmed event contracts."
          />
          <RealtimeIndicator
            snapshot={realtimeSnapshot}
            refreshing={realtimeRefreshing || loading}
            onRefresh={() => {
              void onRefreshRealtime()
              void onLoadBookings(activeTab === 'all' ? undefined : activeTab)
            }}
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center justify-between gap-3">
            <span>{error}</span>
            <button type="button" onClick={onClearError} className="text-rose-500 hover:text-rose-700">Dismiss</button>
          </div>
        )}

        <div className="mt-4 flex gap-6 overflow-x-auto border-b border-slate-100 pb-px">
          {B2B_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSetTab(tab.key)}
              className={`whitespace-nowrap pb-4 text-sm font-semibold transition-all relative ${
                activeTab === tab.key
                  ? 'text-brand-600'
                  : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Request Type
          </span>
          <div className="flex flex-wrap gap-2">
            {REQUEST_TYPE_TABS.map((tab) => {
              const isActive = activeTypeTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onSetTypeTab(tab.key)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-start">
          <section className="flex flex-col gap-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-[20px] bg-slate-100" />
                ))}
              </div>
            ) : requestCards.length === 0 ? (
              <EmptyState
                title="No B2B bookings"
                description="Organizer booking requests will appear here when procurement starts."
              />
            ) : (
              <div className="grid gap-3">
                {requestCards.map((card) => {
                  const isSelected = selectedBooking?.id === card.booking.id
                  const services = card.requestedServices.slice(0, 3)

                  return (
                    <button
                      key={card.booking.id}
                      type="button"
                      onClick={() => onSelectBooking(card.booking.id)}
                      className={`group w-full overflow-hidden rounded-[20px] border text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 ${
                        isSelected
                          ? 'border-brand-300 bg-brand-50 shadow-md ring-4 ring-brand-500/10'
                          : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className={`text-base font-bold ${isSelected ? 'text-brand-900' : 'text-slate-900'}`}>
                                {card.title}
                              </h3>
                              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                {card.category}
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-medium text-slate-500">{card.organizer}</p>
                          </div>
                          <StatusBadge status={card.booking.status} size="sm" />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <BookingChip label="Date" value={formatDate(card.eventDate)} />
                          <BookingChip label="Budget" value={card.budget != null ? formatMoney(card.budget) : 'N/A'} />
                          <BookingChip label="Venue" value={card.venue} />
                          <BookingChip label="Guests" value={card.guests ? card.guests.toLocaleString() : 'N/A'} />
                        </div>

                        {services.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {services.map((service) => (
                              <span
                                key={service.id}
                                className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700"
                              >
                                {service.serviceName}
                              </span>
                            ))}
                            {card.requestedServices.length > services.length && (
                              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                                +{card.requestedServices.length - services.length} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                          <span className="font-medium">Open request</span>
                          <span className="text-slate-400 group-hover:text-brand-500">View details</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          <section className="rounded-[24px] border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100vh-8rem)] lg:flex-col lg:overflow-hidden">
            {selectedBooking ? (
              <>
                <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-600">
                          <SelectedIcon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-xl font-bold tracking-tight text-slate-900">
                            {selectedBooking.large_events?.title || 'Event'}
                          </h3>
                          <p className="truncate text-sm font-medium text-slate-500">
                            {selectedBooking.organizer_profiles?.organization_name || 'Organizer'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600">
                          {selectedCategory}
                        </span>
                        {selectedRequestVendor?.deadline && (
                          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                            Due {formatDeadline(selectedRequestVendor.deadline)}
                          </span>
                        )}
                        <StatusBadge status={selectedBooking.status} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
                  <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="font-bold text-slate-900">Request Snapshot</h4>
                      <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                        {selectedRequirement?.quantity ? `${selectedRequirement.quantity} needed` : 'Booking overview'}
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      <BookingChip label="Service required" value={selectedCategory} />
                      <BookingChip
                        label="Event date"
                        value={selectedBooking.large_events?.event_date ? formatDate(selectedBooking.large_events.event_date) : 'N/A'}
                      />
                      <BookingChip label="Venue" value={selectedBooking.large_events?.venue || 'N/A'} />
                      <BookingChip
                        label="Guests"
                        value={selectedBooking.large_events?.expected_guests ? selectedBooking.large_events.expected_guests.toLocaleString() : 'N/A'}
                      />
                      <BookingChip label="Budget" value={formatBudgetRange(selectedRequestVendor, selectedBooking.requested_budget)} />
                      <BookingChip label="Requirement status" value={selectedRequirement?.requirement_status || 'open'} />
                    </div>
                  </section>

                  {selectedBooking.requestedServices && selectedBooking.requestedServices.length > 0 && (
                    <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="font-bold text-slate-900">Requested Services</h4>
                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                          {selectedBooking.requestedServices.length} selected
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedBooking.requestedServices.map((service) => (
                          <span
                            key={service.id}
                            className="inline-flex items-center rounded-full border border-brand-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-700 shadow-sm"
                          >
                            {service.serviceName}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {(organizerBrief.sections.length > 0 || organizerBrief.fallbackFields.length > 0) && (
                    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.03)]">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="font-bold text-slate-900">Event Builder Summary</h4>
                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                          Organizer choices
                        </span>
                      </div>
                      <div className="space-y-4">
                        {organizerBrief.sections.map((section) => (
                          <div key={section.title} className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h5 className="text-sm font-semibold text-slate-900">{section.title}</h5>
                                <p className="text-xs text-slate-500">{section.subtitle}</p>
                              </div>
                              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                {section.fields.length} field{section.fields.length === 1 ? '' : 's'}
                              </span>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                              {section.fields.map((field) => (
                                <DetailTile
                                  key={`${section.title}-${field.label}`}
                                  label={field.label}
                                  value={field.value}
                                  className={field.wide ? 'sm:col-span-2 xl:col-span-3' : ''}
                                />
                              ))}
                            </div>
                          </div>
                        ))}

                        {organizerBrief.fallbackFields.length > 0 && (
                          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div>
                                <h5 className="text-sm font-semibold text-slate-900">Legacy / other notes</h5>
                                <p className="text-xs text-slate-500">Fields that were not part of the structured brief</p>
                              </div>
                              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                {organizerBrief.fallbackFields.length} field{organizerBrief.fallbackFields.length === 1 ? '' : 's'}
                              </span>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                              {organizerBrief.fallbackFields.map((field) => (
                                <DetailTile
                                  key={`legacy-${field.label}-${field.value.slice(0, 24)}`}
                                  label={field.label}
                                  value={field.value}
                                  className="sm:col-span-2 xl:col-span-3"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {organizerMessage && (
                    <section className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h4 className="font-bold text-slate-900">Organizer Message</h4>
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap break-words">
                        {organizerMessage}
                      </p>
                    </section>
                  )}

                  <section className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-bold text-slate-900">Contract Status</h4>
                      <Button variant="ghost" onClick={() => onLoadContract(selectedBooking.id)} className="px-0 text-brand-600 hover:text-brand-700">
                        {contract ? 'Refresh' : 'View contract'}
                      </Button>
                    </div>
                    <div className="mt-3">
                      {contractLoading ? (
                        <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                      ) : contract ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                            <p className="text-sm font-semibold text-slate-700">
                              {contract.contract_number ? `Ref: #${contract.contract_number}` : 'Standard Contract'}
                            </p>
                            <StatusBadge status={contract.contract_status} size="sm" />
                          </div>
                          {contract.terms_summary && <p className="text-sm leading-relaxed text-slate-600">{contract.terms_summary}</p>}
                          <div className="rounded-2xl border border-slate-100 bg-white p-4">
                            <ContractTimeline steps={buildContractTimeline(contract)} />
                          </div>
                          {contract.contract_status === 'organizer_signed' && (
                            <Button onClick={() => onSignVendorContract(contract.id)} loading={submitting} fullWidth>
                              Sign Contract
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="py-4 text-center">
                          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
                            <Mail className="h-5 w-5 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-900">No Contract Issued</p>
                          <p className="mt-1 text-sm text-slate-500">The organizer will prepare the contract once terms are agreed.</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <section className="rounded-2xl border border-slate-100 bg-white p-4">
                      <h4 className="mb-3 font-bold text-slate-900">Messages</h4>
                      <BookingMessageThread messages={bookingMessages} onSendMessage={onSendBookingMessage} userRole={userRole} />
                    </section>
                    <section className="rounded-2xl border border-slate-100 bg-white p-4">
                      <h4 className="mb-3 font-bold text-slate-900">Audit Trail</h4>
                      <AuditTimeline activities={auditActivities} emptyText="No activity recorded yet." />
                    </section>
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-white px-4 py-4 sm:px-5">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Button onClick={() => onUpdateStatus(selectedBooking.id, 'accepted')} loading={submitting} className="w-full">
                      Accept
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setNegotiateOpen(true)
                        setNegotiationReason('')
                      }}
                      loading={submitting}
                      className="w-full"
                    >
                      Negotiate
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setConfirmDecline(selectedBooking.id)}
                      loading={submitting}
                      className="w-full"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-10 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                  <Wallet className="h-7 w-7 text-brand-300" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">Select a Request</h3>
                <p className="max-w-sm text-slate-500">
                  Choose a booking from the queue to review organizer details, event-builder choices, contract status, and communication.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
