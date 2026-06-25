const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const requireRole = require('../shared/middleware/role.middleware');
const asyncHandler = require('../shared/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../shared/utils/response');
const { supabaseAdmin } = require('../config/supabase');

const router = Router();

router.use(authenticate, requireRole('organizer', 'admin'));

async function getOrganizerProfileId(userId) {
  const { data } = await supabaseAdmin
    .from('organizer_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
}

async function getVendorProfileId(userId) {
  const { data } = await supabaseAdmin
    .from('vendor_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
}

async function getEventById(eventId) {
  const { data } = await supabaseAdmin
    .from('large_events')
    .select('*')
    .eq('id', eventId)
    .single();
  return data || null;
}

async function getRequirementsForEvent(eventId) {
  const { data } = await supabaseAdmin
    .from('event_requirements')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  return data || [];
}

function mapEventToBrief(event, requirements) {
  return {
    id: event.id,
    eventType: 'custom',
    eventName: event.title,
    location: event.venue,
    eventDate: event.event_date,
    startTime: '18:00',
    endTime: '23:00',
    guestCount: event.expected_guests,
    budget: Number(event.budget || 0),
    selectedTheme: 'General event theme',
    setupStyle: 'indoor',
    selectedVendorServices: requirements.map((req) => req.category),
    specialRequirements: requirements.map((req) => req.notes).filter(Boolean).join(' | '),
    preferredPackageTier: 'premium',
    status: event.status,
    createdAt: event.created_at,
    updatedAt: event.updated_at
  };
}

function mapProcurementRequestToTrackingItem(pr) {
  const rv = pr.request_vendors || {};
  const event = pr.large_events || {};
  const vendor = pr.vendor_profiles || {};
  const service = pr.vendor_services || {};
  const requestedServices = Array.isArray(pr.requestedServices) ? pr.requestedServices : [];
  const primaryService = requestedServices[0] || (service.id ? {
    id: service.id,
    serviceName: service.service_name || 'Service',
    category: service.category || null,
  } : null);
  return {
    id: pr.id,
    vendorName: vendor.business_name || 'Vendor',
    vendorCategory: primaryService?.category || service.category || rv.vendor_service_category || 'Service',
    eventName: event.title || 'Event',
    status: rv.status || pr.status || 'pending',
    lastMessage: pr.request_message || pr.description || `Request is currently ${rv.status || pr.status || 'pending'}.`,
    lastUpdatedAt: rv.responded_at || pr.updated_at || pr.created_at,
    eventDate: event.event_date || null,
    location: event.venue || null,
    quotedPrice: null,
    packageName: primaryService?.serviceName || null,
    requestedServices,
    selectedDate: (rv.deadline || pr.deadline || null) ? new Date(rv.deadline || pr.deadline).toISOString().split('T')[0] : null,
    selectedTimeSlot: null,
    createdAt: pr.created_at
  };
}

function normalizeCategory(value) {
  return String(value || '').trim().toLowerCase();
}

function categoriesOverlap(vendorCategories, requirementCategories) {
  const vendorSet = new Set((vendorCategories || []).map(normalizeCategory));
  const vendorValues = [...vendorSet];
  return (requirementCategories || []).some((category) => {
    const normalized = normalizeCategory(category);
    if (vendorSet.has(normalized)) return true;
    if (vendorValues.some((vendorCategory) => vendorCategory.includes(normalized) || normalized.includes(vendorCategory))) return true;
    if (normalized === 'photo/video') return vendorSet.has('photography') || vendorSet.has('videography');
    if (normalized === 'lights and sounds') return vendorSet.has('lighting') || vendorSet.has('sound') || vendorSet.has('lights and sounds');
    if (normalized === 'venue') return vendorSet.has('venue') || vendorSet.has('venue decoration') || vendorSet.has('event styling') || vendorSet.has('florist');
    if (normalized === 'staff') return vendorSet.has('event staff') || vendorSet.has('security') || vendorSet.has('cleanup crew') || vendorSet.has('hosts / emcees') || vendorSet.has('entertainment');
    if (normalized === 'transport') return vendorSet.has('transport') || vendorSet.has('transportation');
    return false;
  });
}

function mapVendorToMarketplaceItem(vendor) {
  const services = vendor.vendor_services || [];
  const serviceCategories = [...new Set(services.map((s) => s.category))];
  const startingPrice = services.length > 0
    ? Math.min(...services.map((s) => Number(s.base_price || 0)))
    : 0;

  return {
    id: vendor.id,
    businessName: vendor.business_name,
    serviceCategory: serviceCategories,
    location: vendor.service_area || '',
    serviceArea: vendor.service_area || '',
    startingPrice,
    rating: Number(vendor.rating || 0),
    availabilityStatus: services[0]?.availability_status || 'available',
    packageHighlights: services.map((s) => s.service_name).filter(Boolean),
    packageTiers: services.map((s) => ({
      name: s.service_name,
      price: Number(s.base_price || 0),
      description: s.description || ''
    })),
    verified: vendor.verification_status === 'verified',
    description: vendor.business_description || services.map((s) => s.description).filter(Boolean).join(' '),
    memberSince: vendor.created_at,
    services: services.map((s) => ({
      id: s.id,
      category: s.category,
      serviceName: s.service_name,
      description: s.description || '',
      basePrice: Number(s.base_price || 0),
      availabilityStatus: s.availability_status
    }))
  };
}

function groupServicesByVendor(serviceRows) {
  const vendorMap = new Map();

  for (const row of serviceRows || []) {
    const vendor = row.vendor_profiles;
    if (!vendor) continue;

    const existing = vendorMap.get(vendor.id) || {
      ...vendor,
      vendor_services: []
    };

    existing.vendor_services.push({
        id: row.id,
        category: row.category,
        service_name: row.service_name,
        description: row.description,
        base_price: row.base_price,
        availability_status: row.availability_status
      });

    vendorMap.set(vendor.id, existing);
  }

  return [...vendorMap.values()];
}

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

  const { data, error } = await supabaseAdmin
    .from('procurement_requests')
    .insert(fullPayload)
    .select('id')
    .single();

  if (!error) return data;
  if (!isMissingVendorServiceIdsColumnError(error)) throw error;

  const { data: fallbackData, error: fallbackError } = await supabaseAdmin
    .from('procurement_requests')
    .insert(payload)
    .select('id')
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

router.get(
  '/organizer/event-briefs',
  asyncHandler(async (req, res) => {
    const organizerId = await getOrganizerProfileId(req.user.id);
    if (!organizerId) return sendSuccess(res, []);

    const { data: events } = await supabaseAdmin
      .from('large_events')
      .select('*')
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false });

    const briefs = [];
    for (const event of events || []) {
      const requirements = await getRequirementsForEvent(event.id);
      briefs.push(mapEventToBrief(event, requirements));
    }

    sendSuccess(res, briefs);
  })
);

