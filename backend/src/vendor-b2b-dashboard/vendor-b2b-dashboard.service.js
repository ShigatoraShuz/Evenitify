const AppError = require('../shared/utils/appError');
const { supabase, supabaseAdmin } = require('../config/supabase');
const vendorRepository = require('./vendor-b2b-dashboard.repository');
const logger = require('../shared/utils/logger');

const REQUEST_SIZE_GUEST_LIMIT = 20;

function getBookingGuestCount(item) {
  const rawGuests = item?.large_events?.expected_guests;
  if (rawGuests == null || rawGuests === '') return null;

  const guests = Number(rawGuests);
  if (!Number.isFinite(guests) || guests <= 0) return null;

  return guests;
}

function matchesRequestTypeFilter(item, requestTypeFilter) {
  if (!requestTypeFilter || requestTypeFilter === 'all') return true;

  const guestCount = getBookingGuestCount(item);
  if (guestCount == null) return false;

  if (requestTypeFilter === 'large_event') {
    return guestCount > REQUEST_SIZE_GUEST_LIMIT;
  }

  if (requestTypeFilter === 'personal') {
    return guestCount <= REQUEST_SIZE_GUEST_LIMIT;
  }

  return true;
}

async function getProfile(actor) {
  const profile = await vendorRepository.findByUserId(actor.id);
  if (!profile) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  const services = await vendorRepository.listServices(profile.id);
  return {
    businessName: profile.business_name,
    serviceArea: profile.service_area,
    businessDescription: profile.business_description || null,
    phone: profile.contact_number,
    verificationStatus: profile.verification_status,
    isVerified: profile.verification_status === 'verified',
    rating: profile.rating,
    services
  };
}

async function updateProfile(actor, payload) {
  const profile = await vendorRepository.findByUserId(actor.id);
  if (!profile) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  return vendorRepository.updateProfile(profile.id, payload);
}

async function listServices(actor) {
  const profile = await vendorRepository.findByUserId(actor.id);
  if (!profile) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  return vendorRepository.listServices(profile.id);
}

