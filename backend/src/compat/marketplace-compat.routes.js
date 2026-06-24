const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const requireRole = require('../shared/middleware/role.middleware');
const asyncHandler = require('../shared/utils/asyncHandler');
const { sendSuccess } = require('../shared/utils/response');
const organizerDashboardService = require('../organizer-dashboard/organizer-dashboard.service');

const router = Router();

router.use(authenticate, requireRole('organizer', 'admin'));

router.get(
  '/organizer/event-briefs',
  asyncHandler(async (req, res) => {
    const briefs = await organizerDashboardService.getDrafts(req.user);
    const normalized = briefs.map((brief) => ({
      id: brief.id,
      eventType: brief.eventType,
      eventName: brief.name,
      location: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      guestCount: 0,
      budget: 0,
      selectedTheme: '',
      setupStyle: '',
      selectedVendorServices: [],
      specialRequirements: '',
      preferredPackageTier: '',
      status: 'draft',
      createdAt: brief.lastEdited,
      updatedAt: brief.lastEdited
    }));

    sendSuccess(res, normalized);
  })
);

router.get(
  '/organizer/vendor-requests',
  asyncHandler(async (req, res) => {
    const requests = await organizerDashboardService.getVendorRequests(req.user);
    sendSuccess(res, requests);
  })
);

router.get(
  '/vendor-marketplace',
  asyncHandler(async (_req, res) => {
    sendSuccess(res, []);
  })
);

router.get(
  '/vendor-marketplace/:vendorId',
  asyncHandler(async (req, res) => {
    sendSuccess(res, {
      id: req.params.vendorId,
      businessName: 'Vendor',
      serviceCategory: [],
      location: '',
      serviceArea: '',
      startingPrice: 0,
      rating: 0,
      completedBookings: 0,
      capacity: 0,
      availabilityStatus: 'available',
      eventTypeExperience: [],
      packageHighlights: [],
      packageTiers: [],
      verified: false,
      responseTime: '',
      responseRate: '',
      description: '',
      galleryImages: [],
      reviews: [],
      inclusions: [],
      addOns: [],
      cancellationPolicy: '',
      bookingNotes: '',
      memberSince: '',
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
  asyncHandler(async (_req, res) => {
    sendSuccess(res, []);
  })
);

module.exports = router;
