const AppError = require('../shared/utils/appError');
const { supabase } = require('../config/supabase');
const bookingRepository = require('./contract-booking.repository');

const CONTRACT_TRANSITIONS = {
  draft: ['sent', 'cancelled'],
  sent: ['organizer_signed', 'cancelled'],
  organizer_signed: ['vendor_signed', 'cancelled'],
  vendor_signed: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

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

  const { data: event } = await supabase
    .from('large_events')
    .select('id, organizer_id')
    .eq('id', payload.eventId)
    .single();

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

  const baseInput = {
    eventId: payload.eventId,
    requirementId: payload.requirementId,
    vendorId: payload.vendorId,
    organizerId: organizer.id,
    requestedBudget: payload.requestedBudget,
    bookingType: payload.bookingType || 'B2B',
    responseDeadline: payload.responseDeadline || null
  };

  if (payload.requestedBudget !== null && payload.requestedBudget !== undefined) {
    let notes = payload.notes || '';

    if (requirement.min_budget && payload.requestedBudget < requirement.min_budget) {
      notes = (notes + ' [Budget below requirement minimum]').trim();
    }

    if (requirement.max_budget && payload.requestedBudget > requirement.max_budget) {
      notes = (notes + ' [Budget exceeds requirement max - justification needed]').trim();
    }

    return bookingRepository.create({ ...baseInput, notes });
  }

  return bookingRepository.create({ ...baseInput, notes: payload.notes });
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
    const { data: event } = await supabase
      .from('large_events')
      .select('id, organizer_id')
      .eq('id', eventId)
      .single();

    if (!event || event.organizer_id !== organizer?.id) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }
  }

  return bookingRepository.findByEventId(eventId);
}

// Contract methods

async function createContract(actor, bookingId, payload) {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  if (booking.status !== 'accepted' && booking.status !== 'confirmed') {
    throw new AppError('Contract can only be created for accepted or confirmed bookings', 400, 'INVALID_BOOKING_STATUS');
  }

  const existing = await bookingRepository.findActiveContractByBooking(bookingId);
  if (existing) {
    throw new AppError('An active contract already exists for this booking', 409, 'DUPLICATE_CONTRACT');
  }

  const { data: organizer } = await supabase
    .from('organizer_profiles')
    .select('id, user_id')
    .eq('id', booking.organizer_id)
    .single();

  if (actor.role !== 'admin' && organizer?.user_id !== actor.id) {
    throw new AppError('Only the booking organizer can create a contract', 403, 'FORBIDDEN');
  }

  const contract = await bookingRepository.createContract({
    bookingId,
    termsSummary: payload.termsSummary || null
  });

  await bookingRepository.insertContractStatusHistory(
    contract.id,
    null,
    'draft',
    actor.id,
    'Contract created'
  );

  return contract;
}

async function getContractByBooking(actor, bookingId) {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  const contract = await bookingRepository.findContractByBookingId(bookingId);
  if (!contract) {
    return null;
  }

  const history = await bookingRepository.getContractStatusHistory(contract.id);
  return { ...contract, statusHistory: history || [] };
}

async function updateContractStatus(actor, contractId, payload) {
  const contract = await bookingRepository.findContractWithBooking(contractId);
  if (!contract) {
    throw new AppError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
  }

  const allowed = CONTRACT_TRANSITIONS[contract.contract_status];
  if (!allowed || !allowed.includes(payload.status)) {
    throw new AppError(
      `Cannot transition contract from '${contract.contract_status}' to '${payload.status}'`,
      400,
      'INVALID_CONTRACT_TRANSITION'
    );
  }

  const updated = await bookingRepository.updateContractStatus(contractId, payload.status);

  await bookingRepository.insertContractStatusHistory(
    contractId,
    contract.contract_status,
    payload.status,
    actor.id,
    payload.reason || null
  );

  if (payload.status === 'active' || payload.status === 'completed') {
    const bookingStatus = payload.status === 'active' ? 'confirmed' : 'completed';
    await bookingRepository.updateBookingStatus(contract.booking_id, bookingStatus);
  }

  if (payload.status === 'cancelled') {
    await bookingRepository.updateBookingStatus(contract.booking_id, 'cancelled');
  }

  return updated;
}

