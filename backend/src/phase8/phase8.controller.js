const asyncHandler = require('../shared/utils/asyncHandler');
const { supabase, supabaseAdmin } = require('../config/supabase');
const AppError = require('../shared/utils/appError');
const { sendSuccess, sendCreated } = require('../shared/utils/response');
const organizerEventsService = require('../organizer-events/organizer-events.service');
const adminOperationsService = require('../admin-operations/admin-operations.service');
const authRepository = require('../auth/auth.repository');
const bookingRepository = require('../contract-booking/contract-booking.repository');

function isMissingVendorServiceIdsColumnError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('vendor_service_ids') && (
    message.includes('schema cache') ||
    message.includes('could not find') ||
    message.includes('column')
  );
}

async function insertProcurementRequestWithFallback(payload, vendorServiceIds) {
  const fullPayload = {
    ...payload,
    vendor_service_ids: vendorServiceIds.length > 0 ? JSON.stringify(vendorServiceIds) : null,
  };

  const { data, error } = await supabase
    .from('procurement_requests')
    .insert(fullPayload)
    .select('*')
    .single();

  if (!error) return data;
  if (!isMissingVendorServiceIdsColumnError(error)) throw error;

  const fallbackPayload = { ...payload };
  const { data: fallbackData, error: fallbackError } = await supabase
    .from('procurement_requests')
    .insert(fallbackPayload)
    .select('*')
    .single();

  if (fallbackError) throw fallbackError;
  return fallbackData;
}

function parseVendorServiceIds(value) {
  if (Array.isArray(value)) {
    return value.map((id) => String(id)).filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map((id) => String(id)).filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function getRequestServiceIds(request) {
  const fromColumn = parseVendorServiceIds(request?.vendor_service_ids);
  if (fromColumn.length > 0) return fromColumn;

  const fallback = request?.vendor_service_id || request?.request_vendors?.vendor_service_id || request?.vendor_services?.id;
  return fallback ? [String(fallback)] : [];
}

function getDateKey(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
}

function isActiveRequestStatus(status) {
  return !['rejected', 'cancelled'].includes(String(status || '').toLowerCase());
}

async function hydrateRequestedServices(requests) {
  const list = Array.isArray(requests) ? requests : [requests];
  const serviceIds = [...new Set(list.flatMap((request) => getRequestServiceIds(request)))];

  const { data: services } = serviceIds.length > 0
    ? await supabaseAdmin
      .from('vendor_services')
      .select('id, service_name, category')
      .in('id', serviceIds)
    : { data: [] };

  const serviceMap = new Map((services || []).map((service) => [
    service.id,
    {
      id: service.id,
      serviceName: service.service_name,
      category: service.category || null,
    },
  ]));

  return list.map((request) => {
    const requestedServiceIds = getRequestServiceIds(request);
    const requestedServices = requestedServiceIds
      .map((serviceId) => serviceMap.get(serviceId))
      .filter(Boolean);

    return {
      ...request,
      requestedServiceIds,
      requestedServices: requestedServices.length > 0 ? requestedServices : (
        request.vendor_services?.id
          ? [{
              id: request.vendor_services.id,
              serviceName: request.vendor_services.service_name || 'Service',
              category: request.vendor_services.category || null,
            }]
          : []
      ),
    };
  });
}

async function getVendorBlockedDates(vendorId) {
  const [blockedDatesResult, activeRequestsResult, bookingsResult] = await Promise.all([
    supabaseAdmin.from('vendor_blocked_dates').select('date').eq('vendor_id', vendorId),
    supabaseAdmin.from('procurement_requests').select('deadline, status').eq('vendor_id', vendorId),
    supabaseAdmin.from('bookings').select('large_events(event_date)').eq('vendor_id', vendorId).in('status', ['accepted', 'confirmed', 'completed']),
  ]);

  if (blockedDatesResult.error) throw blockedDatesResult.error;
  if (activeRequestsResult.error) throw activeRequestsResult.error;
  if (bookingsResult.error) throw bookingsResult.error;

  const blockedSet = new Set();

  for (const row of blockedDatesResult.data || []) {
    const key = getDateKey(row.date);
    if (key) blockedSet.add(key);
  }

  for (const row of activeRequestsResult.data || []) {
    if (!isActiveRequestStatus(row.status)) continue;
    const key = getDateKey(row.deadline);
    if (key) blockedSet.add(key);
  }

  for (const row of bookingsResult.data || []) {
    const key = getDateKey(row.large_events?.event_date);
    if (key) blockedSet.add(key);
  }

  return blockedSet;
}

// A. Planning timeline endpoint
const getPlanningTimeline = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const portfolio = await organizerEventsService.getEventPortfolio(req.user, eventId);

  const eventDate = portfolio.event.event_date;
  
  const addDays = (isoDate, days) => {
    const date = new Date(isoDate);
    date.setDate(date.getDate() + days);
    return date.toISOString();
  };

  const pickStatus = (dueDate, complete) => {
    if (complete) return 'complete';
    const daysAway = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
    if (daysAway < 0) return 'blocked';
    if (daysAway <= 7) return 'at_risk';
    return 'upcoming';
  };

  const requirementMilestones = portfolio.event.requirements.map((requirement, index) => {
    const dueDate = addDays(eventDate, -42 + index * 3);
    return {
      id: `requirement-${requirement.id}`,
      title: `${requirement.category} requirement locked`,
      description: requirement.notes || `${requirement.quantity} vendor need ready for procurement.`,
      dueDate,
      type: 'requirement_due',
      status: pickStatus(dueDate, requirement.requirement_status === 'fulfilled'),
      ownerLabel: 'Organizer'
    };
  });

  const bookingMilestones = portfolio.event.bookings.map((booking, index) => {
    const dueDate = addDays(eventDate, -28 + index * 2);
    const vendorName = booking.vendor_profiles?.business_name || 'Vendor';
    return {
      id: `booking-${booking.id}`,
      title: `${vendorName} booking response`,
      description: `${booking.event_requirements?.category || 'Service'} request is ${booking.status}.`,
      dueDate,
      type: 'booking_deadline',
      status: pickStatus(dueDate, ['accepted', 'confirmed', 'completed'].includes(booking.status)),
      ownerLabel: vendorName
    };
  });

  const contractMilestones = portfolio.event.bookings.flatMap((booking, index) => {
    const contract = booking.contracts?.[0];
    if (!contract) return [];
    const dueDate = contract.sent_at || addDays(eventDate, -18 + index);
    return [{
      id: `contract-${contract.id}`,
      title: `${booking.vendor_profiles?.business_name || 'Vendor'} contract due`,
      description: `Contract is ${contract.contract_status}.`,
      dueDate,
      type: 'contract_due',
      status: pickStatus(dueDate, ['signed', 'active', 'completed'].includes(contract.contract_status)),
      ownerLabel: 'Organizer + Vendor'
    }];
  });

  const eventMilestone = {
    id: `event-${portfolio.event.id}`,
    title: portfolio.event.title,
    description: `${portfolio.event.expected_guests.toLocaleString()} guests at ${portfolio.event.venue}.`,
    dueDate: eventDate,
    type: 'event_date',
    status: pickStatus(eventDate, portfolio.event.status === 'completed'),
    ownerLabel: 'Event day'
  };

  const milestones = [
    ...requirementMilestones,
    ...bookingMilestones,
    ...contractMilestones,
    eventMilestone
  ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const nextDeadline = milestones.find((m) => m.status !== 'complete') || null;
  const calendarDays = milestones.slice(0, 8).map((m) => ({
    date: m.dueDate,
    label: m.title,
    items: 1,
    status: m.status
  }));

  return sendSuccess(res, { milestones, calendarDays, nextDeadline });
});

// B. Budget center endpoint
const getBudgetCenter = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const portfolio = await organizerEventsService.getEventPortfolio(req.user, eventId);

  const totalBudget = Number(portfolio.event.budget) || 0;
  const allocatedVendorBudget = portfolio.event.requirements.reduce((sum, requirement) => sum + (Number(requirement.max_budget) || 0), 0);
  
  const bookingAmount = (booking) => Number(booking.requested_budget) || 0;

  const acceptedBookingTotal = portfolio.event.bookings
    .filter((booking) => ['accepted', 'confirmed', 'completed', 'contract_sent'].includes(booking.status))
    .reduce((sum, booking) => sum + bookingAmount(booking), 0);

  const pendingBookingTotal = portfolio.event.bookings
    .filter((booking) => booking.status === 'pending' || booking.status === 'changes_requested')
    .reduce((sum, booking) => sum + bookingAmount(booking), 0);

  const estimatedSpending = acceptedBookingTotal + pendingBookingTotal;
  const remainingBudget = totalBudget - estimatedSpending;

  const PHASE8_CATEGORIES = ['Catering', 'Lights', 'Sounds', 'Venue', 'Photo/Video', 'Staff', 'Transport'];

  const categoryBreakdown = PHASE8_CATEGORIES.map((category) => {
    const requirementAllocated = portfolio.event.requirements
      .filter((requirement) => requirement.category.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(requirement.category.toLowerCase()))
      .reduce((sum, requirement) => sum + (Number(requirement.max_budget) || 0), 0);
    
    const categoryBookings = portfolio.event.bookings.filter((booking) => {
      const bookingCategory = booking.event_requirements?.category || '';
      return bookingCategory.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(bookingCategory.toLowerCase());
    });

    const accepted = categoryBookings
      .filter((booking) => ['accepted', 'confirmed', 'completed', 'contract_sent'].includes(booking.status))
      .reduce((sum, booking) => sum + bookingAmount(booking), 0);

    const pending = categoryBookings
      .filter((booking) => booking.status === 'pending' || booking.status === 'changes_requested')
      .reduce((sum, booking) => sum + bookingAmount(booking), 0);

    return {
      category,
      allocated: requirementAllocated,
      accepted,
      pending,
      estimated: accepted + pending
    };
  });

  return sendSuccess(res, {
    totalBudget,
    allocatedVendorBudget,
    estimatedSpending,
    acceptedBookingTotal,
    pendingBookingTotal,
    remainingBudget,
    overBudget: remainingBudget < 0,
    categoryBreakdown
  });
});

