import type React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  FileSignature,
  FileText,
  Inbox,
  MapPin,
  MessageSquare,
  MessageSquare as MessageIcon,
  Plus,
  Send,
  ShoppingBag,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import { Button } from '../../../shared/components/Button'
import {
  EmptyStateCard,
  MetricCard,
  OrganizerCard,
  OrganizerPage,
  OrganizerPageHeader,
  SectionHeader,
} from '../../../shared/components/OrganizerUI'
import type {
  DashboardActivity,
  DashboardBooking,
  DashboardDraft,
  DashboardEventPreview,
  DashboardNotification,
  DashboardVendorRequest,
  RecommendedVendorPreview,
} from '../models/organizer-dashboard.model'
import { STATUS_COLORS_DASHBOARD, STATUS_LABELS_DASHBOARD } from '../models/organizer-dashboard.model'

interface SummaryStats {
  totalEvents: number
  draftEvents: number
  activeVendorRequests: number
  pendingResponses: number
  acceptedBookings: number
  confirmedBookings: number
}

interface VendorRequestCounts {
  sent: number
  pending: number
  accepted: number
  rejected: number
  confirmed: number
  contract_pending: number
}

interface Props {
  events: DashboardEventPreview[]
  drafts: DashboardDraft[]
  vendorRequests: DashboardVendorRequest[]
  bookings: DashboardBooking[]
  recommendedVendors: RecommendedVendorPreview[]
  activities: DashboardActivity[]
  notifications: DashboardNotification[]
  summaryStats: SummaryStats
  vendorRequestCounts: VendorRequestCounts
}

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  request_sent: Send,
  vendor_accepted: ThumbsUp,
  vendor_rejected: XCircle,
  new_message: MessageIcon,
  draft_updated: FileText,
  booking_confirmed: CheckCircle2,
  contract_pending: FileSignature,
}