async function signContractOrganizer(actor, contractId, payload) {
  const contract = await bookingRepository.findContractWithBooking(contractId);
  if (!contract) {
    throw new AppError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
  }

  if (contract.contract_status !== 'sent') {
    throw new AppError('Contract must be in sent status before organizer can sign', 400, 'INVALID_CONTRACT_STATUS');
  }

  const { data: organizer } = await supabase
    .from('organizer_profiles')
    .select('id, user_id')
    .eq('id', contract.bookings.organizer_id)
    .single();

  if (actor.role !== 'admin' && organizer?.user_id !== actor.id) {
    throw new AppError('Only the booking organizer can sign this contract', 403, 'FORBIDDEN');
  }

  const updated = await bookingRepository.updateContractStatus(contractId, 'organizer_signed');

  await bookingRepository.insertContractStatusHistory(
    contractId,
    contract.contract_status,
    'organizer_signed',
    actor.id,
    'Signed by organizer'
  );

  return updated;
}

async function awardQuote(actor, bookingId, payload) {
  if (actor.role !== 'organizer') {
    throw new AppError('Only organizers can award quotes', 403, 'FORBIDDEN');
  }

  const { data: organizer } = await supabase
    .from('organizer_profiles')
    .select('id')
    .eq('user_id', actor.id)
    .single();

  if (!organizer) {
    throw new AppError('Organizer profile not found', 404, 'ORGANIZER_NOT_FOUND');
  }

  const booking = await bookingRepository.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  if (booking.organizer_id !== organizer.id) {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  const quote = await bookingRepository.findQuoteById(payload.quoteId);
  if (!quote) {
    throw new AppError('Quote not found', 404, 'QUOTE_NOT_FOUND');
  }

  if (quote.vendor_id !== booking.vendor_id) {
    throw new AppError('Quote does not match the booking vendor', 400, 'QUOTE_VENDOR_MISMATCH');
  }

  if (quote.status !== 'submitted') {
    throw new AppError('Quote is not in a submittable state', 400, 'INVALID_QUOTE_STATUS');
  }

  await bookingRepository.updateQuoteStatus(quote.id, 'accepted');
  await bookingRepository.updateBookingStatus(bookingId, 'accepted');

  const { data: vendorProfile } = await supabase
    .from('vendor_profiles')
    .select('user_id')
    .eq('id', booking.vendor_id)
    .single();

  if (vendorProfile) {
    await supabase.from('notifications').insert({
      user_id: vendorProfile.user_id,
      booking_id: bookingId,
      title: 'Quote Accepted',
      message: 'Your quote has been accepted by the organizer.',
      notification_type: 'quote_accepted',
      priority: 'high'
    });
  }

  return { bookingId, quoteId: quote.id, status: 'accepted' };
}

async function signContractVendor(actor, contractId, payload) {
  const contract = await bookingRepository.findContractWithBooking(contractId);
  if (!contract) {
    throw new AppError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
  }

  if (contract.contract_status !== 'organizer_signed') {
    throw new AppError('Organizer must sign first before vendor can sign', 400, 'INVALID_CONTRACT_STATUS');
  }

  const { data: vendor } = await supabase
    .from('vendor_profiles')
    .select('id, user_id')
    .eq('id', contract.bookings.vendor_id)
    .single();

  if (actor.role !== 'admin' && vendor?.user_id !== actor.id) {
    throw new AppError('Only the assigned vendor can sign this contract', 403, 'FORBIDDEN');
  }

  const updated = await bookingRepository.updateContractStatus(contractId, 'vendor_signed');

  await bookingRepository.insertContractStatusHistory(
    contractId,
    contract.contract_status,
    'vendor_signed',
    actor.id,
    'Signed by vendor'
  );

  const autoActivated = await bookingRepository.updateContractStatus(contractId, 'active');
  await bookingRepository.insertContractStatusHistory(
    contractId,
    'vendor_signed',
    'active',
    actor.id,
    'Contract automatically activated after vendor signing'
  );

  await bookingRepository.updateBookingStatus(contract.booking_id, 'confirmed');

  return autoActivated;
}

module.exports = {
  createBooking,
  getBooking,
  listEventBookings,
  createContract,
  getContractByBooking,
  updateContractStatus,
  signContractOrganizer,
  signContractVendor,
  awardQuote
};