async function uploadServiceImage(actor, file) {
  const profile = await vendorRepository.findByUserId(actor.id);
  if (!profile) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  const fileName = `services/${profile.id}/${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  const { data, error } = await supabaseAdmin.storage
    .from('public-assets')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    logger.error('Supabase upload error', { error });
    throw new AppError('Failed to upload image', 500, 'UPLOAD_FAILED');
  }

  const { data: publicData } = supabaseAdmin.storage
    .from('public-assets')
    .getPublicUrl(fileName);

  return publicData.publicUrl;
}

async function createService(actor, payload) {
  const profile = await vendorRepository.findByUserId(actor.id);
  if (!profile) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  return vendorRepository.createService(profile.id, payload);
}

async function updateService(actor, serviceId, payload) {
  const profile = await vendorRepository.findByUserId(actor.id);
  if (!profile) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  const updated = await vendorRepository.updateService(serviceId, profile.id, payload);
  if (!updated) {
    throw new AppError('Service not found or access denied', 404, 'SERVICE_NOT_FOUND');
  }

  return updated;
}

async function deleteService(actor, serviceId) {
  const profile = await vendorRepository.findByUserId(actor.id);
  if (!profile) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  const deleted = await vendorRepository.deleteService(serviceId, profile.id);
  if (!deleted) {
    throw new AppError('Service not found or access denied', 404, 'SERVICE_NOT_FOUND');
  }

  return { id: deleted.id, deleted: true };
}

async function searchVendors(filters) {
  const vendors = await vendorRepository.searchVendors(filters);

  if (vendors.length === 0) return [];

  const vendorIds = vendors.map((v) => v.id);
  const services = await vendorRepository.searchVendorServices(
    vendorIds,
    filters.category,
    filters.minBudget,
    filters.maxBudget,
    filters.sortBy
  );

  const vendorMap = {};
  for (const vendor of vendors) {
    vendorMap[vendor.id] = { ...vendor, services: [] };
  }

  for (const service of services) {
    if (vendorMap[service.vendor_id]) {
      vendorMap[service.vendor_id].services.push(service);
    }
  }

  return Object.values(vendorMap);
}

async function getVendorProfile(vendorId) {
  const vendor = await vendorRepository.getVendorWithServices(vendorId);
  if (!vendor) {
    throw new AppError('Vendor not found', 404, 'VENDOR_NOT_FOUND');
  }

  return vendor;
}

const VALID_TRANSITIONS = {
  pending: ['accepted', 'rejected', 'changes_requested']
};

function getRequestVendor(request) {
  return Array.isArray(request?.request_vendors)
    ? request.request_vendors[0] || null
    : request?.request_vendors || null;
}

function buildVendorIds(profile, actor) {
  return [...new Set([profile?.id, actor?.id].filter(Boolean))];
}

function requestBelongsToVendor(request, vendorIds) {
  const requestVendorId = getRequestVendor(request)?.vendor_id;
  return vendorIds.includes(requestVendorId) || vendorIds.includes(request?.vendor_id);
}

function bookingBelongsToVendor(booking, vendorIds) {
  return vendorIds.includes(booking?.vendor_id);
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

function getVendorServiceIds(request) {
  const fromColumn = parseVendorServiceIds(request?.vendor_service_ids);
  if (fromColumn.length > 0) return fromColumn;

  const fallback = request?.vendor_service_id || request?.request_vendors?.vendor_service_id || request?.vendor_services?.id;
  return fallback ? [String(fallback)] : [];
}

async function hydrateRequestedServices(requests) {
  const list = Array.isArray(requests) ? requests : [requests];
  const serviceIds = [...new Set(list.flatMap((request) => getVendorServiceIds(request)))];

  const { data: services } = serviceIds.length > 0
    ? await supabase
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
    const requestedServiceIds = getVendorServiceIds(request);
    const requestedServices = requestedServiceIds
      .map((serviceId) => serviceMap.get(serviceId))
      .filter(Boolean);

    const fallbackServices = request?.event_requirements?.category
      ? [{
          id: request.requirement_id || request.id,
          serviceName: request.event_requirements.category,
          category: request.event_requirements.category,
        }]
      : [];

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
          : fallbackServices
      ),
    };
  });
}

function mapRequestToBookingShape(request) {
  const requestVendor = getRequestVendor(request);
  const requestedServices = Array.isArray(request.requestedServices) ? request.requestedServices : [];
  return {
    id: request.id,
    event_id: request.event_id,
    requirement_id: request.vendor_service_id || requestVendor?.vendor_service_id || null,
    vendor_id: request.vendor_id,
    organizer_id: request.organizer_id,
    booking_type: 'B2B',
    status: requestVendor?.status || request.status || 'pending',
    requested_budget: requestVendor?.budget_min ?? request.budget_min ?? null,
    notes: request.request_message || request.description || null,
    requested_at: request.created_at,
    updated_at: request.updated_at,
    large_events: request.large_events,
    event_requirements: {
      category: requestedServices[0]?.category || request.vendor_services?.category || 'Service',
      quantity: 1
    },
    vendor_profiles: request.vendor_profiles,
    organizer_profiles: request.organizer_profiles,
    request_vendors: requestVendor,
    vendor_services: request.vendor_services,
    requestedServices
  };
}

function mapDirectBookingToBookingShape(booking) {
  const requestedServices = Array.isArray(booking.requestedServices) ? booking.requestedServices : [];
  return {
    id: booking.id,
    event_id: booking.event_id,
    requirement_id: booking.requirement_id,
    vendor_id: booking.vendor_id,
    organizer_id: booking.organizer_id,
    booking_type: booking.booking_type || 'B2B',
    status: booking.status || 'pending',
    requested_budget: booking.requested_budget ?? null,
    notes: booking.notes || null,
    requested_at: booking.requested_at,
    updated_at: booking.updated_at || booking.requested_at,
    large_events: booking.large_events,
    event_requirements: booking.event_requirements,
    vendor_profiles: booking.vendor_profiles,
    organizer_profiles: booking.organizer_profiles,
    requestedServices
  };
}

function mapRequestToNormalized(request) {
  const vendorRequest = getRequestVendor(request) || {};
  const event = request.large_events || {};
  const vendor = request.vendor_profiles || {};
  const organizer = request.organizer_profiles || {};
  const service = request.vendor_services || {};
  const requestedServices = Array.isArray(request.requestedServices) ? request.requestedServices : [];
  return {
    requestId: request.id,
    requestVendorId: vendorRequest.id || null,
    eventId: request.event_id,
    eventName: event.title || 'Event',
    eventType: request.request_type || 'large_event',
    eventStartDate: event.event_date || null,
    eventEndDate: null,
    organizerId: request.organizer_id,
    organizerName: organizer.organization_name || 'Organizer',
    organizerUserId: organizer.user_id || null,
    vendorId: request.vendor_id,
    vendorName: vendor.business_name || 'Vendor',
    vendorUserId: vendor.user_id || null,
    vendorServiceId: request.vendor_service_id || vendorRequest.vendor_service_id || service.id || null,
    serviceName: requestedServices[0]?.serviceName || service.service_name || null,
    serviceCategory: requestedServices[0]?.category || service.category || null,
    requestedServices,
    requestMessage: request.request_message || request.description || null,
    budgetMin: vendorRequest.budget_min ?? request.budget_min ?? null,
    budgetMax: vendorRequest.budget_max ?? request.budget_max ?? null,
    deadline: vendorRequest.deadline || request.deadline || null,
    status: vendorRequest.status || request.status || 'pending',
    sentAt: request.created_at,
    viewedAt: vendorRequest.viewed_at || null,
    respondedAt: vendorRequest.responded_at || null,
    createdAt: request.created_at,
    updatedAt: request.updated_at || request.created_at
  };
}

async function notifyOrganizerForRequest(request, notificationType, title, message) {
  const organizerUserId = request.organizer_profiles?.user_id || null;
  if (!organizerUserId) return;
  const { error } = await supabase.from('notifications').insert({
    user_id: organizerUserId,
    booking_id: null,
    title,
    message,
    notification_type: notificationType,
    priority: 'high',
    action_url: `/organizer/vendor-status?requestId=${request.id}`,
    metadata: {
      related_type: 'vendor_request',
      related_id: request.id
    }
  });
  if (error) throw error;
}

async function loadRequest(actor, requestId) {
  const profile = await vendorRepository.findByUserId(actor.id);
  if (!profile) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }
  const vendorIds = buildVendorIds(profile, actor);
  const request = await vendorRepository.findRequestById(requestId);
  if (!request) {
    throw new AppError('Request not found', 404, 'REQUEST_NOT_FOUND');
  }
  if (!requestBelongsToVendor(request, vendorIds)) {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }
  return { profile, request, vendorIds };
}

async function listB2BBookings(actor, statusFilter, requestTypeFilter) {
  const profile = await vendorRepository.findByUserId(actor.id);
  if (!profile) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }
  const vendorIds = buildVendorIds(profile, actor);

  const merged = await vendorRepository.listVendorB2BRequests(vendorIds, statusFilter, requestTypeFilter);
  const hydrated = await hydrateRequestedServices(merged);
  const normalized = hydrated.map((item) => (
    Object.prototype.hasOwnProperty.call(item, 'requirement_id')
      ? mapDirectBookingToBookingShape(item)
      : mapRequestToBookingShape(item)
  ));

  const seen = new Set();
  return normalized.filter((item) => {
    if (!matchesRequestTypeFilter(item, requestTypeFilter)) {
      return false;
    }

    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

async function getBookingDetail(actor, bookingId) {
  const profile = await vendorRepository.findByUserId(actor.id);
  if (!profile) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }
  const vendorIds = buildVendorIds(profile, actor);

  const request = await vendorRepository.findRequestById(bookingId);
  if (request && requestBelongsToVendor(request, vendorIds)) {
    const [hydrated] = await hydrateRequestedServices([request]);
    return mapRequestToBookingShape(hydrated);
  }

  const directBooking = await vendorRepository.findBookingById(bookingId);
  if (directBooking && bookingBelongsToVendor(directBooking, vendorIds)) {
    const [hydrated] = await hydrateRequestedServices([directBooking]);
    return mapDirectBookingToBookingShape(hydrated);
  }

  throw new AppError('Request not found', 404, 'REQUEST_NOT_FOUND');
}

async function updateBookingStatus(actor, bookingId, payload) {
  const { request } = await loadRequest(actor, bookingId);
  const requestVendor = getRequestVendor(request);
  const currentStatus = requestVendor?.status || request.status || 'pending';
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(payload.status)) {
    throw new AppError(
      `Cannot transition from '${currentStatus}' to '${payload.status}'`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }

  await vendorRepository.updateRequestVendorStatus(
    bookingId,
    requestVendor?.vendor_id || request.vendor_id,
    payload.status,
    payload.reason
  );
  const [hydrated] = await hydrateRequestedServices([await vendorRepository.findRequestById(bookingId)]);
  return mapRequestToNormalized(hydrated);
}

async function viewRequest(actor, requestId) {
  const { request } = await loadRequest(actor, requestId);
  const requestVendor = getRequestVendor(request);
  const current = requestVendor?.status || request.status || 'pending';
  if (current === 'pending') {
    await vendorRepository.updateRequestVendorStatus(requestId, requestVendor?.vendor_id || request.vendor_id, 'viewed');
    await notifyOrganizerForRequest(request, 'request_viewed', 'Request viewed', `A vendor reviewed your request for ${request.large_events?.title || 'an event'}.`);
  } else if (current !== 'viewed' && current !== 'accepted' && current !== 'rejected' && current !== 'changes_requested') {
    await vendorRepository.updateRequestVendorStatus(requestId, requestVendor?.vendor_id || request.vendor_id, 'viewed');
    await notifyOrganizerForRequest(request, 'request_viewed', 'Request viewed', `A vendor reviewed your request for ${request.large_events?.title || 'an event'}.`);
  }
  const [hydrated] = await hydrateRequestedServices([await vendorRepository.findRequestById(requestId)]);
  return mapRequestToNormalized(hydrated);
}

async function acceptRequest(actor, requestId) {
  const { request } = await loadRequest(actor, requestId);
  const requestVendor = getRequestVendor(request);
  await vendorRepository.updateRequestVendorStatus(requestId, requestVendor?.vendor_id || request.vendor_id, 'accepted');
  await notifyOrganizerForRequest(request, 'request_accepted', 'Request accepted', `Your request for ${request.large_events?.title || 'an event'} was accepted.`);
  const [hydrated] = await hydrateRequestedServices([await vendorRepository.findRequestById(requestId)]);
  return mapRequestToNormalized(hydrated);
}

async function rejectRequest(actor, requestId) {
  const { request } = await loadRequest(actor, requestId);
  const requestVendor = getRequestVendor(request);
  await vendorRepository.updateRequestVendorStatus(requestId, requestVendor?.vendor_id || request.vendor_id, 'rejected');
  await notifyOrganizerForRequest(request, 'request_rejected', 'Request rejected', `Your request for ${request.large_events?.title || 'an event'} was rejected.`);
  const [hydrated] = await hydrateRequestedServices([await vendorRepository.findRequestById(requestId)]);
  return mapRequestToNormalized(hydrated);
}

async function requestChanges(actor, requestId, reason) {
  const { request } = await loadRequest(actor, requestId);
  const requestVendor = getRequestVendor(request);
  await vendorRepository.updateRequestVendorStatus(
    requestId,
    requestVendor?.vendor_id || request.vendor_id,
    'changes_requested',
    reason
  );
  await notifyOrganizerForRequest(
    request,
    'request_changes_requested',
    'Request changes requested',
    `The vendor requested changes for ${request.large_events?.title || 'an event'}. ${reason ? `Message: ${reason}` : ''}`.trim()
  );
  const [hydrated] = await hydrateRequestedServices([await vendorRepository.findRequestById(requestId)]);
  return mapRequestToNormalized(hydrated);
}

async function submitQuote(actor, bookingId, payload) {
  const profile = await vendorRepository.findByUserId(actor.id);
  if (!profile) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  const booking = await vendorRepository.findRequestById(bookingId);
  if (!booking) {
    throw new AppError('Request not found', 404, 'REQUEST_NOT_FOUND');
  }

  if (booking.vendor_id !== profile.id) {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  if (booking.status !== 'pending') {
    throw new AppError('Can only submit a quote for pending bookings', 400, 'INVALID_BOOKING_STATUS');
  }

  const existing = await vendorRepository.findQuoteByVendorAndRequirement(profile.id, booking.requirement_id);
  if (existing) {
    throw new AppError('A quote already exists for this requirement', 409, 'QUOTE_EXISTS');
  }

  const procurementRequest = await vendorRepository.findOrCreateProcurementRequest(
    booking.event_id,
    booking.organizer_id,
    `Quote for ${booking.event_requirements?.category || 'service'}`
  );

  const quote = await vendorRepository.createQuote({
    requestId: procurementRequest.id,
    vendorId: profile.id,
    requirementId: booking.requirement_id,
    price: payload.price,
    notes: payload.notes || null,
    validUntil: payload.validUntil || null
  });

  return quote;
}

module.exports = {
  getProfile,
  updateProfile,
  listServices,
  createService,
  uploadServiceImage,
  updateService,
  deleteService,
  searchVendors,
  getVendorProfile,
  listB2BBookings,
  getBookingDetail,
  updateBookingStatus,
  submitQuote,
  viewRequest,
  acceptRequest,
  rejectRequest,
  requestChanges,
  mapRequestToNormalized,
  getBookingGuestCount,
  matchesRequestTypeFilter
};