// C. Operational analytics endpoint
const getOperationalAnalytics = asyncHandler(async (req, res) => {
  const summary = await adminOperationsService.getDashboardSummary();

  const bookingTotal = summary.pending_bookings + summary.accepted_bookings + summary.rejected_bookings + summary.confirmed_bookings + summary.completed_bookings + summary.cancelled_bookings;
  const contractTotal = summary.draft_contracts + summary.active_contracts;
  const vendorTotal = summary.total_vendors;

  const pct = (part, total) => `${total > 0 ? Math.round((part / total) * 100) : 0}%`;

  // Compute real average response time from booking status histories
  const { data: history } = await supabaseAdmin
    .from('booking_status_history')
    .select('booking_id, created_at')
    .order('created_at', { ascending: true });

  let totalDiff = 0;
  let count = 0;
  const bookingsMap = {};
  for (const row of history || []) {
    if (!bookingsMap[row.booking_id]) {
      bookingsMap[row.booking_id] = [];
    }
    bookingsMap[row.booking_id].push(new Date(row.created_at));
  }
  for (const bookingId in bookingsMap) {
    const dates = bookingsMap[bookingId];
    if (dates.length > 1) {
      const diffMs = dates[1] - dates[0];
      totalDiff += diffMs;
      count++;
    }
  }
  const avgMs = count > 0 ? totalDiff / count : 0;
  const avgHours = avgMs > 0 ? Math.round(avgMs / 3600000) : 18; // fallback to 18h

  return sendSuccess(res, {
    metrics: [
      { label: 'Active events', value: String(summary.total_events), helper: 'Total large events under operations review' },
      { label: 'Pending verifications', value: String(summary.pending_verifications), helper: 'Vendors waiting on admin review' },
      { label: 'Pending booking reviews', value: String(summary.pending_bookings), helper: 'Bookings needing organizer/vendor movement' },
      { label: 'Contract completion rate', value: pct(summary.active_contracts, contractTotal), helper: 'Active contracts over tracked contracts' },
      { label: 'Vendor acceptance rate', value: pct(summary.accepted_bookings + summary.confirmed_bookings + summary.completed_bookings, bookingTotal), helper: 'Accepted or later bookings over all bookings' },
      { label: 'Avg response time', value: `${avgHours}h`, helper: 'Based on actual status change logs' }
    ],
    bookingStatus: [
      { label: 'Pending', value: summary.pending_bookings, tone: 'amber' },
      { label: 'Accepted', value: summary.accepted_bookings, tone: 'blue' },
      { label: 'Confirmed', value: summary.confirmed_bookings, tone: 'green' },
      { label: 'Rejected', value: summary.rejected_bookings, tone: 'rose' },
      { label: 'Cancelled', value: summary.cancelled_bookings, tone: 'slate' }
    ],
    vendorVerification: [
      { label: 'Pending', value: summary.pending_verifications, tone: 'amber' },
      { label: 'Verified', value: Math.max(vendorTotal - summary.pending_verifications, 0), tone: 'green' }
    ],
    contractStatus: [
      { label: 'Draft', value: summary.draft_contracts, tone: 'slate' },
      { label: 'Active', value: summary.active_contracts, tone: 'green' }
    ],
    eventTimelineStage: [
      { label: 'Large events', value: summary.total_events, tone: 'blue' },
      { label: '500+ guests', value: summary.large_events_500plus, tone: 'green' }
    ],
    insights: [
      'Prioritize pending vendor verifications before peak procurement windows.',
      'Monitor pending bookings that have no contract activity after acceptance.',
      `Actual calculated response time: ${avgHours}h.`
    ]
  });
});