const activityColors: Record<string, string> = {
  request_sent: 'bg-blue-50 text-blue-600 border-blue-100',
  vendor_accepted: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  vendor_rejected: 'bg-rose-50 text-rose-600 border-rose-100',
  new_message: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  draft_updated: 'bg-amber-50 text-amber-600 border-amber-100',
  booking_confirmed: 'bg-green-50 text-green-600 border-green-100',
  contract_pending: 'bg-violet-50 text-violet-600 border-violet-100',
}

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  response_review: Inbox,
  confirm_booking: CheckCircle2,
  unfinished_draft: FileText,
  contract_pending: FileSignature,
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatRelativeTime(date: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function OrganizerDashboardView({
  events,
  drafts,
  vendorRequests,
  bookings,
  recommendedVendors,
  activities,
  notifications,
  summaryStats,
  vendorRequestCounts,
}: Props) {
  const navigate = useNavigate()
  const pendingVendorReqs = vendorRequests.filter((request) => ['sent', 'pending', 'viewed', 'quoted', 'negotiating'].includes(request.status))

  return (
    <DashboardShell>
      <OrganizerPage>
        <OrganizerPageHeader
          title="Organizer Dashboard"
          description="Manage event plans, vendor requests, bookings, and marketplace progress from one command center."
          action={
            <>
              <Button onClick={() => navigate('/organizer/plan-event')}>
                <Plus className="mr-1.5 h-4 w-4" />
                Plan an Event
              </Button>
              <Button variant="secondary" onClick={() => navigate('/organizer/vendor-marketplace')}>
                <ShoppingBag className="mr-1.5 h-4 w-4" />
                View Marketplace
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <MetricCard label="Total Events" value={summaryStats.totalEvents} icon={Calendar} tone="blue" />
          <MetricCard label="Draft Events" value={summaryStats.draftEvents} icon={FileText} tone="amber" />
          <MetricCard label="Active Requests" value={summaryStats.activeVendorRequests} icon={Send} tone="indigo" />
          <MetricCard label="Pending Responses" value={summaryStats.pendingResponses} icon={Clock} tone="amber" />
          <MetricCard label="Accepted" value={summaryStats.acceptedBookings} icon={ThumbsUp} tone="emerald" />
          <MetricCard label="Confirmed" value={summaryStats.confirmedBookings} icon={CheckCircle2} tone="emerald" />
        </div>

        <OrganizerCard>
          <SectionHeader title="Quick Actions" description="Start the next high-value task without hunting through the app." />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              { label: 'Plan a New Event', icon: Plus, to: '/organizer/plan-event', className: 'bg-brand-600 text-white hover:bg-brand-700' },
              { label: 'Continue Draft', icon: FileText, to: '/organizer/plan-event', className: 'bg-amber-500 text-white hover:bg-amber-600' },
              { label: 'Browse Marketplace', icon: ShoppingBag, to: '/organizer/vendor-marketplace', className: 'bg-blue-500 text-white hover:bg-blue-600' },
              { label: 'Track Requests', icon: MessageSquare, to: '/organizer/vendor-status', className: 'bg-indigo-500 text-white hover:bg-indigo-600' },
              { label: 'Confirmed Bookings', icon: CalendarCheck, to: '/organizer/vendor-status', className: 'bg-emerald-500 text-white hover:bg-emerald-600' },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Button key={action.label} onClick={() => navigate(action.to)} className={`${action.className} h-auto justify-start rounded-2xl p-4 text-left text-sm font-semibold`}>
                  <Icon className="mb-2 h-5 w-5" />
                  {action.label}
                </Button>
              )
            })}
          </div>
        </OrganizerCard>

        <OrganizerCard>
          <SectionHeader
            title="Event Planning Summary"
            description="Live backend events and planning progress."
            action={<TextAction label="View All" onClick={() => navigate('/organizer/plan-event')} />}
          />
          {events.length === 0 ? (
            <EmptyStateCard title="No planned events yet" description="Create your first event brief to unlock vendor matching, tracking, bookings, and reports." icon={Calendar} action={<Button onClick={() => navigate('/organizer/plan-event')}>Create Event</Button>} />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {events.map((event) => (
                <OrganizerCard key={event.id} className="p-4" interactive>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-slate-950">{event.name}</h3>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-600">{event.status}</span>
                  </div>
                  <p className="text-xs text-slate-500">{event.eventType}</p>
                  <div className="my-3 h-1.5 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${event.progress}%` }} />
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    <InfoLine icon={Calendar} text={formatDate(event.date)} />
                    <InfoLine icon={MapPin} text={event.location} />
                    <InfoLine icon={Users} text={`${event.guestCount.toLocaleString()} guests`} />
                    <InfoLine icon={DollarSign} text={`$${event.budget.toLocaleString()}`} />
                  </div>
                  <Button variant="secondary" fullWidth className="mt-4" onClick={() => navigate(event.progress < 100 ? '/organizer/plan-event' : `/organizer/vendor-marketplace?eventId=${event.id}`)}>
                    {event.progress < 100 ? 'Continue' : 'View Event Brief'}
                  </Button>
                </OrganizerCard>
              ))}
            </div>
          )}
        </OrganizerCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <OrganizerCard>
            <SectionHeader title="Draft Events" description="Saved work that can be resumed any time." action={<TextAction label="View All Drafts" onClick={() => navigate('/organizer/plan-event')} />} />
            {drafts.length === 0 ? (
              <EmptyStateCard title="No draft events yet" description="Start planning an event and save your progress anytime." icon={FileText} action={<Button onClick={() => navigate('/organizer/plan-event')}>Create Event</Button>} />
            ) : (
              <div className="space-y-3">
                {drafts.map((draft) => (
                  <div key={draft.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-950">{draft.name}</h3>
                        <p className="text-xs text-slate-500">{draft.eventType} - Last edited {formatRelativeTime(draft.lastEdited)}</p>
                        <p className="mt-0.5 text-xs text-slate-400">Step: {draft.lastCompletedStep}</p>
                      </div>
                      <span className="text-xs font-semibold text-brand-700">{draft.progress}%</span>
                    </div>
                    <Button variant="secondary" className="mt-3" onClick={() => navigate('/organizer/plan-event')}>Continue Editing</Button>
                  </div>
                ))}
              </div>
            )}
          </OrganizerCard>

          <OrganizerCard>
            <SectionHeader title="Vendor Request Status" description="Response workflow across sent requests." />
            <div className="mb-4 flex flex-wrap gap-1.5">
              {[
                ['Pending', vendorRequestCounts.pending, 'bg-amber-100 text-amber-800'],
                ['Accepted', vendorRequestCounts.accepted, 'bg-emerald-100 text-emerald-800'],
                ['Rejected', vendorRequestCounts.rejected, 'bg-rose-100 text-rose-800'],
                ['Confirmed', vendorRequestCounts.confirmed, 'bg-green-100 text-green-800'],
                ['Contract', vendorRequestCounts.contract_pending, 'bg-indigo-100 text-indigo-800'],
              ].map(([label, count, className]) => (
                <span key={label} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{label}: {count}</span>
              ))}
            </div>
            {pendingVendorReqs.length === 0 ? (
              <EmptyStateCard title="No active vendor requests" description="Browse the marketplace and send requests once your event brief is ready." icon={MessageSquare} action={<Button variant="secondary" onClick={() => navigate('/organizer/vendor-marketplace')}>Browse Marketplace</Button>} />
            ) : (
              <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                {pendingVendorReqs.slice(0, 4).map((request) => (
                  <div key={request.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-950">{request.vendorName}</h3>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS_DASHBOARD[request.status] || 'bg-slate-100 text-slate-600'}`}>
                        {STATUS_LABELS_DASHBOARD[request.status]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{request.category} - {request.eventName}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">{request.lastMessage}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-400">{formatRelativeTime(request.lastUpdated)}</span>
                      <Button variant="secondary" onClick={() => navigate('/organizer/vendor-status')}>Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </OrganizerCard>
        </div>

        <OrganizerCard>
          <SectionHeader title="Upcoming Bookings" description="Accepted and confirmed vendor schedules." action={<TextAction label="View All" onClick={() => navigate('/organizer/vendor-status')} />} />
          {bookings.length === 0 ? (
            <EmptyStateCard title="No upcoming bookings yet" description="Accepted or confirmed vendor bookings will appear here after requests progress." icon={CalendarCheck} />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {bookings.map((booking) => (
                <OrganizerCard key={booking.id} className="p-4" interactive>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-950">{booking.eventName}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS_DASHBOARD[booking.status] || 'bg-slate-100 text-slate-600'}`}>{STATUS_LABELS_DASHBOARD[booking.status]}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{booking.vendorName}</p>
                  <p className="mb-2 text-xs text-slate-500">{booking.category}</p>
                  <InfoLine icon={Calendar} text={formatDate(booking.date)} />
                  <InfoLine icon={Clock} text={booking.timeSlot} />
                </OrganizerCard>
              ))}
            </div>
          )}
        </OrganizerCard>

        <OrganizerCard>
          <SectionHeader title="Recommended Vendors" description="Backend-recommended vendors based on available event context." action={<TextAction label="View Marketplace" onClick={() => navigate('/organizer/vendor-marketplace')} />} />
          {recommendedVendors.length === 0 ? (
            <EmptyStateCard title="No recommendations yet" description="Vendor suggestions will appear after event requirements or backend marketplace data are available." icon={Sparkles} action={<Button variant="secondary" onClick={() => navigate('/organizer/vendor-marketplace')}>Browse Marketplace</Button>} />
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {recommendedVendors.map((vendor) => (
                <OrganizerCard key={vendor.id} className="p-4" interactive>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950">{vendor.name}</h3>
                      <p className="text-xs text-slate-500">{vendor.category}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      <Star className="h-3 w-3" />
                      {vendor.rating}
                    </span>
                  </div>
                  <div className="mb-3 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-500" />{vendor.matchScore}% match</span>
                    <span className="font-semibold text-brand-700">From ${vendor.startingPrice.toLocaleString()}</span>
                  </div>
                  <Button variant="secondary" fullWidth onClick={() => navigate('/organizer/vendor-marketplace')}>View Vendor</Button>
                </OrganizerCard>
              ))}
            </div>
          )}
        </OrganizerCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <OrganizerCard>
            <SectionHeader title="Recent Activity" description="Latest backend activity on events and vendor requests." />
            {activities.length === 0 ? (
              <EmptyStateCard title="No recent activity" description="Activity will appear after drafts, requests, bookings, or contracts change." icon={Activity} />
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map((item) => {
                  const Icon = activityIcons[item.type] || Activity
                  return (
                    <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${activityColors[item.type] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-700">{item.description}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{formatRelativeTime(item.timestamp)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </OrganizerCard>

          <OrganizerCard>
            <SectionHeader title="Needs Attention" description="Items that may require a response." />
            {notifications.length === 0 ? (
              <EmptyStateCard title="Nothing needs attention" description="You are clear for now. Response reminders and contract tasks will appear here." icon={CheckCircle2} />
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type] || AlertCircle
                  return (
                    <button key={notification.id} onClick={() => navigate(notification.linkTo)} className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-brand-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 text-sm text-slate-700">{notification.description}</span>
                      <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-slate-300" />
                    </button>
                  )
                })}
              </div>
            )}
          </OrganizerCard>
        </div>
      </OrganizerPage>
    </DashboardShell>
  )
}

function TextAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-200 rounded-lg">
      {label}
      <ChevronRight className="h-3 w-3" />
    </button>
  )
}

function InfoLine({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-1 text-xs text-slate-500">
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{text}</span>
    </div>
  )
}
