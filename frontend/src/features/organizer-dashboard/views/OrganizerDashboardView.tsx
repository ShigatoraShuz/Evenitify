import { useNavigate } from 'react-router-dom'
import {
  Plus, ShoppingBag, MessageSquare, CalendarCheck, ArrowRight, Calendar, MapPin, Users, DollarSign,
  Clock, Star, TrendingUp, AlertCircle, CheckCircle2, XCircle, Send, Eye, FileText,
  MessageSquare as MessageIcon, ThumbsUp, FileSignature, Activity, ExternalLink,
  BarChart3, ClipboardList, Sparkles, ChevronRight, Inbox
} from 'lucide-react'
import { DashboardShell } from '../../../shared/components/DashboardShell'
import type {
  DashboardEventPreview, DashboardDraft, DashboardVendorRequest, DashboardBooking,
  RecommendedVendorPreview, DashboardActivity, DashboardNotification,
} from '../models/organizer-dashboard.model'
import { STATUS_LABELS_DASHBOARD, STATUS_COLORS_DASHBOARD } from '../models/organizer-dashboard.model'

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
  request_sent: 'bg-blue-100 text-blue-600',
  vendor_accepted: 'bg-emerald-100 text-emerald-600',
  vendor_rejected: 'bg-red-100 text-red-600',
  new_message: 'bg-purple-100 text-purple-600',
  draft_updated: 'bg-amber-100 text-amber-600',
  booking_confirmed: 'bg-green-100 text-green-600',
  contract_pending: 'bg-violet-100 text-violet-600',
}

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  response_review: Inbox,
  confirm_booking: CheckCircle2,
  unfinished_draft: FileText,
  contract_pending: FileSignature,
}

