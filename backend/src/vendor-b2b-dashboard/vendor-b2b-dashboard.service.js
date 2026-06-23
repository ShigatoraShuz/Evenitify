const AppError = require('../shared/utils/appError');
const { supabase } = require('../config/supabase');
const vendorRepository = require('./vendor-b2b-dashboard.repository');

async function getProfile(actor) {
  const profile = await vendorRepository.findByUserId(actor.id);
  if (!profile) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  const services = await vendorRepository.listServices(profile.id);
  return { ...profile, services };
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

async function listB2BBookings(actor, statusFilter) {
  const profile = await vendorRepository.findByUserId(actor.id);
  if (!profile) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  return vendorRepository.listB2BBookings(profile.id, statusFilter);
}

async function getBookingDetail(actor, bookingId) {
  const profile = await vendorRepository.findByUserId(actor.id);
  if (!profile) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  const booking = await vendorRepository.findBookingById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  if (booking.vendor_id !== profile.id) {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  return booking;
}

async function updateBookingStatus(actor, bookingId, payload) {
  const profile = await vendorRepository.findByUserId(actor.id);
  if (!profile) {
    throw new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
  }

  const booking = await vendorRepository.findBookingById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  if (booking.vendor_id !== profile.id) {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  const allowed = VALID_TRANSITIONS[booking.status];
  if (!allowed || !allowed.includes(payload.status)) {
    throw new AppError(
      `Cannot transition from '${booking.status}' to '${payload.status}'`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }

  return vendorRepository.updateBookingStatus(bookingId, profile.id, payload.status, payload.reason);
}

module.exports = {
  getProfile,
  updateProfile,
  listServices,
  createService,
  updateService,
  searchVendors,
  getVendorProfile,
  listB2BBookings,
  getBookingDetail,
  updateBookingStatus
};
