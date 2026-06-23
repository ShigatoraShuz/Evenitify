const AppError = require('../shared/utils/appError');
const { supabase } = require('../config/supabase');
const requirementRepository = require('./vendor-procurement.repository');
const eventRepository = require('../organizer-events/organizer-events.repository');

async function getOrganizerId(actor) {
  const { data } = await supabase
    .from('organizer_profiles')
    .select('id')
    .eq('user_id', actor.id)
    .single();
  return data?.id;
}

async function listRequirements(actor, eventId) {
  const organizerId = await getOrganizerId(actor);

  if (actor.role !== 'admin') {
    const event = await eventRepository.findById(eventId);
    if (!event || event.organizer_id !== organizerId) {
      throw new AppError('Event not found or access denied', 404, 'EVENT_NOT_FOUND');
    }
  }

  return requirementRepository.findByEventId(eventId);
}

async function createRequirement(actor, eventId, payload) {
  const organizerId = await getOrganizerId(actor);
  if (!organizerId) {
    throw new AppError('Organizer profile not found', 404, 'ORGANIZER_NOT_FOUND');
  }

  const event = await eventRepository.findById(eventId);
  if (!event || event.organizer_id !== organizerId) {
    throw new AppError('Event not found or access denied', 404, 'EVENT_NOT_FOUND');
  }

  if (payload.minBudget && payload.maxBudget && payload.minBudget > payload.maxBudget) {
    throw new AppError('Minimum budget must be less than or equal to maximum budget', 400, 'INVALID_BUDGET_RANGE');
  }

  return requirementRepository.create({
    eventId,
    category: payload.category,
    quantity: payload.quantity,
    minBudget: payload.minBudget,
    maxBudget: payload.maxBudget,
    notes: payload.notes
  });
}

async function updateRequirement(actor, requirementId, payload) {
  const organizerId = await getOrganizerId(actor);
  if (!organizerId) {
    throw new AppError('Organizer profile not found', 404, 'ORGANIZER_NOT_FOUND');
  }

  const requirement = await requirementRepository.findById(requirementId);
  if (!requirement) {
    throw new AppError('Requirement not found', 404, 'REQUIREMENT_NOT_FOUND');
  }

  const event = await eventRepository.findById(requirement.event_id);
  if (!event || event.organizer_id !== organizerId) {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  const minB = payload.minBudget !== undefined ? payload.minBudget : requirement.min_budget;
  const maxB = payload.maxBudget !== undefined ? payload.maxBudget : requirement.max_budget;
  if (minB !== null && maxB !== null && minB > maxB) {
    throw new AppError('Minimum budget must be less than or equal to maximum budget', 400, 'INVALID_BUDGET_RANGE');
  }

  return requirementRepository.update(requirementId, { ...payload, requirementStatus: payload.requirementStatus });
}

async function deleteRequirement(actor, requirementId) {
  const organizerId = await getOrganizerId(actor);
  if (!organizerId) {
    throw new AppError('Organizer profile not found', 404, 'ORGANIZER_NOT_FOUND');
  }

  const requirement = await requirementRepository.findById(requirementId);
  if (!requirement) {
    throw new AppError('Requirement not found', 404, 'REQUIREMENT_NOT_FOUND');
  }

  const event = await eventRepository.findById(requirement.event_id);
  if (!event || event.organizer_id !== organizerId) {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id')
    .eq('requirement_id', requirementId)
    .in('status', ['accepted', 'confirmed', 'contract_sent', 'completed']);

  if (bookings && bookings.length > 0) {
    throw new AppError(
      'Cannot delete requirement with active bookings. Cancel bookings first.',
      400,
      'REQUIREMENT_HAS_BOOKINGS'
    );
  }

  return requirementRepository.remove(requirementId);
}

module.exports = {
  listRequirements,
  createRequirement,
  updateRequirement,
  deleteRequirement
};