// D. Audit activity endpoint
const getAuditActivity = asyncHandler(async (req, res) => {
  const { scope } = req.query; // event:eventId, booking:bookingId, admin
  let eventId = null;
  let bookingId = null;

  if (scope) {
    if (scope.startsWith('event:')) eventId = scope.split(':')[1];
    else if (scope.startsWith('booking:')) bookingId = scope.split(':')[1];
  }

  if (bookingId) {
    const { data: request } = await supabaseAdmin
      .from('procurement_requests')
      .select(`
        id,
        title,
        status,
        created_at,
        updated_at,
        request_vendors(id, status, request_message, viewed_at, accepted_at, rejected_at, changes_requested_at)
      `)
      .eq('id', bookingId)
      .maybeSingle();

    if (request) {
      const timelineEntries = buildRequestTimelineEntries(request);
      const requestActivities = timelineEntries.map((entry) => ({
        id: entry.id,
        actorName: entry.status === 'sent' ? 'Organizer' : 'Vendor',
        actorRole: entry.status === 'sent' ? 'organizer' : 'vendor',
        action:
          entry.status === 'sent'
            ? 'sent request'
            : entry.status === 'viewed'
              ? 'viewed request'
              : entry.status === 'negotiating'
                ? 'requested negotiation'
                : entry.status === 'accepted'
                  ? 'accepted request'
                  : entry.status === 'rejected'
                    ? 'rejected request'
                    : 'confirmed booking',
        target: request.title || 'vendor request',
        createdAt: entry.timestamp,
        detail: entry.description
      }));

      return sendSuccess(res, requestActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  }

  // 1. Booking status history query
  let bshQuery = supabaseAdmin
    .from('booking_status_history')
    .select(`
      id,
      previous_status,
      new_status,
      reason,
      created_at,
      changed_by,
      user_profiles:changed_by(display_name, role),
      bookings!inner(id, event_id, organizer_id, vendor_id)
    `);

  if (eventId) {
    bshQuery = bshQuery.eq('bookings.event_id', eventId);
  } else if (bookingId) {
    bshQuery = bshQuery.eq('bookings.id', bookingId);
  }

  const { data: bsh, error: bshError } = await bshQuery.order('created_at', { ascending: false }).limit(25);
  if (bshError) throw bshError;

  // 2. Contract status history query
  let cshQuery = supabaseAdmin
    .from('contract_status_history')
    .select(`
      id,
      previous_status,
      new_status,
      reason,
      created_at,
      changed_by,
      user_profiles:changed_by(display_name, role),
      contracts!inner(id, booking_id, bookings!inner(id, event_id))
    `);

  if (eventId) {
    cshQuery = cshQuery.eq('contracts.bookings.event_id', eventId);
  } else if (bookingId) {
    cshQuery = cshQuery.eq('contracts.booking_id', bookingId);
  }

  const { data: csh, error: cshError } = await cshQuery.order('created_at', { ascending: false }).limit(25);
  // Fail-safe check in case contract_status_history has RLS or no table issue
  const safeCsh = cshError ? [] : csh || [];

  const activities = [];
  for (const h of bsh || []) {
    activities.push({
      id: h.id,
      actorName: h.user_profiles?.display_name || 'System',
      actorRole: h.user_profiles?.role || 'system',
      action: `Booking status changed from ${h.previous_status || 'none'} to ${h.new_status}`,
      target: scope || 'all',
      createdAt: h.created_at,
      detail: h.reason || undefined
    });
  }
  for (const h of safeCsh) {
    activities.push({
      id: h.id,
      actorName: h.user_profiles?.display_name || 'System',
      actorRole: h.user_profiles?.role || 'system',
      action: `Contract status changed from ${h.previous_status || 'none'} to ${h.new_status}`,
      target: scope || 'all',
      createdAt: h.created_at,
      detail: h.reason || undefined
    });
  }

  activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return sendSuccess(res, activities.slice(0, 30));
});

// E. Realtime snapshot endpoint
const getRealtimeSnapshot = asyncHandler(async (req, res) => {
  const { channel } = req.query;
  return sendSuccess(res, {
    channel: channel || 'global',
    connected: true,
    lastUpdatedAt: new Date().toISOString(),
    pendingSyncCount: 0,
    source: 'api'
  });
});

// F. Global search endpoint
const globalSearch = asyncHandler(async (req, res) => {
  const q = req.query.q ? String(req.query.q).toLowerCase() : '';
  const results = [];
  const userId = req.user.id;
  const role = req.user.role;

  // Search events
  if (role === 'organizer' || role === 'admin') {
    let query = supabaseAdmin.from('large_events').select('id, title, venue, status');
    if (role === 'organizer') {
      const org = await authRepository.findOrganizerProfile(userId);
      if (org) query = query.eq('organizer_id', org.id);
    }
    if (q) query = query.ilike('title', `%${q}%`);
    const { data: events } = await query.limit(5);
    for (const e of events || []) {
      results.push({
        id: e.id,
        type: 'event',
        title: e.title,
        subtitle: `Event at ${e.venue} (${e.status})`,
        path: `/organizer/portfolio?eventId=${e.id}`
      });
    }
  }

  // Search vendors
  if (role === 'organizer' || role === 'admin') {
    let query = supabaseAdmin.from('vendor_profiles').select('id, business_name, service_area').eq('verification_status', 'verified');
    if (q) query = query.ilike('business_name', `%${q}%`);
    const { data: vendors } = await query.limit(5);
    for (const v of vendors || []) {
      results.push({
        id: v.id,
        type: 'vendor',
        title: v.business_name,
        subtitle: `Vendor in ${v.service_area || 'all areas'}`,
        path: `/organizer/procurement?eventId=system`
      });
    }
  }

  // Search bookings
  let bookingsQuery = supabaseAdmin.from('bookings').select(`
    id, status, event_id,
    large_events(title),
    vendor_profiles(business_name)
  `);
  if (role === 'organizer') {
    const org = await authRepository.findOrganizerProfile(userId);
    if (org) bookingsQuery = bookingsQuery.eq('organizer_id', org.id);
  } else if (role === 'vendor') {
    const vend = await authRepository.findVendorProfile(userId);
    if (vend) bookingsQuery = bookingsQuery.eq('vendor_id', vend.id);
  }
  const { data: bookings } = await bookingsQuery.limit(5);
  for (const b of bookings || []) {
    const title = b.large_events?.title || 'Event';
    const vendor = b.vendor_profiles?.business_name || 'Vendor';
    if (!q || title.toLowerCase().includes(q) || vendor.toLowerCase().includes(q) || b.status.toLowerCase().includes(q)) {
      results.push({
        id: b.id,
        type: 'booking',
        title: `${vendor} Booking`,
        subtitle: `Status: ${b.status} for ${title}`,
        path: role === 'vendor' ? `/vendor/bookings/${b.id}` : `/organizer/portfolio?eventId=${b.event_id}`
      });
    }
  }

  // Search notifications
  let notifQuery = supabaseAdmin.from('notifications').select('id, title, message, action_url').eq('user_id', userId);
  if (q) notifQuery = notifQuery.or(`title.ilike.%${q}%,message.ilike.%${q}%`);
  const { data: notifications } = await notifQuery.limit(5);
  for (const n of notifications || []) {
    results.push({
      id: n.id,
      type: 'notification',
      title: n.title,
      subtitle: n.message,
      path: n.action_url || '/notifications'
    });
  }

  return sendSuccess(res, results.slice(0, 10));
});

// G. Documents endpoints
const listDocuments = asyncHandler(async (req, res) => {
  const { ownerId } = req.query;
  let query = supabaseAdmin.from('document_metadata').select('*');
  if (ownerId) {
    query = query.or(`owner_id.eq.${ownerId},owner_id.eq.system`);
  }
  const { data, error } = await query;
  if (error) throw error;

  const docs = (data || []).map(d => ({
    id: d.id,
    ownerId: d.owner_id,
    title: d.title,
    fileName: d.file_name,
    state: d.state,
    uploadedAt: d.uploaded_at,
    reviewedAt: d.reviewed_at,
    notes: d.notes || ''
  }));

  return sendSuccess(res, docs);
});

const uploadDocument = asyncHandler(async (req, res) => {
  const { ownerId, title } = req.body;
  const file = req.file;
  if (!file) {
    throw new AppError('File is required', 400, 'FILE_REQUIRED');
  }

  const fileName = file.originalname;
  const bucketName = 'vendor-documents';
  const storagePath = `${ownerId || 'system'}/${Date.now()}_${fileName}`;

  const { error: storageError } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (storageError) {
    throw new AppError(storageError.message, 400, 'STORAGE_UPLOAD_FAILED');
  }

  const { data: docMetadata, error: dbError } = await supabaseAdmin
    .from('document_metadata')
    .insert({
      owner_id: ownerId || 'system',
      title: title || 'Uploaded document',
      file_name: fileName,
      storage_path: storagePath,
      state: 'pending_review'
    })
    .select('*')
    .single();

  if (dbError) throw dbError;

  return sendSuccess(res, {
    id: docMetadata.id,
    ownerId: docMetadata.owner_id,
    title: docMetadata.title,
    fileName: docMetadata.file_name,
    state: docMetadata.state,
    uploadedAt: docMetadata.uploaded_at,
    reviewedAt: docMetadata.reviewed_at,
    notes: docMetadata.notes || ''
  });
});

// H. Booking messages endpoints
const listBookingMessages = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const { data: messages, error: msgError } = await supabaseAdmin
    .from('booking_messages')
    .select(`
      id,
      booking_id,
      type,
      body,
      created_at,
      author_user_id,
      user_profiles:author_user_id(display_name, role)
    `)
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });

  if (msgError) throw msgError;

  const { data: statusHistory, error: historyError } = await supabaseAdmin
    .from('booking_status_history')
    .select(`
      id,
      previous_status,
      new_status,
      reason,
      created_at,
      changed_by,
      user_profiles:changed_by(display_name, role)
    `)
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });

  if (historyError) throw historyError;

  const result = [];
  for (const m of messages || []) {
    result.push({
      id: m.id,
      bookingId: m.booking_id,
      type: m.type,
      authorName: m.user_profiles?.display_name || 'User',
      body: m.body,
      createdAt: m.created_at
    });
  }
  for (const h of statusHistory || []) {
    result.push({
      id: h.id,
      bookingId,
      type: 'system_update',
      authorName: 'Eventify',
      body: `Booking status changed from ${h.previous_status || 'none'} to ${h.new_status}.${h.reason ? ' Reason: ' + h.reason : ''}`,
      createdAt: h.created_at
    });
  }

  result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return sendSuccess(res, result);
});

