const { supabase } = require('../config/supabase');
const AppError = require('../shared/utils/appError');
const adminRepository = require('./admin-operations.repository');

async function getDashboardSummary() {
  return adminRepository.getDashboardSummary();
}

async function listUsers(actor, query) {
  return adminRepository.listUsers(query);
}

async function listEvents(actor, query) {
  return adminRepository.listEvents(query);
}

async function listBookings(actor, query) {
  return adminRepository.listBookings(query);
}

async function listVendors(actor, query) {
  return adminRepository.listVendors(query);
}

async function updateVendorVerification(actor, vendorId, payload) {
  const vendor = await adminRepository.findVendorById(vendorId);
  if (!vendor) {
    throw new AppError('Vendor not found', 404, 'VENDOR_NOT_FOUND');
  }

  if (vendor.verification_status === payload.verificationStatus) {
    throw new AppError(`Vendor is already ${payload.verificationStatus}`, 400, 'NO_CHANGE');
  }

  const updatedVendor = await adminRepository.updateVendorVerification(vendorId, payload.verificationStatus);

  const vendorUser = await adminRepository.findUserByVendorId(vendorId);
  if (vendorUser) {
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: vendorUser.user_id,
        title: 'Verification Status Updated',
        message: `Your vendor verification status has been updated to: ${payload.verificationStatus}. ${payload.reason ? 'Reason: ' + payload.reason : ''}`,
        notification_type: 'vendor_verification',
        priority: payload.verificationStatus === 'verified' ? 'normal' : 'high',
        action_url: '/vendor/profile',
        metadata: { vendorId, verificationStatus: payload.verificationStatus }
      });

    if (notifError) throw notifError;
  }

  return updatedVendor;
}

async function overrideBookingStatus(actor, bookingId, payload) {
  const booking = await adminRepository.findBookingById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  if (booking.status === payload.status) {
    throw new AppError(`Booking is already ${payload.status}`, 400, 'NO_CHANGE');
  }

  const updatedBooking = await adminRepository.overrideBookingStatus(bookingId, payload.status);

  const { error: notifError } = await supabase
    .from('notifications')
    .insert({
      booking_id: bookingId,
      title: 'Booking Status Override',
      message: `Admin has updated booking status to: ${payload.status}. Reason: ${payload.reason}`,
      notification_type: 'booking_status_changed',
      priority: 'high',
      action_url: `/organizer/portfolio?eventId=${booking.event_id}`,
      metadata: { bookingId, previousStatus: booking.status, newStatus: payload.status, reason: payload.reason }
    });

  if (notifError) throw notifError;

  return updatedBooking;
}

module.exports = {
  getDashboardSummary,
  listUsers,
  listEvents,
  listBookings,
  listVendors,
  updateVendorVerification,
  overrideBookingStatus
};
