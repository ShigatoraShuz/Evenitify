const AppError = require('../shared/utils/appError');
const { supabase } = require('../config/supabase');
const bookingRepository = require('./contract-booking.repository');
const eventRepository = require('../organizer-events/organizer-events.repository');

async function createBooking(actor, payload) {
  if (actor.role !== 'organizer') {
    throw new AppError('Only organizers can create booking requests', 403, 'FORBIDDEN');
  }

  const { data: organizer } = await supabase
    .from('organizer_profiles')
    .select('id')
    .eq('user_id', actor.id)
    .single();

  if (!organizer) {
    throw new AppError('Organizer profile not found', 404, 'ORGANIZER_NOT_FOUND');
  }

  const event = await eventRepository.findById(payload.eventId);
  if (!event) {
    throw new AppError('Large Event not found', 404, 'EVENT_NOT_FOUND');
  }

  if (event.organizer_id !== organizer.id) {
    throw new AppError('Event does not belong to this organizer', 403, 'FORBIDDEN');
  }

  const { data: requirement } = await supabase
    .from('event_requirements')
    .select('*')
    .eq('id', payload.requirementId)
    .eq('event_id', payload.eventId)
    .single();

  if (!requirement) {
    throw new AppError('Requirement does not belong to the selected event', 400, 'INVALID_REQUIREMENT');
  }

  const vendor = await bookingRepository.findVendorById(payload.vendorId);
  if (!vendor) {
    throw new AppError('Vendor not found', 404, 'VENDOR_NOT_FOUND');
  }

  const duplicate = await bookingRepository.findDuplicate(
    payload.eventId,
    payload.requirementId,
    payload.vendorId
  );

  if (duplicate) {
    throw new AppError(
      'A pending booking request already exists for this vendor and requirement',
      409,
      'DUPLICATE_BOOKING'
    );
  }

  if (payload.requestedBudget !== null && payload.requestedBudget !== undefined) {
    if (requirement.min_budget && payload.requestedBudget < requirement.min_budget) {
      return bookingRepository.create({
        eventId: payload.eventId,
        requirementId: payload.requirementId,
        vendorId: payload.vendorId,
        organizerId: organizer.id,
        requestedBudget: payload.requestedBudget,
        notes: payload.notes
      });
    }

    if (requirement.max_budget && payload.requestedBudget > requirement.max_budget) {
      const notes = (payload.notes || '') + ' [Budget exceeds requirement max - justification needed]';
      return bookingRepository.create({
        eventId: payload.eventId,
        requirementId: payload.requirementId,
        vendorId: payload.vendorId,
        organizerId: organizer.id,
        requestedBudget: payload.requestedBudget,
        notes: notes.trim()
      });
    }
  }

  return bookingRepository.create({
    eventId: payload.eventId,
    requirementId: payload.requirementId,
    vendorId: payload.vendorId,
    organizerId: organizer.id,
    requestedBudget: payload.requestedBudget,
    notes: payload.notes
  });
}

async function getBooking(actor, bookingId) {
  const booking = await bookingRepository.findById(bookingId);

  if (!booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  return booking;
}

async function listEventBookings(actor, eventId) {
  const { data: organizer } = await supabase
    .from('organizer_profiles')
    .select('id')
    .eq('user_id', actor.id)
    .single();

  if (actor.role !== 'admin') {
    const event = await eventRepository.findById(eventId);
    if (!event || event.organizer_id !== organizer?.id) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }
  }

  return bookingRepository.findByEventId(eventId);
}

module.exports = { createBooking, getBooking, listEventBookings };
