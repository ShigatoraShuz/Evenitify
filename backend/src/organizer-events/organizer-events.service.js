const AppError = require('../shared/utils/appError');
const { supabase } = require('../config/supabase');
const eventRepository = require('./organizer-events.repository');

async function listEvents(actor) {
  const { data: organizer } = await supabase
    .from('organizer_profiles')
    .select('id')
    .eq('user_id', actor.id)
    .single();

  if (!organizer) {
    throw new AppError('Organizer profile not found', 404, 'ORGANIZER_NOT_FOUND');
  }

  return eventRepository.findByOrganizerId(organizer.id);
}

async function getEvent(actor, eventId) {
  const event = await eventRepository.findById(eventId);

  if (!event) {
    throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  const { data: organizer } = await supabase
    .from('organizer_profiles')
    .select('id')
    .eq('user_id', actor.id)
    .single();

  if (actor.role !== 'admin' && event.organizer_id !== organizer?.id) {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  const { data: requirements } = await supabase
    .from('event_requirements')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      vendor_profiles!inner(business_name, rating, verification_status),
      event_requirements!inner(category, quantity)
    `)
    .eq('event_id', eventId)
    .order('requested_at', { ascending: false });

  const enhancedBookings = [];
  if (bookings) {
    for (const booking of bookings) {
      const { data: contracts } = await supabase
        .from('contracts')
        .select('*')
        .eq('booking_id', booking.id);

      const { data: statusHistory } = await supabase
        .from('booking_status_history')
        .select('*')
        .eq('booking_id', booking.id)
        .order('created_at', { ascending: false });

      enhancedBookings.push({
        ...booking,
        contracts: contracts || [],
        statusHistory: statusHistory || []
      });
    }
  }

  return {
    ...event,
    requirements: requirements || [],
    bookings: enhancedBookings
  };
}

async function getEventPortfolio(actor, eventId) {
  const event = await getEvent(actor, eventId);

  const requirementSummary = {
    total: event.requirements.length,
    open: event.requirements.filter((r) => r.requirement_status === 'open').length,
    pendingBooking: event.requirements.filter((r) => r.requirement_status === 'pending_booking').length,
    fulfilled: event.requirements.filter((r) => r.requirement_status === 'fulfilled').length,
    cancelled: event.requirements.filter((r) => r.requirement_status === 'cancelled').length
  };

  const bookingSummary = {
    total: event.bookings.length,
    pending: event.bookings.filter((b) => b.status === 'pending').length,
    accepted: event.bookings.filter((b) => b.status === 'accepted').length,
    rejected: event.bookings.filter((b) => b.status === 'rejected').length,
    changesRequested: event.bookings.filter((b) => b.status === 'changes_requested').length,
    contractSent: event.bookings.filter((b) => b.status === 'contract_sent').length,
    confirmed: event.bookings.filter((b) => b.status === 'confirmed').length,
    completed: event.bookings.filter((b) => b.status === 'completed').length,
    cancelled: event.bookings.filter((b) => b.status === 'cancelled').length
  };

  const { data: vendorServices } = await supabase
    .from('vendor_services')
    .select('category, base_price, vendor_profiles!inner(business_name)');

  return {
    event,
    requirementSummary,
    bookingSummary,
    vendors: vendorServices || []
  };
}

async function createEvent(actor, payload) {
  const { data: organizer } = await supabase
    .from('organizer_profiles')
    .select('id')
    .eq('user_id', actor.id)
    .single();

  if (!organizer) {
    throw new AppError('Organizer profile not found. Please complete your profile first.', 404, 'ORGANIZER_NOT_FOUND');
  }

  const eventDate = new Date(payload.eventDate);
  if (eventDate < new Date(new Date().toDateString())) {
    throw new AppError('Event date cannot be in the past', 400, 'INVALID_EVENT_DATE');
  }

  return eventRepository.create({
    organizerId: organizer.id,
    title: payload.title,
    eventDate: payload.eventDate,
    venue: payload.venue,
    budget: payload.budget,
    expectedGuests: payload.expectedGuests
  });
}

async function updateEvent(actor, eventId, payload) {
  const event = await eventRepository.findById(eventId);

  if (!event) {
    throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  const { data: organizer } = await supabase
    .from('organizer_profiles')
    .select('id')
    .eq('user_id', actor.id)
    .single();

  if (event.organizer_id !== organizer?.id) {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  if (payload.eventDate) {
    const eventDate = new Date(payload.eventDate);
    if (eventDate < new Date(new Date().toDateString())) {
      throw new AppError('Event date cannot be in the past', 400, 'INVALID_EVENT_DATE');
    }
  }

  return eventRepository.update(eventId, payload);
}

module.exports = { listEvents, getEvent, createEvent, updateEvent };
