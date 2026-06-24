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

function mapBookingToVendorRequest(booking) {
  return {
    id: booking.id,
    vendorName: booking.vendor_profiles?.business_name || 'Vendor',
    category: booking.event_requirements?.category || 'Service',
    eventName: booking.large_events?.title || 'Event',
    status: booking.status,
    lastMessage: booking.notes || `Request is currently ${booking.status}.`,
    lastUpdated: booking.updated_at || booking.requested_at,
    eventDate: booking.large_events?.event_date || null,
    location: booking.large_events?.venue || null,
    quotedPrice: booking.requested_budget ?? null,
    packageName: booking.booking_type || null,
    createdAt: booking.requested_at
  };
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
  '/organizer/vendor-requests',
  asyncHandler(async (req, res) => {
    const organizerId = await getOrganizerProfileId(req.user.id);
    if (!organizerId) return sendSuccess(res, []);

    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        large_events!inner(title, event_date, venue),
        event_requirements!inner(category),
        vendor_profiles!inner(business_name)
      `)
      .eq('organizer_id', organizerId)
      .order('updated_at', { ascending: false });

    sendSuccess(res, (bookings || []).map(mapBookingToVendorRequest));
  })
);

router.get(
  '/vendor-marketplace',
  asyncHandler(async (_req, res) => {
    const { data: vendors } = await supabaseAdmin
      .from('vendor_profiles')
      .select('id, business_name, service_area, rating, verification_status, created_at')
      .eq('verification_status', 'verified')
      .order('rating', { ascending: false });

    sendSuccess(res, (vendors || []).map((vendor) => ({
      id: vendor.id,
      businessName: vendor.business_name,
      serviceCategory: [],
      location: vendor.service_area || '',
      serviceArea: vendor.service_area || '',
      startingPrice: 0,
      rating: Number(vendor.rating || 0),
      completedBookings: 0,
      capacity: 0,
      availabilityStatus: 'available',
      eventTypeExperience: [],
      packageHighlights: [],
      packageTiers: [],
      verified: vendor.verification_status === 'verified',
      responseTime: 'Usually responds within 24 hours',
      responseRate: '—',
      description: '',
      galleryImages: [],
      reviews: [],
      inclusions: [],
      addOns: [],
      cancellationPolicy: '',
      bookingNotes: '',
      memberSince: vendor.created_at,
      totalReviews: 0
    })));
  })
);

router.get(
  '/vendor-marketplace/:vendorId',
  asyncHandler(async (req, res) => {
    const { data: vendor } = await supabaseAdmin
      .from('vendor_profiles')
      .select('id, business_name, service_area, rating, verification_status, created_at')
      .eq('id', req.params.vendorId)
      .single();

    if (!vendor) return sendSuccess(res, null);

    sendSuccess(res, {
      id: vendor.id,
      businessName: vendor.business_name,
      serviceCategory: [],
      location: vendor.service_area || '',
      serviceArea: vendor.service_area || '',
      startingPrice: 0,
      rating: Number(vendor.rating || 0),
      completedBookings: 0,
      capacity: 0,
      availabilityStatus: 'available',
      eventTypeExperience: [],
      packageHighlights: [],
      packageTiers: [],
      verified: vendor.verification_status === 'verified',
      responseTime: 'Usually responds within 24 hours',
      responseRate: '—',
      description: '',
      galleryImages: [],
      reviews: [],
      inclusions: [],
      addOns: [],
      cancellationPolicy: '',
      bookingNotes: '',
      memberSince: vendor.created_at,
      totalReviews: 0
    });
  })
);

router.get(
  '/vendor-marketplace/:vendorId/availability',
  asyncHandler(async (req, res) => {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    sendSuccess(res, {
      vendorId: req.params.vendorId,
      year,
      month,
      days: []
    });
  })
);

router.get(
  '/vendor-marketplace/matched/:briefId',
  asyncHandler(async (req, res) => {
    const event = await getEventById(req.params.briefId);
    if (!event) return sendSuccess(res, []);

    const { data: vendors } = await supabaseAdmin
      .from('vendor_profiles')
      .select('id, business_name, service_area, rating, verification_status, created_at')
      .eq('verification_status', 'verified')
      .order('rating', { ascending: false })
      .limit(10);

    sendSuccess(res, (vendors || []).map((vendor) => ({
      id: vendor.id,
      businessName: vendor.business_name,
      serviceCategory: [],
      location: vendor.service_area || '',
      serviceArea: vendor.service_area || '',
      startingPrice: 0,
      rating: Number(vendor.rating || 0),
      completedBookings: 0,
      capacity: 0,
      availabilityStatus: 'available',
      eventTypeExperience: [],
      packageHighlights: [],
      packageTiers: [],
      verified: vendor.verification_status === 'verified',
      responseTime: 'Usually responds within 24 hours',
      responseRate: '—',
      description: '',
      galleryImages: [],
      reviews: [],
      inclusions: [],
      addOns: [],
      cancellationPolicy: '',
      bookingNotes: '',
      memberSince: vendor.created_at,
      totalReviews: 0
    })));
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

    const { data: requirements } = await supabaseAdmin
      .from('event_requirements')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: true });

    const requirement = (requirements || [])[0];
    if (!requirement) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_REQUIREMENTS', message: 'Add at least one event requirement before sending a request.' },
        meta: {}
      });
    }

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        event_id: event.id,
        requirement_id: requirement.id,
        vendor_id: req.body.vendorId,
        organizer_id: organizerId,
        booking_type: 'B2B',
        status: 'pending',
        requested_budget: null,
        notes: req.body.message || req.body.packageName || null,
        response_deadline: req.body.selectedDate ? `${req.body.selectedDate}T23:59:59Z` : null
      })
      .select('id')
      .single();

    if (error) throw error;
    return sendCreated(res, { id: booking.id });
  })
);

router.post(
  '/vendor-requests/inquiry',
  asyncHandler(async (req, res) => {
    const organizerId = await getOrganizerProfileId(req.user.id);
    if (!organizerId) return sendSuccess(res, null);

    const { data: event } = await supabaseAdmin
      .from('large_events')
      .select('id')
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: request } = await supabaseAdmin
      .from('procurement_requests')
      .insert({
        event_id: event?.id || null,
        organizer_id: organizerId,
        title: 'General vendor inquiry',
        description: req.body.message || null,
        status: 'open'
      })
      .select('id')
      .single();

    return sendCreated(res, { id: request.id });
  })
);

module.exports = router;
