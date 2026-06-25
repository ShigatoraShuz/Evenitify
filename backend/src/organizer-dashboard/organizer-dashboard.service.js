const AppError = require('../shared/utils/appError');
const repository = require('./organizer-dashboard.repository');

function getRequestVendor(request) {
  return Array.isArray(request?.request_vendors)
    ? request.request_vendors[0] || null
    : request?.request_vendors || null;
}

function normalizeOrganizerRequestStatus(status) {
  if (status === 'open' || status === 'pending') return 'sent';
  if (status === 'changes_requested') return 'negotiating';
  if (status === 'viewed') return 'viewed';
  if (status === 'accepted') return 'accepted';
  if (status === 'rejected') return 'rejected';
  if (status === 'confirmed') return 'confirmed';
  return 'sent';
}

function toDashboardEvent(event) {
  return {
    id: event.id,
    name: event.title,
    eventType: event.status === 'draft' ? 'Draft Event' : 'Planned Event',
    date: event.event_date,
    location: event.venue,
    guestCount: event.expected_guests || 0,
    budget: Number(event.budget || 0),
    progress: getEventProgress(event.status),
    status: mapEventStatus(event.status)
  };
}

function toDraft(event) {
  const progress = getDraftProgress(event);
  return {
    id: event.id,
    name: event.title,
    eventType: 'Draft Event',
    lastEdited: event.updated_at || event.created_at,
    progress,
    lastCompletedStep: getDraftStepLabel(progress)
  };
}

function toVendorRequest(booking) {
  const requestVendor = getRequestVendor(booking);
  const status = normalizeOrganizerRequestStatus(requestVendor?.status || booking.status || 'open');
  return {
    id: booking.id,
    vendorName: booking.vendor_profiles?.business_name || 'Vendor',
    category: booking.vendor_services?.category || 'Service',
    eventName: booking.large_events?.title || 'Event',
    status,
    requestedBudget: Number(requestVendor?.budget_min ?? booking.budget_min ?? 0) || undefined,
    date: booking.large_events?.event_date || requestVendor?.deadline || undefined,
    lastMessage: requestVendor?.request_message || booking.request_message || booking.description || `Request is currently ${status}.`,
    lastUpdated: booking.updated_at || booking.created_at || booking.requested_at
  };
}

function toBooking(booking) {
  return {
    id: booking.id,
    eventName: booking.large_events?.title || 'Event',
    vendorName: booking.vendor_profiles?.business_name || 'Vendor',
    category: booking.event_requirements?.category || 'Service',
    date: booking.large_events?.event_date || booking.requested_at,
    timeSlot: 'To be confirmed',
    status: mapBookingStatus(booking)
  };
}

function toRecommendedVendor(service, categories) {
  const rating = Number(service.vendor_profiles?.rating || 0);
  const categoryMatch = categories.includes(service.category) ? 25 : 0;
  const ratingScore = Math.round((rating / 5) * 75);

  return {
    id: service.vendor_profiles?.id || service.id,
    name: service.vendor_profiles?.business_name || 'Vendor',
    category: service.category,
    rating,
    matchScore: Math.min(100, ratingScore + categoryMatch),
    startingPrice: Number(service.base_price || 0)
  };
}

function toActivity(item) {
  const booking = item.bookings || {};
  const eventName = booking.large_events?.title || 'Event';
  const vendorName = booking.vendor_profiles?.business_name || 'Vendor';
  const category = booking.event_requirements?.category || 'service';
  const status = item.new_status || 'pending';

  return {
    id: item.id,
    type: mapActivityType(status),
    description: buildActivityDescription(status, vendorName, category, eventName, item.reason),
    timestamp: item.created_at
  };
}

function toNotification(notification) {
  return {
    id: notification.id,
    type: mapNotificationType(notification.notification_type, notification.action_url),
    description: notification.message || notification.title,
    linkTo: notification.action_url || '/notifications'
  };
}

async function getDashboardPayload(actor) {
  const organizer = await repository.findOrganizerProfileByUserId(actor.id);

  if (!organizer) {
    throw new AppError('Organizer profile not found', 404, 'ORGANIZER_NOT_FOUND');
  }

  const [events, bookings, activity, notifications] = await Promise.all([
    repository.findEventsByOrganizerId(organizer.id),
    repository.findBookingsByOrganizerId(organizer.id),
    repository.findRecentBookingActivityByOrganizerId(organizer.id),
    repository.findUnreadNotificationsByUserId(actor.id)
  ]);

  const draftEvents = events.filter((event) => event.status === 'draft');
  const activeEvents = events.filter((event) => event.status !== 'draft');
  const vendorRequestBookings = await repository.findVendorRequestsByOrganizerId(organizer.id);
  const upcomingBookings = bookings.filter((booking) =>
    ['accepted', 'confirmed'].includes(booking.status) || hasPendingContract(booking.contracts)
  );

  const preferredCategories = [...new Set(
    vendorRequestBookings
      .map((booking) => booking.event_requirements?.category)
      .filter(Boolean)
  )];

  const vendorServices = await repository.findRelevantVendorServices(preferredCategories);
  const recommendedVendors = dedupeRecommendedVendors(
    vendorServices.map((service) => toRecommendedVendor(service, preferredCategories))
  ).slice(0, 6);

  return {
    summary: {
      totalEvents: events.length,
      draftEvents: draftEvents.length,
      activeVendorRequests: vendorRequestBookings.length,
      pendingResponses: vendorRequestBookings.filter((item) =>
        ['sent', 'viewed'].includes(normalizeOrganizerRequestStatus(getRequestVendor(item)?.status || item.status))
      ).length,
      acceptedBookings: upcomingBookings.filter((item) => ['accepted', 'confirmed'].includes(item.status)).length,
      confirmedBookings: upcomingBookings.filter((item) => item.status === 'confirmed').length
    },
    events: activeEvents.map(toDashboardEvent),
    drafts: draftEvents.map(toDraft),
    vendorRequests: vendorRequestBookings.map((request) => toVendorRequest(request)),
    bookings: upcomingBookings.map(toBooking),
    recommendedVendors,
    activities: activity.map(toActivity).slice(0, 5),
    notifications: notifications.map(toNotification).slice(0, 5)
  };
}

