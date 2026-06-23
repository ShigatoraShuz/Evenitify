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
    .eq('event_id', eventId);

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('event_id', eventId);

  return { ...event, requirements: requirements || [], bookings: bookings || [] };
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