const notificationColors: Record<string, string> = {
  response_review: 'bg-amber-100 text-amber-600',
  confirm_booking: 'bg-emerald-100 text-emerald-600',
  unfinished_draft: 'bg-blue-100 text-blue-600',
  contract_pending: 'bg-violet-100 text-violet-600',
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatRelativeTime(date: string) {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function OrganizerDashboardView({
  events, drafts, vendorRequests, bookings, recommendedVendors,
  activities, notifications, summaryStats, vendorRequestCounts,
}: Props) {
  const navigate = useNavigate()

  const pendingVendorReqs = vendorRequests.filter(
    (r) => ['sent', 'pending', 'viewed', 'quoted', 'negotiating'].includes(r.status)
  )

  const acceptedOrConfirmed = vendorRequests.filter(
    (r) => r.status === 'accepted' || r.status === 'confirmed'
  )

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 p-6 md:p-8 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-navy-300">Eventify</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back, Organizer</h1>
              <p className="mt-2 max-w-xl text-sm text-navy-200">
                Manage your event plans, vendor requests, bookings, and vendor marketplace progress.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/organizer/plan-event')}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98] bg-white text-navy-900 hover:bg-slate-100 shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Plan an Event
              </button>
              <button
                onClick={() => navigate('/organizer/vendor-marketplace')}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98] border border-navy-500 text-navy-100 hover:bg-navy-700"
              >
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                View Marketplace
              </button>
              <button
                onClick={() => navigate('/organizer/vendor-status')}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98] border border-navy-500 text-navy-100 hover:bg-navy-700"
              >
                <MessageSquare className="w-4 h-4 mr-1.5" />
                Track Status
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Events', value: summaryStats.totalEvents, icon: Calendar, color: 'text-navy-600', bg: 'bg-navy-50' },
            { label: 'Draft Events', value: summaryStats.draftEvents, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Active Requests', value: summaryStats.activeVendorRequests, icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Pending Responses', value: summaryStats.pendingResponses, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Accepted', value: summaryStats.acceptedBookings, icon: ThumbsUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Confirmed', value: summaryStats.confirmedBookings, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-slate-200`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-500">{stat.label}</span>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
              </div>
            )
          })}
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-700 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Plan a New Event', icon: Plus, to: '/organizer/plan-event', color: 'bg-navy-700 text-white hover:bg-navy-800' },
              { label: 'Continue Draft', icon: FileText, to: '/organizer/plan-event', color: 'bg-amber-500 text-white hover:bg-amber-600' },
              { label: 'Browse Marketplace', icon: ShoppingBag, to: '/organizer/vendor-marketplace', color: 'bg-blue-500 text-white hover:bg-blue-600' },
              { label: 'Track Requests', icon: MessageSquare, to: '/organizer/vendor-status', color: 'bg-purple-500 text-white hover:bg-purple-600' },
              { label: 'Confirmed Bookings', icon: CalendarCheck, to: '/organizer/vendor-status', color: 'bg-green-500 text-white hover:bg-green-600' },
            ].map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.to)}
                  className={`${action.color} rounded-xl p-4 text-left text-sm font-medium transition-all hover:shadow-md`}
                >
                  <Icon className="w-5 h-5 mb-2" />
                  {action.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-700">Event Planning Summary</h2>
            <button onClick={() => navigate('/organizer/plan-event')} className="text-xs font-medium text-navy-600 hover:text-navy-800 flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">{event.name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    event.status === 'active' ? 'bg-green-100 text-green-700' :
                    event.status === 'planning' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">{event.eventType}</p>
                <div className="h-1.5 bg-slate-100 rounded-full mb-3">
                  <div className="h-full bg-navy-600 rounded-full" style={{ width: `${event.progress}%` }} />
                </div>
                <div className="space-y-1 text-xs text-slate-500 mb-3">
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(event.date)}</div>
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</div>
                  <div className="flex items-center gap-1"><Users className="w-3 h-3" />{event.guestCount.toLocaleString()} guests</div>
                  <div className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${event.budget.toLocaleString()}</div>
                </div>
                <button
                  onClick={() => navigate(event.progress < 100 ? '/organizer/plan-event' : `/organizer/vendor-marketplace?eventId=${event.id}`)}
                  className="w-full text-xs font-medium text-navy-700 bg-navy-50 rounded-lg py-2 hover:bg-navy-100 transition-colors"
                >
                  {event.progress < 100 ? 'Continue' : 'View Event Brief'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-700">Draft Events</h2>
              <button onClick={() => navigate('/organizer/plan-event')} className="text-xs font-medium text-navy-600 hover:text-navy-800 flex items-center gap-1">
                View All Drafts <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {drafts.length === 0 && (
                <p className="text-sm text-slate-400 py-4 text-center">No draft events yet.</p>
              )}
              {drafts.map((draft) => (
                <div key={draft.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">{draft.name}</h3>
                      <p className="text-xs text-slate-500">{draft.eventType} · Last edited {formatRelativeTime(draft.lastEdited)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Step: {draft.lastCompletedStep}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-navy-700">{draft.progress}%</span>
                      </div>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 ml-auto">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${draft.progress}%` }} />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/organizer/plan-event')}
                    className="mt-2 text-xs font-medium text-navy-700 bg-navy-50 rounded-lg py-1.5 px-3 hover:bg-navy-100 transition-colors"
                  >
                    Continue Editing
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-700 mb-3">Vendor Request Status</h2>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { label: 'Pending', count: vendorRequestCounts.pending, color: 'bg-amber-100 text-amber-800' },
                { label: 'Accepted', count: vendorRequestCounts.accepted, color: 'bg-emerald-100 text-emerald-800' },
                { label: 'Rejected', count: vendorRequestCounts.rejected, color: 'bg-red-100 text-red-800' },
                { label: 'Confirmed', count: vendorRequestCounts.confirmed, color: 'bg-green-100 text-green-800' },
                { label: 'Contract', count: vendorRequestCounts.contract_pending, color: 'bg-violet-100 text-violet-800' },
              ].map((item) => (
                <span key={item.label} className={`text-xs font-medium px-2.5 py-1 rounded-full ${item.color}`}>
                  {item.label}: {item.count}
                </span>
              ))}
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {pendingVendorReqs.slice(0, 4).map((req) => {
                const color = STATUS_COLORS_DASHBOARD[req.status] || 'bg-slate-100 text-slate-600'
                return (
                  <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">{req.vendorName}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${color}`}>
                        {STATUS_LABELS_DASHBOARD[req.status]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{req.category} · {req.eventName}</p>
                    <p className="text-xs text-slate-400 mt-1 truncate">{req.lastMessage}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">{formatRelativeTime(req.lastUpdated)}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => navigate(`/organizer/vendor-status`)}
                          className="text-xs font-medium text-navy-700 bg-navy-50 rounded-md py-1 px-2 hover:bg-navy-100 transition-colors"
                        >
                          Open Chat
                        </button>
                        <button
                          onClick={() => navigate(`/organizer/vendor-status`)}
                          className="text-xs font-medium text-slate-600 bg-slate-100 rounded-md py-1 px-2 hover:bg-slate-200 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-700">Upcoming Bookings</h2>
            <button onClick={() => navigate('/organizer/vendor-status')} className="text-xs font-medium text-navy-600 hover:text-navy-800 flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {bookings.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No upcoming bookings yet.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {bookings.map((booking) => {
                const color = STATUS_COLORS_DASHBOARD[booking.status] || 'bg-slate-100 text-slate-600'
                return (
                  <div key={booking.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-slate-900">{booking.eventName}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${color}`}>
                        {STATUS_LABELS_DASHBOARD[booking.status]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{booking.vendorName}</p>
                    <p className="text-xs text-slate-500 mb-2">{booking.category}</p>
                    <div className="text-xs text-slate-400 space-y-0.5">
                      <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(booking.date)}</div>
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.timeSlot}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-700">Recommended Vendors</h2>
            <button onClick={() => navigate('/organizer/vendor-marketplace')} className="text-xs font-medium text-navy-600 hover:text-navy-800 flex items-center gap-1">
              View Marketplace <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {recommendedVendors.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{vendor.name}</h3>
                    <p className="text-xs text-slate-500">{vendor.category}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3" />
                    {vendor.rating}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" />{vendor.matchScore}% match</span>
                  <span className="font-semibold text-navy-700">From ${vendor.startingPrice.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => navigate(`/organizer/vendor-marketplace`)}
                  className="w-full text-xs font-medium text-navy-700 bg-navy-50 rounded-lg py-2 hover:bg-navy-100 transition-colors"
                >
                  View Vendor
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-base font-semibold text-slate-700 mb-3">Recent Activity</h2>
            <div className="space-y-2">
              {activities.length === 0 && (
                <p className="text-sm text-slate-400 py-4 text-center">No recent activity.</p>
              )}
              {activities.slice(0, 5).map((activity) => {
                const Icon = activityIcons[activity.type] || Activity
                const color = activityColors[activity.type] || 'bg-slate-100 text-slate-600'
                return (
                  <div key={activity.id} className="flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700">{activity.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(activity.timestamp)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-700 mb-3">Needs Attention</h2>
            <div className="space-y-2">
              {notifications.length === 0 && (
                <p className="text-sm text-slate-400 py-4 text-center">Nothing needs attention.</p>
              )}
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || AlertCircle
                const color = notificationColors[notification.type] || 'bg-slate-100 text-slate-600'
                return (
                  <button
                    key={notification.id}
                    onClick={() => navigate(notification.linkTo)}
                    className="w-full text-left flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md transition-shadow"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700">{notification.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 mt-2" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