router.get(
  '/organizer/event-briefs/:briefId',
  asyncHandler(async (req, res) => {
    const event = await getEventById(req.params.briefId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found' },
        meta: {}
      });
    }
    const requirements = await getRequirementsForEvent(event.id);
    sendSuccess(res, mapEventToBrief(event, requirements));
  })
);

router.get(
  '/organizer/vendor-requests',
  asyncHandler(async (req, res) => {
    const organizerId = await getOrganizerProfileId(req.user.id);
    if (!organizerId) return sendSuccess(res, []);

    const { data: requests } = await supabaseAdmin
      .from('procurement_requests')
      .select(`
        *,
        large_events!inner(title, event_date, venue),
        organizer_profiles!inner(organization_name),
        vendor_profiles!inner(business_name),
        vendor_services(id, service_name, category),
        request_vendors!inner(*)
      `)
      .eq('organizer_id', organizerId)
      .order('updated_at', { ascending: false });

    const hydrated = await hydrateRequestedServices(requests || []);
    sendSuccess(res, hydrated.map(mapProcurementRequestToTrackingItem));
  })
);

router.get(
  '/organizer/vendor-requests/:requestId',
  asyncHandler(async (req, res) => {
    const organizerId = await getOrganizerProfileId(req.user.id);
    if (!organizerId) return sendSuccess(res, null);

    const { data: request, error } = await supabaseAdmin
      .from('procurement_requests')
      .select(`
        *,
        large_events!inner(title, event_date, venue),
        organizer_profiles!inner(organization_name),
        vendor_profiles!inner(business_name),
        vendor_services(id, service_name, category),
        request_vendors!inner(*)
      `)
      .eq('id', req.params.requestId)
      .eq('organizer_id', organizerId)
      .maybeSingle();

    if (error) throw error;
    if (!request) {
      return res.status(404).json({
        success: false,
        error: { code: 'REQUEST_NOT_FOUND', message: 'Vendor request not found' },
        meta: {}
      });
    }

    const [hydrated] = await hydrateRequestedServices([request]);
    sendSuccess(res, mapProcurementRequestToTrackingItem(hydrated));
  })
);

