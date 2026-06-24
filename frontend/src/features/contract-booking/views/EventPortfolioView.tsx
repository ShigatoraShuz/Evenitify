import { useEffect, useState } from 'react'
import { Building2, CalendarDays, FileText, Search, User as UserIcon } from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { SummaryCard } from '../../../shared/components/SummaryCard'
import { Modal } from '../../../shared/components/Modal'
import { Input } from '../../../shared/components/Input'
import { EmptyState } from '../../../shared/components/EmptyState'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { EmptyStateCard, OrganizerCard, OrganizerPage, OrganizerPageHeader, SectionHeader } from '../../../shared/components/OrganizerUI'
import { RealtimeIndicator } from '../../../shared/components/RealtimeIndicator'
import { AttachmentList, DocumentPreviewModal, UploadDocumentDropzone } from '../../../shared/components/DocumentComponents'
import { AuditTimeline } from '../../../shared/components/AuditTimeline'
import { EventCalendarPreview, EventTimelineBoard, TimelineMilestoneCard } from '../../../shared/components/EventPlanningComponents'
import { BudgetBreakdownChart, BudgetOverviewCard, BudgetWarningBanner } from '../../../shared/components/BudgetComponents'
import { BookingMessageThread } from '../../../shared/components/CommunicationComponents'
import { ContractTimeline, buildContractTimeline } from '../components/ContractTimeline'
import type { BookingWithDetails, EventPortfolio, EventRequirement } from '../../../services/eventService'
import type { ContractDetail } from '../../../services/contractService'
import type { AuditActivity } from '../../../services/auditService'
import type { DocumentMetadata } from '../../../services/documentService'
import type { RealtimeSnapshot } from '../../../services/realtimeService'
import type { EventPlanningTimeline } from '../../../services/planningService'
import type { BudgetSummary } from '../../../services/budgetService'
import type { BookingMessage } from '../../../services/communicationService'
import type { PortfolioTab } from '../viewmodels/useEventPortfolio'
import { useNavigate } from 'react-router-dom'

interface VendorInfo {
  vendorId: string
  business_name: string
  rating: number
}

interface ContractItem {
  id: string
  bookingId: string
  contract_status: string
  sent_at: string | null
  signed_at: string | null
  vendorName: string
  category: string
}

interface ActivityItem {
  id: string
  booking_id: string
  previous_status: string | null
  new_status: string
  reason: string | null
  created_at: string
  vendorName: string
  category: string
}

interface EventPortfolioViewProps {
  eventId: string | null
  portfolio: EventPortfolio | null
  loading: boolean
  submitting: boolean
  contractLoading: boolean
  error: string | null
  userRole: string | null
  detailedContract: ContractDetail | null
  expandedBookingId: string | null
  activeTab: PortfolioTab
  vendors: VendorInfo[]
  contracts: ContractItem[]
  activity: ActivityItem[]
  documents: DocumentMetadata[]
  auditActivities: AuditActivity[]
  planningTimeline: EventPlanningTimeline | null
  budgetSummary: BudgetSummary | null
  bookingMessages: Record<string, BookingMessage[]>
  realtimeSnapshot: RealtimeSnapshot | null
  realtimeRefreshing: boolean
  onLoadPortfolio: (eventId: string) => Promise<void>
  onRefreshRealtime: () => Promise<void>
  onSetActiveTab: (tab: PortfolioTab) => void
  onExpandBooking: (bookingId: string) => Promise<void>
  onCreateContract: (bookingId: string, termsSummary?: string) => Promise<void>
  onSendContract: (contractId: string) => Promise<void>
  onSignOrganizer: (contractId: string) => Promise<void>
  onSignVendor: (contractId: string) => Promise<void>
  onUploadDocument: (file: File) => Promise<void>
  onClearError: () => void
}

const TABS: { key: PortfolioTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'budget', label: 'Budget' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'vendors', label: 'Vendors' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'contracts', label: 'Contracts' },
  { key: 'documents', label: 'Documents' },
  { key: 'activity', label: 'Activity' }
]

