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
  if (bookings && bookings.length > 0) {
    const bookingIds = bookings.map(b => b.id);

    const { data: allContracts } = await supabase
      .from('contracts')
      .select('*')
      .in('booking_id', bookingIds);

    const { data: allStatusHistory } = await supabase
      .from('booking_status_history')
      .select('*')
      .in('booking_id', bookingIds)
      .order('created_at', { ascending: false });

    const contractsByBooking = {};
    for (const c of allContracts || []) {
      (contractsByBooking[c.booking_id] = contractsByBooking[c.booking_id] || []).push(c);
    }

    const historyByBooking = {};
    for (const h of allStatusHistory || []) {
      (historyByBooking[h.booking_id] = historyByBooking[h.booking_id] || []).push(h);
    }

    for (const booking of bookings) {
      enhancedBookings.push({
        ...booking,
        contracts: contractsByBooking[booking.id] || [],
        statusHistory: historyByBooking[booking.id] || []
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
    expectedGuests: payload.expectedGuests,
    status: payload.status || 'draft'
  });
}

async function getDashboardSummary(actor) {
  const { data: organizer } = await supabase
    .from('organizer_profiles')
    .select('id')
    .eq('user_id', actor.id)
    .single();

  if (!organizer) {
    throw new AppError('Organizer profile not found', 404, 'ORGANIZER_NOT_FOUND');
  }

  const events = await eventRepository.findByOrganizerId(organizer.id);

  const eventStatusSummary = {
    total: events.length,
    draft: events.filter((e) => e.status === 'draft').length,
    planning: events.filter((e) => e.status === 'planning').length,
    booking: events.filter((e) => e.status === 'booking').length,
    confirmed: events.filter((e) => e.status === 'confirmed').length,
    completed: events.filter((e) => e.status === 'completed').length,
    cancelled: events.filter((e) => e.status === 'cancelled').length
  };

  const { data: allRequirements } = await supabase
    .from('event_requirements')
    .select('*, large_events!inner(organizer_id)')
    .eq('large_events.organizer_id', organizer.id);

  const requirementSummary = {
    total: allRequirements?.length || 0,
    open: allRequirements?.filter((r) => r.requirement_status === 'open').length || 0,
    pendingBooking: allRequirements?.filter((r) => r.requirement_status === 'pending_booking').length || 0,
    fulfilled: allRequirements?.filter((r) => r.requirement_status === 'fulfilled').length || 0,
    cancelled: allRequirements?.filter((r) => r.requirement_status === 'cancelled').length || 0
  };

  const { data: allBookings } = await supabase
    .from('bookings')
    .select('*, large_events!inner(organizer_id)')
    .eq('large_events.organizer_id', organizer.id);

  const bookingSummary = {
    total: allBookings?.length || 0,
    pending: allBookings?.filter((b) => b.status === 'pending').length || 0,
    accepted: allBookings?.filter((b) => b.status === 'accepted').length || 0,
    rejected: allBookings?.filter((b) => b.status === 'rejected').length || 0,
    changesRequested: allBookings?.filter((b) => b.status === 'changes_requested').length || 0,
    contractSent: allBookings?.filter((b) => b.status === 'contract_sent').length || 0,
    confirmed: allBookings?.filter((b) => b.status === 'confirmed').length || 0,
    completed: allBookings?.filter((b) => b.status === 'completed').length || 0,
    cancelled: allBookings?.filter((b) => b.status === 'cancelled').length || 0
  };

  const upcomingEvents = events
    .filter((e) => e.status !== 'completed' && e.status !== 'cancelled')
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .slice(0, 5)
    .map((e) => ({ id: e.id, title: e.title, eventDate: e.event_date, status: e.status }));

  const { data: recentActivity } = await supabase
    .from('booking_status_history')
    .select('*, bookings!inner(event_id, large_events!inner(organizer_id))')
    .eq('bookings.large_events.organizer_id', organizer.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    eventStatusSummary,
    requirementSummary,
    bookingSummary,
    upcomingEvents,
    recentActivity: recentActivity || []
  };
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

async function deleteEvent(actor, eventId) {
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

  await eventRepository.remove(eventId);
  return { deleted: true, id: eventId };
}

module.exports = { listEvents, getEvent, createEvent, updateEvent, getDashboardSummary, getEventPortfolio, deleteEvent };