router.post(
  '/organizer/vendor-requests',
  asyncHandler(async (req, res) => {
    const organizerId = await getOrganizerProfileId(req.user.id);
    if (!organizerId) return sendSuccess(res, null);

    const event = await getEventById(req.body.eventBriefId);
    if (!event || event.organizer_id !== organizerId) {
      return res.status(404).json({
        success: false,
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found' },
        meta: {}
      });
    }

    const { data: vendorProfile } = await supabaseAdmin
      .from('vendor_profiles')
      .select('id')
      .eq('id', req.body.vendorId)
      .maybeSingle();

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENDOR_NOT_FOUND', message: 'Vendor not found' },
        meta: {}
      });
    }

    const title = `Request for ${event.title}`;
    const vendorServiceIds = Array.isArray(req.body.vendorServiceIds)
      ? req.body.vendorServiceIds
      : (req.body.vendorServiceId ? [req.body.vendorServiceId] : []);
    const selectedDate = req.body.selectedDate || null;

    if (selectedDate) {
      const blockedDates = await getVendorBlockedDates(req.body.vendorId);
      if (blockedDates.has(selectedDate)) {
        return res.status(409).json({
          success: false,
          error: { code: 'VENDOR_DATE_UNAVAILABLE', message: 'The selected vendor date is already booked or on hold.' },
          meta: {}
        });
      }
    }

    const pr = await insertProcurementRequestWithFallback({
      event_id: event.id,
      organizer_id: organizerId,
      vendor_id: req.body.vendorId,
      vendor_service_id: vendorServiceIds[0] || null,
      title,
      description: req.body.message || null,
      request_message: req.body.message || null,
      budget_min: req.body.budgetMin ?? null,
      budget_max: req.body.budgetMax ?? null,
      deadline: selectedDate ? `${selectedDate}T23:59:59Z` : null,
      status: 'open'
    }, vendorServiceIds);

    const { error: rvError } = await supabaseAdmin
      .from('request_vendors')
      .insert({
        request_id: pr.id,
        vendor_id: req.body.vendorId,
        vendor_service_id: vendorServiceIds[0] || null,
        status: 'pending'
      });

    if (rvError) throw rvError;

    const { data: vendorUser } = await supabaseAdmin
      .from('vendor_profiles')
      .select('user_id')
      .eq('id', req.body.vendorId)
      .single();

    if (vendorUser) {
      await supabaseAdmin.from('notifications').insert({
        user_id: vendorUser.user_id,
        title: `New booking request for ${event.title}`,
        message: req.body.message || `You have received a new request from an organizer.`,
        notification_type: 'booking_created',
        priority: 'normal',
        action_url: `/vendor/requests/${pr.id}`,
        metadata: { requestId: pr.id, eventTitle: event.title }
      });
    }

    return sendCreated(res, { id: pr.id });
  })
);

router.post(
  '/organizer/vendor-requests/inquiry',
  asyncHandler(async (req, res) => {
    const organizerId = await getOrganizerProfileId(req.user.id);
    if (!organizerId) return sendSuccess(res, null);

    const vendorId = req.body.vendorId;
    if (!vendorId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VENDOR_ID_REQUIRED', message: 'Vendor ID is required for inquiries' },
        meta: {}
      });
    }

    const { data: vendorProfile } = await supabaseAdmin
      .from('vendor_profiles')
      .select('id, user_id, business_name')
      .eq('id', vendorId)
      .maybeSingle();

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENDOR_NOT_FOUND', message: 'Vendor not found' },
        meta: {}
      });
    }

    const { data: event } = await supabaseAdmin
      .from('large_events')
      .select('id, title')
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const pr = await insertProcurementRequestWithFallback({
      event_id: event?.id || null,
      organizer_id: organizerId,
      vendor_id: vendorId,
      title: 'General vendor inquiry',
      description: req.body.message || null,
      request_message: req.body.message || null,
      status: 'open'
    }, []);

    const { error: rvError } = await supabaseAdmin
      .from('request_vendors')
      .insert({
        request_id: pr.id,
        vendor_id: vendorId,
        status: 'pending'
      });

    if (rvError) throw rvError;

    if (vendorProfile.user_id) {
      await supabaseAdmin.from('notifications').insert({
        user_id: vendorProfile.user_id,
        title: 'New inquiry from organizer',
        message: req.body.message || 'An organizer has sent you a general inquiry.',
        notification_type: 'booking_created',
        priority: 'normal',
        action_url: `/vendor/requests/${pr.id}`,
        metadata: { requestId: pr.id }
      });
    }

    return sendCreated(res, { id: pr.id });
  })
);