async function getSummary(actor) {
  const payload = await getDashboardPayload(actor);
  return payload.summary;
}

async function getEvents(actor) {
  const payload = await getDashboardPayload(actor);
  return payload.events;
}

async function getDrafts(actor) {
  const payload = await getDashboardPayload(actor);
  return payload.drafts;
}

async function getVendorRequests(actor) {
  const payload = await getDashboardPayload(actor);
  return payload.vendorRequests;
}

async function getBookings(actor) {
  const payload = await getDashboardPayload(actor);
  return payload.bookings;
}

async function getRecommendedVendors(actor) {
  const payload = await getDashboardPayload(actor);
  return payload.recommendedVendors;
}

async function getActivities(actor) {
  const payload = await getDashboardPayload(actor);
  return payload.activities;
}

async function getNotifications(actor) {
  const payload = await getDashboardPayload(actor);
  return payload.notifications;
}

function buildEmptyDashboard() {
  return {
    summary: {
      totalEvents: 0,
      draftEvents: 0,
      activeVendorRequests: 0,
      pendingResponses: 0,
      acceptedBookings: 0,
      confirmedBookings: 0
    },
    events: [],
    drafts: [],
    vendorRequests: [],
    bookings: [],
    recommendedVendors: [],
    activities: [],
    notifications: []
  };
}

function getEventProgress(status) {
  const progressByStatus = {
    draft: 25,
    planning: 55,
    booking: 80,
    confirmed: 100,
    completed: 100,
    cancelled: 0
  };

  return progressByStatus[status] ?? 0;
}

function hasMeaningfulText(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim() !== 'TBD';
}

function getDraftProgress(event) {
  if (event.status === 'completed') return 100;
  if (event.status === 'cancelled') return 0;

  const checkpoints = [
    hasMeaningfulText(event.title) && !event.title.toLowerCase().endsWith(' planning draft'),
    hasMeaningfulText(event.venue),
    Boolean(event.event_date),
    Number(event.budget || 0) > 0,
    Number(event.expected_guests || 0) > 1
  ];

  const filled = checkpoints.filter(Boolean).length;
  return Math.max(10, Math.min(95, Math.round((filled / checkpoints.length) * 100)));
}

function getDraftStepLabel(progress) {
  if (progress >= 90) return 'Ready to review';
  if (progress >= 70) return 'Requirements prepared';
  if (progress >= 50) return 'Event details added';
  if (progress >= 30) return 'Venue selected';
  return 'Event basics saved';
}

function mapEventStatus(status) {
  if (status === 'booking' || status === 'confirmed') return 'active';
  if (status === 'cancelled') return 'draft';
  return status;
}

function mapBookingStatus(booking) {
  if (hasPendingContract(booking.contracts)) return 'contract_pending';
  if (booking.status === 'confirmed') return 'confirmed';
  return 'accepted';
}

function hasPendingContract(contracts) {
  return (contracts || []).some((contract) =>
    ['draft', 'sent', 'organizer_signed', 'vendor_signed'].includes(contract.contract_status)
  );
}

function mapActivityType(status) {
  if (status === 'accepted') return 'vendor_accepted';
  if (status === 'rejected') return 'vendor_rejected';
  if (status === 'confirmed') return 'booking_confirmed';
  if (status === 'changes_requested') return 'new_message';
  return 'request_sent';
}

function buildActivityDescription(status, vendorName, category, eventName, reason) {
  if (status === 'accepted') return `${vendorName} accepted the ${category} request for ${eventName}.`;
  if (status === 'rejected') return `${vendorName} declined the ${category} request for ${eventName}.`;
  if (status === 'confirmed') return `${vendorName} is confirmed for ${eventName}.`;
  if (status === 'changes_requested') return `${vendorName} requested changes for ${eventName}.${reason ? ` ${reason}` : ''}`;
  return `${vendorName} received a ${category} request for ${eventName}.`;
}

function mapNotificationType(type, actionUrl) {
  if (type === 'contract_sent' || type === 'contract_signed') return 'contract_pending';
  if (type === 'booking_status_changed' && actionUrl?.includes('portfolio')) return 'confirm_booking';
  if (type === 'booking_created') return 'response_review';
  return 'response_review';
}

function dedupeRecommendedVendors(vendors) {
  const seen = new Set();
  return vendors.filter((vendor) => {
    if (seen.has(vendor.id)) return false;
    seen.add(vendor.id);
    return true;
  });
}

module.exports = {
  getDashboard: getDashboardPayload,
  getSummary,
  getEvents,
  getDrafts,
  getVendorRequests,
  getBookings,
  getRecommendedVendors,
  getActivities,
  getNotifications
};