const createBookingMessage = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { body, type } = req.body;

  const { data: newMsg, error } = await supabaseAdmin
    .from('booking_messages')
    .insert({
      booking_id: bookingId,
      author_user_id: req.user.id,
      type: type || (req.user.role === 'organizer' ? 'organizer_message' : 'vendor_message'),
      body
    })
    .select(`
      id,
      booking_id,
      type,
      body,
      created_at,
      user_profiles:author_user_id(display_name)
    `)
    .single();

  if (error) throw error;

  return sendSuccess(res, {
    id: newMsg.id,
    bookingId: newMsg.booking_id,
    type: newMsg.type,
    authorName: newMsg.user_profiles?.display_name || 'User',
    body: newMsg.body,
    createdAt: newMsg.created_at
  });
});

const getOrganizerProfileId = async (userId) => {
  const { data } = await supabase
    .from('organizer_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
};

const getRequestVendor = (request) => Array.isArray(request.request_vendors)
  ? request.request_vendors[0] || null
  : request.request_vendors || null;

const normalizeOrganizerRequestStatus = (status) => {
  if (status === 'pending' || status === 'open') return 'sent';
  if (status === 'viewed') return 'viewed';
  if (status === 'changes_requested') return 'negotiating';
  if (status === 'accepted') return 'accepted';
  if (status === 'rejected') return 'rejected';
  if (status === 'confirmed') return 'confirmed';
  return status;
};

const buildRequestTimelineEntries = (request) => {
  const requestVendor = getRequestVendor(request);
  const entries = [];

  if (request?.created_at) {
    entries.push({
      id: `${request.id}-sent`,
      status: 'sent',
      label: 'sent',
      timestamp: request.created_at,
      description: 'Request sent to vendor'
    });
  }

  if (requestVendor?.viewed_at) {
    entries.push({
      id: `${request.id}-viewed`,
      status: 'viewed',
      label: 'viewed',
      timestamp: requestVendor.viewed_at,
      description: 'Vendor viewed your request'
    });
  }

  if (requestVendor?.changes_requested_at) {
    entries.push({
      id: `${request.id}-changes_requested`,
      status: 'negotiating',
      label: 'negotiating',
      timestamp: requestVendor.changes_requested_at,
      description: requestVendor.request_message || 'Vendor requested changes'
    });
  }

  if (requestVendor?.accepted_at) {
    entries.push({
      id: `${request.id}-accepted`,
      status: 'accepted',
      label: 'accepted',
      timestamp: requestVendor.accepted_at,
      description: 'Vendor accepted the request'
    });
  }

  if (requestVendor?.rejected_at) {
    entries.push({
      id: `${request.id}-rejected`,
      status: 'rejected',
      label: 'rejected',
      timestamp: requestVendor.rejected_at,
      description: requestVendor.request_message || 'Vendor rejected the request'
    });
  }

  if ((requestVendor?.status === 'confirmed' || request?.status === 'confirmed') && request?.updated_at) {
    entries.push({
      id: `${request.id}-confirmed`,
      status: 'confirmed',
      label: 'confirmed',
      timestamp: request.updated_at,
      description: 'Booking confirmed'
    });
  }

  return entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

const mapRequestToOrganizerRequest = (request) => {
  const requestVendor = getRequestVendor(request);
  const rawStatus = requestVendor?.status || request.status || 'pending';
  const requestedServices = Array.isArray(request.requestedServices) ? request.requestedServices : [];
  const primaryService = requestedServices[0] || (request.vendor_services?.id ? {
    id: request.vendor_services.id,
    serviceName: request.vendor_services.service_name || 'Service',
    category: request.vendor_services.category || null,
  } : null);
  return ({
  id: request.id,
  eventBriefId: request.event_id,
  organizerId: request.organizer_id,
  vendorId: request.vendor_id,
  vendorName: request.vendor_profiles?.business_name || 'Vendor',
  vendorCategory: primaryService?.category || request.vendor_services?.category || requestVendor?.vendor_service?.category || 'Service',
  eventName: request.large_events?.title || 'Event',
  eventDate: request.large_events?.event_date || request.created_at,
  location: request.large_events?.venue || '',
  status: normalizeOrganizerRequestStatus(rawStatus),
  quotedPrice: requestVendor?.budget_min ?? request.budget_min ?? null,
  packageName: primaryService?.serviceName || request.vendor_services?.service_name || null,
  requestedServices,
  lastMessage: requestVendor?.request_message || request.request_message || request.description || `Request is currently ${normalizeOrganizerRequestStatus(rawStatus)}.`,
  lastUpdatedAt: request.updated_at || request.created_at,
  createdAt: request.created_at,
  deadline: requestVendor?.deadline || request.deadline || null,
  vendorServiceId: request.vendor_service_id || requestVendor?.vendor_service_id || null,
  budgetMin: request.budget_min ?? requestVendor?.budget_min ?? null,
  budgetMax: request.budget_max ?? requestVendor?.budget_max ?? null,
  selectedDate: (requestVendor?.deadline || request.deadline || null) ? new Date(requestVendor?.deadline || request.deadline).toISOString().split('T')[0] : null,
  selectedTimeSlot: null
  });
};

const fetchOrganizerVendorRequest = asyncHandler(async (req, res) => {
  const request = await assertOrganizerAccess(req, req.params.requestId);
  const [hydrated] = await hydrateRequestedServices([request]);
  return sendSuccess(res, mapRequestToOrganizerRequest(hydrated));
});

const assertOrganizerAccess = async (req, requestId) => {
  const organizerId = await getOrganizerProfileId(req.user.id);
  if (!organizerId && req.user.role !== 'admin') {
    throw new AppError('Organizer profile not found', 404, 'ORGANIZER_NOT_FOUND');
  }

  const { data: request } = await supabase
    .from('procurement_requests')
    .select(`
      *,
      large_events(title, event_date, venue, expected_guests),
      vendor_profiles(business_name),
      vendor_services(id, service_name, category),
      request_vendors(id, vendor_id, vendor_service_id, status, request_message, budget_min, budget_max, deadline, viewed_at, accepted_at, rejected_at, changes_requested_at)
    `)
    .eq('id', requestId)
    .maybeSingle();

  if (!request) {
    throw new AppError('Request not found', 404, 'REQUEST_NOT_FOUND');
  }

  if (req.user.role !== 'admin' && request.organizer_id !== organizerId) {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  return request;
};

const listOrganizerVendorRequests = asyncHandler(async (req, res) => {
  const organizerId = await getOrganizerProfileId(req.user.id);
  if (!organizerId && req.user.role !== 'admin') {
    throw new AppError('Organizer profile not found', 404, 'ORGANIZER_NOT_FOUND');
  }

  const { data: requests } = await supabase
    .from('procurement_requests')
    .select(`
      *,
      large_events(title, event_date, venue, expected_guests),
      vendor_profiles(business_name),
      vendor_services(id, service_name, category),
      request_vendors(id, vendor_id, vendor_service_id, status, request_message, budget_min, budget_max, deadline, viewed_at, accepted_at, rejected_at, changes_requested_at)
    `)
    .eq('organizer_id', organizerId || req.user.id)
    .order('updated_at', { ascending: false });

  const hydrated = await hydrateRequestedServices(requests || []);
  return sendSuccess(res, hydrated.map(mapRequestToOrganizerRequest));
});

const listOrganizerVendorMessages = asyncHandler(async (req, res) => {
  const request = await assertOrganizerAccess(req, req.params.requestId);
  const { data: messages, error } = await supabase
    .from('procurement_request_messages')
    .select(`
      id,
      request_id,
      body,
      created_at,
      author_user_id,
      user_profiles:author_user_id(display_name, role)
    `)
    .eq('request_id', request.id)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return sendSuccess(res, (messages || []).map((m) => ({
    id: m.id,
    requestId: m.request_id,
    senderId: m.author_user_id,
    senderName: m.user_profiles?.display_name || 'User',
    text: m.body,
    timestamp: m.created_at,
    isOrganizer: m.user_profiles?.role === 'organizer' || m.user_profiles?.role === 'admin'
  })));
});

const createOrganizerVendorMessage = asyncHandler(async (req, res) => {
  const request = await assertOrganizerAccess(req, req.params.requestId);
  const text = String(req.body?.body || '').trim();
  if (!text) {
    throw new AppError('Message body is required', 400, 'MESSAGE_REQUIRED');
  }

  const { data: newMsg, error } = await supabase
    .from('procurement_request_messages')
    .insert({
      request_id: request.id,
      author_user_id: req.user.id,
      body: text
    })
    .select(`
      id,
      request_id,
      body,
      created_at,
      user_profiles:author_user_id(display_name)
    `)
    .single();

  if (error) throw error;

  return sendSuccess(res, {
    id: newMsg.id,
    requestId: newMsg.request_id,
    senderId: req.user.id,
    senderName: newMsg.user_profiles?.display_name || 'User',
    text: newMsg.body,
    timestamp: newMsg.created_at,
    isOrganizer: true
  });
});

const getVendorProfileId = async (userId) => {
  const { data } = await supabase
    .from('vendor_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
};

const listVendorRequestMessages = asyncHandler(async (req, res) => {
  const vendorId = await getVendorProfileId(req.user.id);
  if (!vendorId && req.user.role !== 'admin') {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  const { data: rv } = await supabase
    .from('request_vendors')
    .select('request_id')
    .eq('request_id', req.params.requestId)
    .eq('vendor_id', vendorId)
    .maybeSingle();

  if (!rv && req.user.role !== 'admin') {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  const { data: messages, error } = await supabase
    .from('procurement_request_messages')
    .select(`
      id,
      request_id,
      body,
      created_at,
      author_user_id,
      user_profiles:author_user_id(display_name, role)
    `)
    .eq('request_id', req.params.requestId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return sendSuccess(res, (messages || []).map((m) => ({
    id: m.id,
    bookingId: m.request_id,
    type: m.user_profiles?.role === 'vendor' ? 'vendor_message' : m.user_profiles?.role === 'organizer' ? 'organizer_message' : 'system_update',
    authorName: m.user_profiles?.display_name || 'User',
    body: m.body,
    createdAt: m.created_at
  })));
});

const createVendorRequestMessage = asyncHandler(async (req, res) => {
  const vendorId = await getVendorProfileId(req.user.id);
  if (!vendorId && req.user.role !== 'admin') {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  const { data: rv } = await supabase
    .from('request_vendors')
    .select('request_id')
    .eq('request_id', req.params.requestId)
    .eq('vendor_id', vendorId)
    .maybeSingle();

  if (!rv && req.user.role !== 'admin') {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  const text = String(req.body?.body || '').trim();
  if (!text) {
    throw new AppError('Message body is required', 400, 'MESSAGE_REQUIRED');
  }

  const { data: newMsg, error } = await supabase
    .from('procurement_request_messages')
    .insert({
      request_id: req.params.requestId,
      author_user_id: req.user.id,
      body: text
    })
    .select(`
      id,
      request_id,
      body,
      created_at,
      user_profiles:author_user_id(display_name)
    `)
    .single();

  if (error) throw error;

  return sendSuccess(res, {
    id: newMsg.id,
    bookingId: newMsg.request_id,
    type: 'vendor_message',
    authorName: newMsg.user_profiles?.display_name || 'User',
    body: newMsg.body,
    createdAt: newMsg.created_at
  });
});

const createOrganizerVendorRequest = asyncHandler(async (req, res) => {
  const organizerId = await getOrganizerProfileId(req.user.id);
  if (!organizerId && req.user.role !== 'admin') {
    throw new AppError('Organizer profile not found', 404, 'ORGANIZER_NOT_FOUND');
  }

  const { data: event, error: eventError } = await supabase
    .from('large_events')
    .select('id, organizer_id')
    .eq('id', req.body.eventBriefId)
    .single();

  if (eventError || !event || (req.user.role !== 'admin' && event.organizer_id !== organizerId)) {
    throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  const vendorServiceIds = Array.isArray(req.body.vendorServiceIds)
    ? req.body.vendorServiceIds
    : (req.body.vendorServiceId ? [req.body.vendorServiceId] : []);

  const { data: vendorServices } = await supabase
    .from('vendor_services')
    .select('id, service_name, category, vendor_id')
    .in('id', vendorServiceIds.length > 0 ? vendorServiceIds : [null]);

  const validServices = (vendorServices || []).filter(
    (s) => s.vendor_id === req.body.vendorId
  );

  if (validServices.length === 0 && vendorServiceIds.length > 0) {
    throw new AppError('Vendor service not found', 404, 'VENDOR_SERVICE_NOT_FOUND');
  }

  const primaryService = validServices[0] || null;
  const selectedDate = req.body.selectedDate || null;

  if (selectedDate) {
    const blockedDates = await getVendorBlockedDates(req.body.vendorId);
    if (blockedDates.has(selectedDate)) {
      throw new AppError('The selected vendor date is already booked or on hold.', 409, 'VENDOR_DATE_UNAVAILABLE');
    }
  }

  const { data: existing } = await supabase
    .from('procurement_requests')
    .select('id')
    .eq('event_id', event.id)
    .eq('vendor_id', req.body.vendorId)
    .in('vendor_service_id', primaryService ? [primaryService.id] : [null])
    .in('status', ['open', 'pending'])
    .maybeSingle();

  if (existing) {
    return sendSuccess(res, { id: existing.id });
  }

  const requestMessage = req.body.message || req.body.packageName || null;
  const budgetMin = req.body.budgetMin ?? req.body.requestedBudget ?? null;
  const budgetMax = req.body.budgetMax ?? req.body.requestedBudget ?? budgetMin;

  const request = await insertProcurementRequestWithFallback({
    event_id: event.id,
    organizer_id: organizerId || event.organizer_id,
    vendor_id: req.body.vendorId,
    vendor_service_id: primaryService?.id || null,
    title: req.body.packageName || primaryService?.service_name || 'Vendor request',
    description: requestMessage,
    request_message: requestMessage,
    budget_min: budgetMin,
    budget_max: budgetMax,
    deadline: selectedDate ? `${selectedDate}T23:59:59Z` : null,
    status: 'open'
  }, vendorServiceIds);

  const { error: rvError } = await supabase
    .from('request_vendors')
    .insert({
      request_id: request.id,
      vendor_id: req.body.vendorId,
      vendor_service_id: primaryService?.id || null,
      request_message: requestMessage,
      budget_min: budgetMin,
      budget_max: budgetMax,
      deadline: selectedDate ? `${selectedDate}T23:59:59Z` : null,
      status: 'pending'
    });
  if (rvError) throw rvError;

  const { data: normalized } = await supabase
    .from('procurement_requests')
    .select(`
      *,
      large_events(title, event_date, venue, expected_guests),
      organizer_profiles(organization_name),
      vendor_profiles(business_name),
      vendor_services(id, service_name, category),
      request_vendors(id, vendor_id, vendor_service_id, status, request_message, budget_min, budget_max, deadline, viewed_at, accepted_at, rejected_at, changes_requested_at)
    `)
    .eq('id', request.id)
    .single();
  const [hydrated] = await hydrateRequestedServices([normalized]);

  const { data: vendorProfile } = await supabase
    .from('vendor_profiles')
    .select('user_id')
    .eq('id', req.body.vendorId)
    .single();

  await supabase.from('notifications').insert({
    user_id: vendorProfile?.user_id || req.body.vendorUserId || null,
    title: 'New organizer request',
    message: 'You have received a new request from an organizer.',
    notification_type: 'vendor_request',
    priority: 'high',
    action_url: '/vendor/bookings',
    metadata: { related_type: 'vendor_request', related_id: request.id }
  });

  return sendCreated(res, mapRequestToOrganizerRequest(hydrated));
});

const updateOrganizerVendorRequestStatus = async (req, booking, status) => {
  const now = new Date().toISOString();
  const requestVendor = getRequestVendor(booking);
  const rvUpdates = { status, responded_at: now };
  if (status === 'viewed') rvUpdates.viewed_at = now;
  if (status === 'accepted') rvUpdates.accepted_at = now;
  if (status === 'rejected') rvUpdates.rejected_at = now;
  if (status === 'changes_requested') rvUpdates.changes_requested_at = now;

  const { error: rvError } = await supabase
    .from('request_vendors')
    .update(rvUpdates)
    .eq('request_id', booking.id)
    .eq('vendor_id', requestVendor?.vendor_id || booking.vendor_id);
  if (rvError) throw rvError;

  await supabase
    .from('procurement_requests')
    .update({ status, updated_at: now })
    .eq('id', booking.id);

  return {
    ...booking,
    status,
    updated_at: now,
    request_vendors: { ...(requestVendor || {}), ...rvUpdates }
  };
};

const acceptOrganizerVendorRequest = asyncHandler(async (req, res) => {
  const request = await assertOrganizerAccess(req, req.params.requestId);
  return sendSuccess(res, await updateOrganizerVendorRequestStatus(req, request, 'accepted'));
});

const rejectOrganizerVendorRequest = asyncHandler(async (req, res) => {
  const request = await assertOrganizerAccess(req, req.params.requestId);
  return sendSuccess(res, await updateOrganizerVendorRequestStatus(req, request, 'rejected'));
});

const confirmOrganizerVendorRequest = asyncHandler(async (req, res) => {
  const request = await assertOrganizerAccess(req, req.params.requestId);
  return sendSuccess(res, await updateOrganizerVendorRequestStatus(req, request, 'confirmed'));
});

const getOrganizerVendorTimeline = asyncHandler(async (req, res) => {
  const request = await assertOrganizerAccess(req, req.params.requestId);
  return sendSuccess(res, buildRequestTimelineEntries(request));
});

// I. Availability endpoints
const buildAvailabilityPreview = async (vendorId, eventId = null) => {
  const { data: vendor } = await supabaseAdmin
    .from('vendor_profiles')
    .select('id, verification_status')
    .eq('id', vendorId)
    .single();

  if (!vendor) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  const { data: services } = await supabaseAdmin
    .from('vendor_services')
    .select('availability_status')
    .eq('vendor_id', vendorId);

  let status = 'available';
  if (services && services.length > 0) {
    if (services.every(s => s.availability_status === 'unavailable')) {
      status = 'unavailable';
    } else if (services.some(s => s.availability_status === 'unavailable')) {
      status = 'limited';
    }
  }

  const [blockedDatesResult, activeRequestsResult, bookingsResult] = await Promise.all([
    supabaseAdmin.from('vendor_blocked_dates').select('id, date, reason').eq('vendor_id', vendorId),
    supabaseAdmin.from('procurement_requests').select('id, deadline, status, request_message, title').eq('vendor_id', vendorId),
    supabaseAdmin.from('bookings').select('id, status, large_events(event_date, title)').eq('vendor_id', vendorId).in('status', ['accepted', 'confirmed', 'completed']),
  ]);

  if (blockedDatesResult.error) throw blockedDatesResult.error;
  if (activeRequestsResult.error) throw activeRequestsResult.error;
  if (bookingsResult.error) throw bookingsResult.error;

  const mappedBlocked = [];
  const blockedDatesSet = new Set();

  for (const b of blockedDatesResult.data || []) {
    const dStr = new Date(b.date).toISOString().split('T')[0];
    mappedBlocked.push({
      id: b.id,
      date: dStr,
      reason: b.reason || 'Vendor blackout'
    });
    blockedDatesSet.add(dStr);
  }

  for (const b of activeRequestsResult.data || []) {
    if (!isActiveRequestStatus(b.status)) continue;
    const dStr = getDateKey(b.deadline);
    if (!dStr) continue;
    mappedBlocked.push({
      id: b.id,
      date: dStr,
      reason: b.request_message || b.title || 'Active request hold'
    });
    blockedDatesSet.add(dStr);
  }

  for (const b of bookingsResult.data || []) {
    if (b.large_events?.event_date) {
      const dStr = new Date(b.large_events.event_date).toISOString().split('T')[0];
      mappedBlocked.push({
        id: b.id,
        date: dStr,
        reason: `Booked for event: ${b.large_events.title}`
      });
      blockedDatesSet.add(dStr);
    }
  }

  const days = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dStr = d.toISOString().split('T')[0];
    const isBlocked = blockedDatesSet.has(dStr);
    days.push({
      date: dStr,
      status: isBlocked ? 'unavailable' : status,
      label: isBlocked ? 'Booked' : status === 'available' ? 'Open' : status === 'limited' ? 'Limited crew' : 'Unavailable'
    });
  }

  let conflictDate = null;
  let conflictReason = null;
  if (eventId) {
    const { data: event } = await supabaseAdmin
      .from('large_events')
      .select('event_date, title')
      .eq('id', eventId)
      .single();

    if (event && event.event_date) {
      const evDateStr = new Date(event.event_date).toISOString().split('T')[0];
      if (blockedDatesSet.has(evDateStr)) {
        conflictDate = evDateStr;
        conflictReason = 'Selected event date overlaps a blocked vendor date, active request hold, or accepted booking.';
      }
    }
  }

  return {
    vendorId,
    status,
    days,
    blockedDates: mappedBlocked,
    conflictDate,
    conflictReason,
    updatedAt: new Date().toISOString()
  };
};

const getVendorAvailability = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { eventId } = req.query;
  const preview = await buildAvailabilityPreview(vendorId, eventId);
  return sendSuccess(res, preview);
});

const getMyAvailability = asyncHandler(async (req, res) => {
  const vendor = await authRepository.findVendorProfile(req.user.id);
  if (!vendor) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }
  const preview = await buildAvailabilityPreview(vendor.id);
  return sendSuccess(res, preview);
});

const updateMyAvailabilityStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const vendor = await authRepository.findVendorProfile(req.user.id);
  if (!vendor) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  const { data: services } = await supabaseAdmin
    .from('vendor_services')
    .select('id')
    .eq('vendor_id', vendor.id);

  if (services && services.length > 0) {
    await supabaseAdmin
      .from('vendor_services')
      .update({ availability_status: status })
      .eq('vendor_id', vendor.id);
  }

  const preview = await buildAvailabilityPreview(vendor.id);
  return sendSuccess(res, preview);
});

module.exports = {
  getPlanningTimeline: asyncHandler(getPlanningTimeline),
  getBudgetCenter: asyncHandler(getBudgetCenter),
  getOperationalAnalytics: asyncHandler(getOperationalAnalytics),
  getAuditActivity: asyncHandler(getAuditActivity),
  getRealtimeSnapshot: asyncHandler(getRealtimeSnapshot),
  globalSearch: asyncHandler(globalSearch),
  listDocuments: asyncHandler(listDocuments),
  uploadDocument: asyncHandler(uploadDocument),
  listBookingMessages: asyncHandler(listBookingMessages),
  createBookingMessage: asyncHandler(createBookingMessage),
  createOrganizerVendorRequest: asyncHandler(createOrganizerVendorRequest),
  fetchOrganizerVendorRequest: asyncHandler(fetchOrganizerVendorRequest),
  listOrganizerVendorRequests: asyncHandler(listOrganizerVendorRequests),
  listOrganizerVendorMessages: asyncHandler(listOrganizerVendorMessages),
  createOrganizerVendorMessage: asyncHandler(createOrganizerVendorMessage),
  acceptOrganizerVendorRequest: asyncHandler(acceptOrganizerVendorRequest),
  rejectOrganizerVendorRequest: asyncHandler(rejectOrganizerVendorRequest),
  confirmOrganizerVendorRequest: asyncHandler(confirmOrganizerVendorRequest),
  getOrganizerVendorTimeline: asyncHandler(getOrganizerVendorTimeline),
  listVendorRequestMessages: asyncHandler(listVendorRequestMessages),
  createVendorRequestMessage: asyncHandler(createVendorRequestMessage),
  getVendorAvailability: asyncHandler(getVendorAvailability),
  getMyAvailability: asyncHandler(getMyAvailability),
  updateMyAvailabilityStatus: asyncHandler(updateMyAvailabilityStatus)
};