router.get(
  '/vendor-marketplace',
  asyncHandler(async (_req, res) => {
    const { data: services } = await supabaseAdmin
      .from('vendor_services')
      .select(`
        id,
        category,
        service_name,
        description,
        base_price,
        availability_status,
        vendor_profiles!inner(
          id,
          business_name,
          service_area,
          rating,
          verification_status,
          created_at,
          business_description
        )
      `)
      .neq('availability_status', 'unavailable')
      .order('base_price', { ascending: true });

    const vendors = groupServicesByVendor(services || []);
    sendSuccess(res, vendors
      .map(mapVendorToMarketplaceItem));
  })
);

router.get(
  '/vendor-marketplace/:vendorId',
  asyncHandler(async (req, res) => {
    const { data: services } = await supabaseAdmin
      .from('vendor_services')
      .select(`
        id,
        category,
        service_name,
        description,
        base_price,
        availability_status,
        vendor_profiles!inner(
          id,
          business_name,
          service_area,
          rating,
          verification_status,
          created_at,
          business_description
        )
      `)
      .eq('vendor_id', req.params.vendorId)
      .neq('availability_status', 'unavailable');

    const vendor = groupServicesByVendor(services || [])[0];

    if (!vendor) return sendSuccess(res, null);

    sendSuccess(res, mapVendorToMarketplaceItem(vendor));
  })
);

const TIME_SLOTS = [
  { label: 'Morning (8AM - 12PM)', value: 'morning' },
  { label: 'Afternoon (12PM - 5PM)', value: 'afternoon' },
  { label: 'Evening (5PM - 10PM)', value: 'evening' },
  { label: 'Full Day', value: 'full_day' },
];

router.get(
  '/vendor-marketplace/:vendorId/availability',
  asyncHandler(async (req, res) => {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const vendorId = req.params.vendorId;
    const blockedSet = await getVendorBlockedDates(vendorId);

    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isBlocked = blockedSet.has(dateStr);
      days.push({
        date: dateStr,
        status: isBlocked ? 'occupied' : 'available',
        slots: TIME_SLOTS.map((sl) => ({
          label: sl.label,
          value: sl.value,
          isOccupied: isBlocked,
        })),
      });
    }

    sendSuccess(res, { vendorId, year, month, days });
  })
);

router.get(
  '/vendor-marketplace/matched/:briefId',
  asyncHandler(async (req, res) => {
    const event = await getEventById(req.params.briefId);
    if (!event) return sendSuccess(res, []);
    const requirements = await getRequirementsForEvent(event.id);
    const requirementCategories = [...new Set((requirements || []).map((req) => req.category).filter(Boolean))];
    if (requirementCategories.length === 0) return sendSuccess(res, []);

    const { data: services } = await supabaseAdmin
      .from('vendor_services')
      .select(`
        id,
        category,
        service_name,
        description,
        base_price,
        availability_status,
        vendor_profiles!inner(
          id,
          business_name,
          service_area,
          rating,
          verification_status,
          created_at,
          business_description
        )
      `)
      .neq('availability_status', 'unavailable')
      .order('base_price', { ascending: true });

    const vendors = groupServicesByVendor(services || []);
    const matched = vendors
      .filter((vendor) => categoriesOverlap(
        (vendor.vendor_services || []).map((service) => service.category),
        requirementCategories
      ))
      .map(mapVendorToMarketplaceItem);

    sendSuccess(res, matched);
  })
);

