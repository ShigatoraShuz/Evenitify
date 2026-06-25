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
  request_sent: 'bg-blue-950/40 text-blue-400 border border-blue-900/30',
  vendor_accepted: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30',
  vendor_rejected: 'bg-red-950/40 text-red-400 border border-red-900/30',
  new_message: 'bg-purple-950/40 text-purple-400 border border-purple-900/30',
  draft_updated: 'bg-amber-950/40 text-amber-400 border border-amber-900/30',
  booking_confirmed: 'bg-green-950/40 text-green-400 border border-green-900/30',
  contract_pending: 'bg-violet-950/40 text-violet-400 border border-violet-900/30',
}

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  response_review: Inbox,
  confirm_booking: CheckCircle2,
  unfinished_draft: FileText,
  contract_pending: FileSignature,
}

const notificationColors: Record<string, string> = {
  response_review: 'bg-amber-950/40 text-amber-400 border border-amber-900/30',
  confirm_booking: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30',
  unfinished_draft: 'bg-blue-950/40 text-blue-400 border border-blue-900/30',
  contract_pending: 'bg-violet-950/40 text-violet-400 border border-violet-900/30',
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
      <div className="min-h-screen bg-[#080b11] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="rounded-[24px] border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between shadow-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">Eventify Suite</span>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Welcome back, Organizer</h1>
              <p className="mt-2 text-sm text-slate-400 max-w-xl">
                Manage your event plans, vendor requests, bookings, and active marketplace status indicators.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2 relative z-10">
              <button
                onClick={() => navigate('/organizer/plan-event')}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-950/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Plan an Event
              </button>
              <button
                onClick={() => navigate('/organizer/vendor-marketplace')}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                View Marketplace
              </button>
              <button
                onClick={() => navigate('/organizer/vendor-status')}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <MessageSquare className="w-4 h-4 mr-1.5" />
                Track Status
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { label: 'Total Events', value: summaryStats.totalEvents, icon: Calendar, color: 'text-violet-400', bg: 'bg-slate-900/60' },
              { label: 'Draft Events', value: summaryStats.draftEvents, icon: FileText, color: 'text-amber-400', bg: 'bg-slate-900/60' },
              { label: 'Active Requests', value: summaryStats.activeVendorRequests, icon: Send, color: 'text-blue-400', bg: 'bg-slate-900/60' },
              { label: 'Pending Responses', value: summaryStats.pendingResponses, icon: Clock, color: 'text-orange-400', bg: 'bg-slate-900/60' },
              { label: 'Accepted', value: summaryStats.acceptedBookings, icon: ThumbsUp, color: 'text-emerald-400', bg: 'bg-slate-900/60' },
              { label: 'Confirmed', value: summaryStats.confirmedBookings, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-slate-900/60' },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 border border-slate-800/80 shadow-md flex flex-col justify-between`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-slate-400">{stat.label}</span>
                    <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
                  </div>
                  <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
                </div>
              )
            })}
          </div>

          <div className="bg-slate-900/40 border border-slate-800/85 rounded-2xl p-5 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
              {[
                { label: 'Plan a New Event', icon: Plus, to: '/organizer/plan-event', color: 'bg-violet-600 hover:bg-violet-500 text-white' },
                { label: 'Continue Draft', icon: FileText, to: '/organizer/plan-event', color: 'bg-amber-600 hover:bg-amber-500 text-white' },
                { label: 'Browse Marketplace', icon: ShoppingBag, to: '/organizer/vendor-marketplace', color: 'bg-blue-600 hover:bg-blue-500 text-white' },
                { label: 'Track Requests', icon: MessageSquare, to: '/organizer/vendor-status', color: 'bg-purple-600 hover:bg-purple-500 text-white' },
                { label: 'Confirmed Bookings', icon: CalendarCheck, to: '/organizer/vendor-status', color: 'bg-green-600 hover:bg-green-500 text-white' },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.to)}
                    className={`${action.color} rounded-xl p-4 text-left text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-md flex flex-col justify-between h-24`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{action.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-200">Event Planning Summary</h2>
              <button
                onClick={() => navigate('/organizer/plan-event')}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {events.length === 0 ? (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/20 py-8 text-center text-sm text-slate-400">
                No active event summaries found. Start by planning an event.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {events.map((event) => (
                  <div key={event.id} className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between shadow-xl">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-semibold text-white text-sm truncate">{event.name}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${
                          event.status === 'active' || event.status === 'confirmed'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                            : event.status === 'planning'
                            ? 'bg-amber-950/40 text-amber-400 border-amber-900/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3 font-medium">{event.eventType}</p>
                      <div className="h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
                        <div className="h-full bg-violet-600 rounded-full" style={{ width: `${event.progress}%` }} />
                      </div>
                      <div className="space-y-2 text-xs text-slate-400 mb-4">
                        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-500" />{formatDate(event.date)}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-500" />{event.location}</div>
                        <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-slate-500" />{event.guestCount.toLocaleString()} guests</div>
                        <div className="flex items-center gap-2"><DollarSign className="w-3.5 h-3.5 text-slate-500" />${event.budget.toLocaleString()}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(event.progress < 100 ? '/organizer/plan-event' : `/organizer/vendor-marketplace?eventId=${event.id}`)}
                      className="w-full text-xs font-semibold text-white bg-slate-850 hover:bg-slate-800 border border-slate-700/80 rounded-xl py-2.5 transition-colors"
                    >
                      {event.progress < 100 ? 'Continue Setup' : 'View Event Brief'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-200">Draft Events</h2>
                <button
                  onClick={() => navigate('/organizer/plan-event')}
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  View All Drafts <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3.5">
                {drafts.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center bg-slate-900/30 rounded-2xl border border-slate-800/60">No draft events yet.</p>
                ) : (
                  drafts.slice(0, 3).map((draft) => (
                    <div key={draft.id} className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{draft.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{draft.eventType} · Last edited {formatRelativeTime(draft.lastEdited)}</p>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">Last Completed: Step {draft.lastCompletedStep}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-amber-400">{draft.progress}%</span>
                          <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${draft.progress}%` }} />
                          </div>
                        </div>
                        <button
                          onClick={() => navigate('/organizer/plan-event')}
                          className="text-xs font-semibold text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          Resume
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-200">Vendor Request Status</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Pending', count: vendorRequestCounts.pending, color: 'bg-amber-950/40 text-amber-400 border border-amber-900/30' },
                  { label: 'Accepted', count: vendorRequestCounts.accepted, color: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' },
                  { label: 'Rejected', count: vendorRequestCounts.rejected, color: 'bg-red-950/40 text-red-400 border border-red-900/30' },
                  { label: 'Confirmed', count: vendorRequestCounts.confirmed, color: 'bg-green-950/40 text-green-400 border border-green-900/30' },
                  { label: 'Contract', count: vendorRequestCounts.contract_pending, color: 'bg-violet-950/40 text-violet-400 border border-violet-900/30' },
                ].map((item) => (
                  <span key={item.label} className={`text-xs font-medium px-2.5 py-1 rounded-full border ${item.color}`}>
                    {item.label}: {item.count}
                  </span>
                ))}
              </div>
              <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
                {pendingVendorReqs.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center bg-slate-900/30 rounded-2xl border border-slate-800/60">No pending requests.</p>
                ) : (
                  pendingVendorReqs.slice(0, 4).map((req) => {
                    const statusClass = STATUS_COLORS_DASHBOARD[req.status] || 'bg-slate-800 text-slate-300'
                    return (
                      <div key={req.id} className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-4 hover:border-slate-700/85 transition-all shadow-md">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="text-sm font-semibold text-white truncate">{req.vendorName}</h3>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 border ${statusClass}`}>
                            {STATUS_LABELS_DASHBOARD[req.status]}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{req.category} · {req.eventName}</p>
                        <p className="text-xs text-slate-500 mt-2 truncate bg-slate-950/40 px-2 py-1.5 rounded-lg italic">&quot;{req.lastMessage}&quot;</p>
                        <div className="flex items-center justify-between mt-3.5">
                          <span className="text-[10px] text-slate-500">{formatRelativeTime(req.lastUpdated)}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/organizer/vendor-status`)}
                              className="text-xs font-semibold text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/85 rounded-lg px-2.5 py-1 transition-colors"
                            >
                              Chat
                            </button>
                            <button
                              onClick={() => navigate(`/organizer/vendor-status`)}
                              className="text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-850 border border-slate-800/80 rounded-lg px-2.5 py-1 transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-200">Upcoming Bookings</h2>
              <button
                onClick={() => navigate('/organizer/vendor-status')}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {bookings.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center bg-slate-900/30 rounded-2xl border border-slate-800/60">No upcoming bookings yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {bookings.map((booking) => {
                  const statusClass = STATUS_COLORS_DASHBOARD[booking.status] || 'bg-slate-800 text-slate-300'
                  return (
                    <div key={booking.id} className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-4 shadow-md flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <h3 className="text-sm font-semibold text-white truncate">{booking.eventName}</h3>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${statusClass}`}>
                            {STATUS_LABELS_DASHBOARD[booking.status]}
                          </span>
                        </div>
                        <p className="text-xs text-white font-medium">{booking.vendorName}</p>
                        <p className="text-xs text-slate-400 mb-3">{booking.category}</p>
                      </div>
                      <div className="text-xs text-slate-500 space-y-1 bg-slate-950/20 p-2.5 rounded-lg border border-slate-800/50">
                        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-500" />{formatDate(booking.date)}</div>
                        <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-500" />{booking.timeSlot}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-200">Recommended Vendors</h2>
              <button
                onClick={() => navigate('/organizer/vendor-marketplace')}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
              >
                View Marketplace <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {recommendedVendors.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center bg-slate-900/30 rounded-2xl border border-slate-800/60">No recommended vendors available.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {recommendedVendors.map((vendor) => (
                  <div key={vendor.id} className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between shadow-xl">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-semibold text-white truncate">{vendor.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{vendor.category}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-900/30 px-2.5 py-0.5 rounded-full">
                          <Star className="w-3 h-3 text-amber-450 fill-amber-400" />
                          {vendor.rating}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-4 bg-slate-950/20 p-2 rounded-lg">
                        <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" />{vendor.matchScore}% match</span>
                        <span className="font-semibold text-white">From ${vendor.startingPrice.toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/organizer/vendor-marketplace`)}
                      className="w-full text-xs font-semibold text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-xl py-2.5 transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-200">Recent Activity</h2>
              <div className="space-y-3.5">
                {activities.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center bg-slate-900/30 rounded-2xl border border-slate-800/60">No recent activity.</p>
                ) : (
                  activities.slice(0, 5).map((activity) => {
                    const Icon = activityIcons[activity.type] || Activity
                    const color = activityColors[activity.type] || 'bg-slate-850 text-slate-300'
                    return (
                      <div key={activity.id} className="flex items-start gap-3 bg-slate-900/60 rounded-2xl border border-slate-800/80 p-3.5 shadow-md">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-350">{activity.description}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{formatRelativeTime(activity.timestamp)}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-200">Needs Attention</h2>
              <div className="space-y-3.5">
                {notifications.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center bg-slate-900/30 rounded-2xl border border-slate-800/60">Nothing needs attention.</p>
                ) : (
                  notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type] || AlertCircle
                    const color = notificationColors[notification.type] || 'bg-slate-850 text-slate-300'
                    return (
                      <button
                        key={notification.id}
                        onClick={() => navigate(notification.linkTo)}
                        className="w-full text-left flex items-start gap-3 bg-slate-900/60 rounded-2xl border border-slate-800/80 p-3.5 hover:border-slate-700/85 transition-all shadow-md"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-350">{notification.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 mt-2.5" />
                      </button>
                    )
                  })
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
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
