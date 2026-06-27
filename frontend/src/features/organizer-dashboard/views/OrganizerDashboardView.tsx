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
  ThumbsUp,
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
  request_sent: 'bg-blue-100 text-blue-700 border border-blue-200',
  vendor_accepted: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  vendor_rejected: 'bg-red-100 text-red-700 border border-red-200',
  new_message: 'bg-purple-100 text-purple-700 border border-purple-200',
  draft_updated: 'bg-amber-100 text-amber-700 border border-amber-200',
  booking_confirmed: 'bg-green-100 text-green-700 border border-green-200',
  contract_pending: 'bg-violet-100 text-violet-700 border border-violet-200',
}

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  response_review: Inbox,
  confirm_booking: CheckCircle2,
  unfinished_draft: FileText,
  contract_pending: FileSignature,
}

const notificationColors: Record<string, string> = {
  response_review: 'bg-amber-100 text-amber-700 border border-amber-200',
  confirm_booking: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  unfinished_draft: 'bg-blue-100 text-blue-700 border border-blue-200',
  contract_pending: 'bg-violet-100 text-violet-700 border border-violet-200',
}

function formatDate(date: string) {
  if (!date) return 'TBD'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatRelativeTime(date: string) {
  if (!date) return 'TBD'
  const now = Date.now()
  const then = new Date(date).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  if (minutes < 0) return 'just now'
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

  const pendingVendorReqs = vendorRequests.filter(
    (r) => ['sent', 'pending', 'viewed', 'quoted', 'negotiating'].includes(r.status)
  )

  return (
    <DashboardShell>
      <OrganizerPage>
        <OrganizerCard className="overflow-hidden p-0">
          <div className="border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(241,248,255,0.94)_46%,rgba(231,244,255,0.9)_100%)] px-4 py-4 md:px-5 md:py-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-3xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-600">Eventify</p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 md:text-[2.15rem]">
                  Welcome back, Organizer
                </h1>
                <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 md:text-sm">
                  Manage your event plans, vendor requests, bookings, and active marketplace status indicators.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button onClick={() => navigate('/organizer/plan-event')}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Plan an Event
                </Button>
                <Button variant="secondary" onClick={() => navigate('/organizer/vendor-marketplace')}>
                  <ShoppingBag className="w-4 h-4 mr-1.5" />
                  View Marketplace
                </Button>
                <Button variant="secondary" onClick={() => navigate('/organizer/vendor-status')}>
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Track Status
                </Button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              <MetricCard label="Total Events" value={summaryStats.totalEvents} icon={Calendar} tone="indigo" />
              <MetricCard label="Draft Events" value={summaryStats.draftEvents} icon={FileText} tone="amber" />
              <MetricCard label="Active Requests" value={summaryStats.activeVendorRequests} icon={Send} tone="blue" />
              <MetricCard label="Pending Responses" value={summaryStats.pendingResponses} icon={Clock} tone="amber" />
              <MetricCard label="Accepted" value={summaryStats.acceptedBookings} icon={ThumbsUp} tone="emerald" />
              <MetricCard label="Confirmed" value={summaryStats.confirmedBookings} icon={CheckCircle2} tone="emerald" />
            </div>

            <div className="mt-5">
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-950">Quick Actions</p>
                <p className="mt-0.5 text-xs text-slate-500">Common tasks to help you move faster</p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {[
                  { label: 'Plan a New Event', icon: Plus, to: '/organizer/plan-event', tone: 'primary' as const },
                  { label: 'Continue Draft', icon: FileText, to: '/organizer/plan-event', tone: 'amber' as const },
                  { label: 'Browse Marketplace', icon: ShoppingBag, to: '/organizer/vendor-marketplace', tone: 'blue' as const },
                  { label: 'Track Requests', icon: MessageSquare, to: '/organizer/vendor-status', tone: 'purple' as const },
                  { label: 'Confirmed Bookings', icon: CalendarCheck, to: '/organizer/vendor-status', tone: 'green' as const },
                ].map((action) => {
                  const Icon = action.icon
                  const tones: Record<string, string> = {
                    primary: 'bg-gradient-to-br from-brand-600 to-brand-700 text-white hover:from-brand-500 hover:to-brand-600 shadow-brand-200/50',
                    amber: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 shadow-amber-200/50',
                    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 shadow-blue-200/50',
                    purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-400 hover:to-purple-500 shadow-purple-200/50',
                    green: 'bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-400 hover:to-green-500 shadow-green-200/50',
                  }
                  return (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.to)}
                      className={`${tones[action.tone]} flex h-20 flex-col justify-between rounded-xl p-3 text-left text-xs font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:h-24 md:p-4 md:text-sm`}
                    >
                      <Icon className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
                      <span>{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </OrganizerCard>

        <SectionHeader
          title="Event Planning Summary"
          eyebrow=""
          action={
            <Button variant="ghost" onClick={() => navigate('/organizer/plan-event')}>
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          }
        />
        {events.length === 0 ? (
          <EmptyStateCard
            title="No active event summaries"
            description="Start by planning an event."
            action={<Button onClick={() => navigate('/organizer/plan-event')}>Plan an Event</Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => (
              <OrganizerCard key={event.id} className="p-5 flex flex-col justify-between" interactive>
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{event.name}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      STATUS_COLORS_DASHBOARD[event.status] || 'bg-slate-100 text-slate-700'
                    }`}>
                      {STATUS_LABELS_DASHBOARD[event.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 font-medium">{event.eventType}</p>
                  <div className="h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
                    <div className="h-full bg-brand-600 rounded-full" style={{ width: `${event.progress}%` }} />
                  </div>
                  <div className="space-y-2 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" />{formatDate(event.date)}</div>
                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" />{event.location}</div>
                    <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-slate-400" />{event.guestCount.toLocaleString()} guests</div>
                    <div className="flex items-center gap-2"><DollarSign className="w-3.5 h-3.5 text-slate-400" />${event.budget.toLocaleString()}</div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => navigate(event.progress < 100 ? '/organizer/plan-event' : `/organizer/vendor-marketplace?eventId=${event.id}`)}
                  fullWidth
                >
                  {event.progress < 100 ? 'Continue Setup' : 'View Event Brief'}
                </Button>
              </OrganizerCard>
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <OrganizerCard className="p-5">
            <SectionHeader
              title="Draft Events"
              eyebrow=""
              action={
                <Button variant="ghost" onClick={() => navigate('/organizer/plan-event')}>
                  View All Drafts <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              }
            />
            <div className="space-y-3.5">
              {drafts.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No draft events yet.</p>
              ) : (
                drafts.slice(0, 3).map((draft) => (
                  <div key={draft.id} className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-shadow hover:shadow-sm">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">{draft.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{draft.eventType} · Last edited {formatRelativeTime(draft.lastEdited)}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase">Step {draft.lastCompletedStep}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-amber-600">{draft.progress}%</span>
                        <div className="w-16 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${draft.progress}%` }} />
                        </div>
                      </div>
                      <Button variant="secondary" onClick={() => navigate('/organizer/plan-event')}>
                        Resume
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </OrganizerCard>

          <OrganizerCard className="p-5">
            <SectionHeader title="Vendor Request Status" />
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { label: 'Pending', count: vendorRequestCounts.pending, color: 'bg-amber-100 text-amber-700 border border-amber-200' },
                { label: 'Accepted', count: vendorRequestCounts.accepted, color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
                { label: 'Rejected', count: vendorRequestCounts.rejected, color: 'bg-red-100 text-red-700 border border-red-200' },
                { label: 'Confirmed', count: vendorRequestCounts.confirmed, color: 'bg-green-100 text-green-700 border border-green-200' },
                { label: 'Contract', count: vendorRequestCounts.contract_pending, color: 'bg-violet-100 text-violet-700 border border-violet-200' },
              ].map((item) => (
                <span key={item.label} className={`text-xs font-medium px-2.5 py-1 rounded-full border ${item.color}`}>
                  {item.label}: {item.count}
                </span>
              ))}
            </div>
            <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
              {pendingVendorReqs.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No pending requests.</p>
              ) : (
                pendingVendorReqs.slice(0, 4).map((req) => {
                  const statusClass = STATUS_COLORS_DASHBOARD[req.status] || 'bg-slate-100 text-slate-700'
                  return (
                    <div key={req.id} className="bg-slate-50 rounded-xl border border-slate-200 p-4 hover:border-brand-200 transition-all shadow-sm">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">{req.vendorName}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${statusClass}`}>
                          {STATUS_LABELS_DASHBOARD[req.status]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{req.category} · {req.eventName}</p>
                      <p className="text-xs text-slate-400 mt-2 truncate bg-white px-2 py-1.5 rounded-lg italic border border-slate-100">&quot;{req.lastMessage}&quot;</p>
                      <div className="flex items-center justify-between mt-3.5">
                        <span className="text-[10px] text-slate-400">{formatRelativeTime(req.lastUpdated)}</span>
                        <div className="flex gap-2">
                          <Button variant="secondary" onClick={() => navigate(`/organizer/vendor-status`)}>
                            Chat
                          </Button>
                          <Button variant="ghost" onClick={() => navigate(`/organizer/vendor-status`)}>
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </OrganizerCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <OrganizerCard className="p-5">
            <SectionHeader title="Recent Activity" eyebrow="" />
            <div className="space-y-3.5">
              {activities.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No recent activity.</p>
              ) : (
                activities.slice(0, 5).map((activity) => {
                  const Icon = activityIcons[activity.type] || Activity
                  const color = activityColors[activity.type] || 'bg-slate-100 text-slate-700 border border-slate-200'
                  return (
                    <div key={activity.id} className="flex items-start gap-3 bg-slate-50 rounded-xl border border-slate-200 p-3.5 transition-shadow hover:shadow-sm">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-700">{activity.description}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{formatRelativeTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </OrganizerCard>

          <OrganizerCard className="p-5">
            <SectionHeader title="Needs Attention" eyebrow="" />
            <div className="space-y-3.5">
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">Nothing needs attention.</p>
              ) : (
                notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type] || AlertCircle
                  const color = notificationColors[notification.type] || 'bg-slate-100 text-slate-700 border border-slate-200'
                  return (
                    <button
                      key={notification.id}
                      onClick={() => navigate(notification.linkTo)}
                      className="w-full text-left flex items-start gap-3 bg-slate-50 rounded-xl border border-slate-200 p-3.5 hover:border-brand-200 transition-all shadow-sm"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-700">{notification.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-2.5" />
                    </button>
                  )
                })
              )}
            </div>
          </OrganizerCard>
        </div>

      </OrganizerPage>
    </DashboardShell>
  )
}