router.post(
  '/vendor-requests',
  asyncHandler(async (req, res) => {
    const organizerId = await getOrganizerProfileId(req.user.id);
    if (!organizerId) return sendSuccess(res, null);

    const event = await getEventById(req.body.eventBriefId);
    if (!event || event.organizer_id !== organizerId) {
      return res.status(404).json({
        success: false,
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found' },
        meta: {}
      });
    }

    const { data: vendorProfile } = await supabaseAdmin
      .from('vendor_profiles')
      .select('id')
      .eq('id', req.body.vendorId)
      .maybeSingle();

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENDOR_NOT_FOUND', message: 'Vendor not found' },
        meta: {}
      });
    }

    const title = `Request for ${event.title}`;
    const vendorServiceIds = Array.isArray(req.body.vendorServiceIds)
      ? req.body.vendorServiceIds
      : (req.body.vendorServiceId ? [req.body.vendorServiceId] : []);
    const selectedDate = req.body.selectedDate || null;

    if (selectedDate) {
      const blockedDates = await getVendorBlockedDates(req.body.vendorId);
      if (blockedDates.has(selectedDate)) {
        return res.status(409).json({
          success: false,
          error: { code: 'VENDOR_DATE_UNAVAILABLE', message: 'The selected vendor date is already booked or on hold.' },
          meta: {}
        });
      }
    }

    const { data: pr, error: prError } = await supabaseAdmin
      .from('procurement_requests')
      .insert({
        event_id: event.id,
        organizer_id: organizerId,
        vendor_id: req.body.vendorId,
        vendor_service_id: vendorServiceIds[0] || null,
        vendor_service_ids: vendorServiceIds.length > 0 ? JSON.stringify(vendorServiceIds) : null,
        title,
        description: req.body.message || null,
        request_message: req.body.message || null,
        budget_min: req.body.budgetMin ?? null,
        budget_max: req.body.budgetMax ?? null,
        deadline: selectedDate ? `${selectedDate}T23:59:59Z` : null,
        status: 'open'
      })
      .select('id')
      .single();

    if (prError) throw prError;

    const { error: rvError } = await supabaseAdmin
      .from('request_vendors')
      .insert({
        request_id: pr.id,
        vendor_id: req.body.vendorId,
        vendor_service_id: vendorServiceIds[0] || null,
        status: 'pending'
      });

    if (rvError) throw rvError;

    return sendCreated(res, { id: pr.id });
  })
);

router.post(
  '/vendor-requests/inquiry',
  asyncHandler(async (req, res) => {
    const organizerId = await getOrganizerProfileId(req.user.id);
    if (!organizerId) return sendSuccess(res, null);

    const vendorId = req.body.vendorId;
    if (!vendorId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VENDOR_ID_REQUIRED', message: 'Vendor ID is required for inquiries' },
        meta: {}
      });
    }

    const { data: vendorProfile } = await supabaseAdmin
      .from('vendor_profiles')
      .select('id, user_id, business_name')
      .eq('id', vendorId)
      .maybeSingle();

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENDOR_NOT_FOUND', message: 'Vendor not found' },
        meta: {}
      });
    }

    const { data: event } = await supabaseAdmin
      .from('large_events')
      .select('id, title')
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: pr, error: prError } = await supabaseAdmin
      .from('procurement_requests')
      .insert({
        event_id: event?.id || null,
        organizer_id: organizerId,
        vendor_id: vendorId,
        title: 'General vendor inquiry',
        description: req.body.message || null,
        request_message: req.body.message || null,
        status: 'open'
      })
      .select('id')
      .single();

    if (prError) throw prError;

    const { error: rvError } = await supabaseAdmin
      .from('request_vendors')
      .insert({
        request_id: pr.id,
        vendor_id: vendorId,
        status: 'pending'
      });

    if (rvError) throw rvError;

    if (vendorProfile.user_id) {
      await supabaseAdmin.from('notifications').insert({
        user_id: vendorProfile.user_id,
        title: `New inquiry from organizer`,
        message: req.body.message || 'An organizer has sent you a general inquiry.',
        notification_type: 'booking_created',
        priority: 'normal',
        action_url: `/vendor/requests/${pr.id}`,
        metadata: { requestId: pr.id }
      });
    }

    return sendCreated(res, { id: pr.id });
  })
);

module.exports = router;