export function EventPortfolioView({
  eventId,
  portfolio,
  loading,
  submitting,
  contractLoading,
  error,
  userRole,
  detailedContract,
  expandedBookingId,
  activeTab,
  vendors,
  contracts,
  activity,
  documents,
  auditActivities,
  planningTimeline,
  budgetSummary,
  bookingMessages,
  realtimeSnapshot,
  realtimeRefreshing,
  onLoadPortfolio,
  onRefreshRealtime,
  onSetActiveTab,
  onExpandBooking,
  onCreateContract,
  onSendContract,
  onSignOrganizer,
  onSignVendor,
  onUploadDocument,
  onClearError
}: EventPortfolioViewProps) {
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createBookingId, setCreateBookingId] = useState<string | null>(null)
  const [termsSummary, setTermsSummary] = useState('')
  const [previewDocument, setPreviewDocument] = useState<DocumentMetadata | null>(null)

  useEffect(() => {
    if (eventId) onLoadPortfolio(eventId)
  }, [eventId])

  if (loading) {
    return (
      <DashboardShell>
        <OrganizerPage>
          <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        </OrganizerPage>
      </DashboardShell>
    )
  }

  if (!portfolio) {
    return (
      <DashboardShell>
        <OrganizerPage>
          <OrganizerPageHeader
            title="Event Portfolio"
            description="Review event overview, vendor lineup, budget, schedule, booking status, documents, and contracts."
          />
          <OrganizerCard>
            <SectionHeader title="Choose an Event" description="Portfolio details are loaded from a selected backend event." />
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <EmptyStateCard
                title="No event selected"
                description="Open a completed event brief or create a new event to build a portfolio."
                icon={Search}
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button onClick={() => navigate('/organizer/plan-event')}>Choose Event</Button>
                    <Button variant="secondary" onClick={() => navigate('/organizer/plan-event')}>Create Event</Button>
                  </div>
                }
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { title: 'Event Overview', text: 'Venue, date, guests, and planning status.', icon: CalendarDays },
                  { title: 'Vendor Lineup', text: 'Confirmed vendors and service categories.', icon: Building2 },
                  { title: 'Budget Summary', text: 'Estimated spend and category utilization.', icon: FileText },
                  { title: 'Documents / Contracts', text: 'Attachments, contracts, and signing status.', icon: FileText },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <Icon className="h-5 w-5 text-brand-600" />
                      <h3 className="mt-3 text-sm font-semibold text-slate-950">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{item.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </OrganizerCard>
        </OrganizerPage>
      </DashboardShell>
    )
  }

  const { event, requirements, bookings } = portfolio

  const reqStats = {
    total: requirements?.length || 0,
    open: requirements?.filter((r: EventRequirement) => r.requirement_status === 'open').length || 0,
    fulfilled: requirements?.filter((r: EventRequirement) => r.requirement_status === 'fulfilled').length || 0
  }

  const bkStats = {
    total: bookings?.length || 0,
    pending: bookings?.filter((b: BookingWithDetails) => b.status === 'pending').length || 0,
    accepted: bookings?.filter((b: BookingWithDetails) => b.status === 'accepted').length || 0,
    confirmed: bookings?.filter((b: BookingWithDetails) => b.status === 'confirmed').length || 0,
    completed: bookings?.filter((b: BookingWithDetails) => b.status === 'completed').length || 0,
    cancelled: bookings?.filter((b: BookingWithDetails) => b.status === 'cancelled').length || 0
  }

  const completionPct = reqStats.total > 0 ? Math.round((reqStats.fulfilled / reqStats.total) * 100) : 0
  const totalBudget = Number(event.budget) || 0
  const usedBudget = bookings?.reduce((sum: number, b: BookingWithDetails) => sum + (Number(b.requested_budget) || 0), 0) || 0
  const budgetPct = totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0

  const getBookingTypeBadge = (booking: BookingWithDetails) => {
    const isPersonal = booking.booking_type === 'PERSONAL'
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        isPersonal
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-blue-50 text-blue-700 border border-blue-200'
      }`}>
        {isPersonal ? <UserIcon className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
        {isPersonal ? 'Personal' : 'Large Event'}
      </span>
    )
  }

  return (
    <DashboardShell>
      <OrganizerPage>
      <OrganizerPageHeader
        title="Event Portfolio"
        description={`${event.title} - ${event.venue} - ${new Date(event.event_date).toLocaleDateString()} - ${event.expected_guests} guests`}
      />
      <div>
        <RealtimeIndicator snapshot={realtimeSnapshot} refreshing={realtimeRefreshing} onRefresh={onRefreshRealtime} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={onClearError} className="text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}

      <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onSetActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 cursor-pointer ${
              activeTab === tab.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-350'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <SummaryCard value={`${completionPct}%`} label="Requirements Complete" color="text-emerald-600" sub={`${reqStats.fulfilled}/${reqStats.total}`} />
            <SummaryCard value={vendors.length} label="Vendors Engaged" color="text-blue-600" />
            <SummaryCard value={`${budgetPct}%`} label="Budget Used" color={budgetPct > 80 ? 'text-red-600' : 'text-indigo-600'} sub={`$${usedBudget.toLocaleString()}/$${totalBudget.toLocaleString()}`} />
            <SummaryCard value={bookings?.length || 0} label="Total Bookings" color="text-slate-900" sub={`${bkStats.pending} pending`} />
          </div>

          {budgetPct > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Budget Utilization</span>
                <span>{budgetPct}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${budgetPct > 80 ? 'bg-red-500' : budgetPct > 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(budgetPct, 100)}%` }}
                />
              </div>
            </div>
          )}

          {activity.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {activity.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-brand-500 shrink-0" />
                    <div>
                      <p className="text-slate-700">
                        <span className="font-medium">{item.vendorName || 'Unknown'}</span>
                        {' '}{item.category && `(${item.category})`}{' '}
                        changed to <StatusBadge status={item.new_status} size="sm" />
                      </p>
                      <p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activity.length === 0 && (
            <EmptyState title="No activity yet" description="Activity will appear as bookings and contracts progress" />
          )}
        </div>
      )}

      {activeTab === 'requirements' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <SummaryCard value={reqStats.total} label="Total" color="text-slate-900" />
            <SummaryCard value={reqStats.open} label="Open" color="text-yellow-600" />
            <SummaryCard value={reqStats.fulfilled} label="Fulfilled" color="text-emerald-600" />
          </div>

          {requirements?.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 mb-8">
              {requirements.map((req: EventRequirement) => (
                <div key={req.id} className="bg-white rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-slate-900">{req.category}</h3>
                    <StatusBadge status={req.requirement_status} size="sm" />
                  </div>
                  <p className="text-sm text-slate-500">Qty: {req.quantity}</p>
                  {req.min_budget && <p className="text-sm text-slate-500">Min: ${Number(req.min_budget).toLocaleString()}</p>}
                  {req.max_budget && <p className="text-sm text-slate-500">Max: ${Number(req.max_budget).toLocaleString()}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No requirements" description="No requirements defined yet." />
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {planningTimeline?.nextDeadline && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Next deadline</p>
              <div className="mt-3">
                <TimelineMilestoneCard milestone={planningTimeline.nextDeadline} />
              </div>
            </div>
          )}
          <EventCalendarPreview days={planningTimeline?.calendarDays || []} />
          <EventTimelineBoard milestones={planningTimeline?.milestones || []} />
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="space-y-4">
          {budgetSummary ? (
            <>
              <BudgetWarningBanner summary={budgetSummary} />
              <BudgetOverviewCard summary={budgetSummary} />
              <BudgetBreakdownChart categories={budgetSummary.categoryBreakdown} />
            </>
          ) : (
            <EmptyState title="Budget center unavailable" description="Budget details will appear after the event portfolio loads." />
          )}
        </div>
      )}

      {activeTab === 'vendors' && (
        <div>
          {vendors.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {vendors.map((v) => (
                <div key={v.vendorId} className="bg-white rounded-xl border border-slate-200 p-4">
                  <h3 className="font-medium text-slate-900">{v.business_name}</h3>
                  <p className="text-sm text-yellow-600">Rating: {v.rating || 'N/A'}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No vendors" description="Vendors will appear once bookings are created." />
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <SummaryCard value={bkStats.total} label="Total" color="text-slate-900" />
            <SummaryCard value={bkStats.pending} label="Pending" color="text-yellow-600" />
            <SummaryCard value={bkStats.accepted} label="Accepted" color="text-cyan-600" />
            <SummaryCard value={bkStats.confirmed} label="Confirmed" color="text-blue-600" />
            <SummaryCard value={bkStats.completed} label="Completed" color="text-emerald-600" />
            <SummaryCard value={bkStats.cancelled} label="Cancelled" color="text-red-600" />
          </div>

          {bookings?.length > 0 ? (
            <div className="space-y-4 mb-8">
              {bookings.map((booking: BookingWithDetails) => {
                const isExpanded = expandedBookingId === booking.id
                const contract = isExpanded ? detailedContract : null
                const existingContract = booking.contracts?.[0]

                return (
                  <div key={booking.id} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-slate-900">{booking.vendor_profiles?.business_name}</span>
                        <span className="text-sm text-slate-500 ml-2">{booking.event_requirements?.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getBookingTypeBadge(booking)}
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>

                    {booking.requested_budget && (
                      <p className="text-sm text-slate-500 mb-2">Budget: ${Number(booking.requested_budget).toLocaleString()}</p>
                    )}

                    <div className="flex items-center gap-2">
                      {existingContract ? (
                        <Button variant="ghost" onClick={() => onExpandBooking(booking.id)}>
                          {isExpanded ? 'Hide Contract' : 'View Contract'}
                        </Button>
                      ) : (
                        (booking.status === 'accepted' || booking.status === 'confirmed') && userRole === 'organizer' && (
                          <Button onClick={() => { setCreateBookingId(booking.id); setShowCreateModal(true) }}>
                            Create Contract
                          </Button>
                        )
                      )}
                    </div>

                    {isExpanded && (
                      <div className="mt-4 border-t pt-4">
                        {contractLoading ? (
                          <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                        ) : contract ? (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-slate-900">
                                Contract {contract.contract_number ? `#${contract.contract_number}` : ''}
                              </h4>
                              <StatusBadge status={contract.contract_status} size="sm" />
                            </div>
                            {contract.terms_summary && (
                              <p className="text-sm text-slate-600 mb-3">{contract.terms_summary}</p>
                            )}
                            <ContractTimeline steps={buildContractTimeline(contract)} />
                            <div className="flex flex-wrap gap-2 mt-4">
                              {contract.contract_status === 'draft' && (
                                <Button onClick={() => onSendContract(contract.id)} loading={submitting}>Send Contract</Button>
                              )}
                              {contract.contract_status === 'sent' && userRole === 'organizer' && (
                                <Button onClick={() => onSignOrganizer(contract.id)} loading={submitting}>Sign as Organizer</Button>
                              )}
                              {contract.contract_status === 'organizer_signed' && userRole === 'vendor' && (
                                <Button onClick={() => onSignVendor(contract.id)} loading={submitting}>Sign as Vendor</Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-slate-500 mb-3">No contract found for this booking.</p>
                            {(booking.status === 'accepted' || booking.status === 'confirmed') && (
                              <Button onClick={() => { setCreateBookingId(booking.id); setShowCreateModal(true) }}>Create Contract</Button>
                            )}
                          </div>
                        )}
                        <div className="mt-4">
                          <BookingMessageThread messages={bookingMessages[booking.id] || []} />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState title="No bookings" description="Bookings will appear here after vendor procurement" />
          )}
        </div>
      )}

      {activeTab === 'contracts' && (
        <div>
          {contracts.length > 0 ? (
            <div className="space-y-3">
              {contracts.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{c.vendorName || 'Unknown Vendor'}</p>
                    <p className="text-sm text-slate-500">{c.category}</p>
                  </div>
                  <StatusBadge status={c.contract_status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No contracts" description="Contracts will appear once bookings are accepted." />
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          <UploadDocumentDropzone onUpload={onUploadDocument} />
          {documents.length > 0 ? (
            <AttachmentList documents={documents} onPreview={setPreviewDocument} />
          ) : (
            <EmptyState title="No documents" description="Upload a document to attach it to this event portfolio." />
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div>
          {activity.length > 0 ? (
            <div className="space-y-6">
              <AuditTimeline activities={auditActivities} emptyText="No audit records for this event yet." />
              <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-brand-500 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">{item.vendorName || 'System'}</span>
                        <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Status changed from <span className="font-medium">{item.previous_status || 'none'}</span>
                        {' '}to <StatusBadge status={item.new_status} size="sm" />
                      </p>
                      {item.reason && <p className="text-xs text-slate-500 mt-1">Reason: {item.reason}</p>}
                      {item.category && <p className="text-xs text-slate-400 mt-1">Category: {item.category}</p>}
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          ) : (
            <AuditTimeline activities={auditActivities} emptyText="No activity will appear until bookings or contracts progress." />
          )}
        </div>
      )}

      <DocumentPreviewModal document={previewDocument} onClose={() => setPreviewDocument(null)} />

      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); setCreateBookingId(null) }} title="Create Contract">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Create a contract for this booking.</p>
          <Input
            label="Terms Summary (optional)"
            placeholder="Describe the contract terms..."
            value={termsSummary}
            onChange={(e) => setTermsSummary(e.target.value)}
          />
          <Button
            onClick={async () => {
              if (createBookingId) {
                await onCreateContract(createBookingId, termsSummary || undefined)
                await onExpandBooking(createBookingId)
                setShowCreateModal(false)
                setCreateBookingId(null)
                setTermsSummary('')
              }
            }}
            loading={submitting}
            fullWidth
          >
            Create Contract
          </Button>
        </div>
      </Modal>
      </OrganizerPage>
    </DashboardShell>
  )
}
