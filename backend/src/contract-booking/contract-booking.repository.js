const { supabase } = require('../config/supabase');

async function findById(bookingId) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      large_events!inner(title, event_date, venue, expected_guests),
      event_requirements!inner(category, quantity),
      vendor_profiles!inner(business_name, rating, verification_status),
      organizer_profiles!inner(organization_name)
    `)
    .eq('id', bookingId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findByEventId(eventId) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      vendor_profiles!inner(business_name, rating),
      event_requirements!inner(category, quantity)
    `)
    .eq('event_id', eventId)
    .order('requested_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function findDuplicate(eventId, requirementId, vendorId) {
  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('event_id', eventId)
    .eq('requirement_id', requirementId)
    .eq('vendor_id', vendorId)
    .eq('status', 'pending')
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function create(input) {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      event_id: input.eventId,
      requirement_id: input.requirementId,
      vendor_id: input.vendorId,
      organizer_id: input.organizerId,
      booking_type: input.bookingType || 'B2B',
      status: 'pending',
      requested_budget: input.requestedBudget || null,
      notes: input.notes || null,
      response_deadline: input.responseDeadline || null
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

// Quote methods

async function findQuoteForBooking(bookingId, vendorId) {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('booking_id', bookingId)
    .eq('vendor_id', vendorId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function findQuoteById(quoteId) {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createQuote(input) {
  const { data, error } = await supabase
    .from('quotes')
    .insert({
      request_id: input.requestId,
      vendor_id: input.vendorId,
      requirement_id: input.requirementId,
      price: input.price,
      notes: input.notes || null,
      status: 'submitted',
      valid_until: input.validUntil || null
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function updateQuoteStatus(quoteId, status) {
  const { data, error } = await supabase
    .from('quotes')
    .update({ status })
    .eq('id', quoteId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function findVendorById(vendorId) {
  const { data, error } = await supabase
    .from('vendor_profiles')
    .select('id, business_name, verification_status')
    .eq('id', vendorId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Contract repository methods

async function findContractByBookingId(bookingId) {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function findContractById(contractId) {
  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      bookings!inner(
        event_id, organizer_id, vendor_id, status,
        large_events!inner(title),
        organizer_profiles!inner(organization_name),
        vendor_profiles!inner(business_name)
      )
    `)
    .eq('id', contractId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createContract(input) {
  const { data, error } = await supabase
    .from('contracts')
    .insert({
      booking_id: input.bookingId,
      contract_status: 'draft',
      terms_summary: input.termsSummary || null,
      contract_number: 'CNT-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).substr(2, 8).toUpperCase()
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function updateContractStatus(contractId, status) {
  const updates = { contract_status: status };
  if (status === 'sent') updates.sent_at = new Date().toISOString();
  if (status === 'organizer_signed') updates.organizer_signed_at = new Date().toISOString();
  if (status === 'vendor_signed') updates.vendor_signed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('contracts')
    .update(updates)
    .eq('id', contractId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function findActiveContractByBooking(bookingId) {
  const { data, error } = await supabase
    .from('contracts')
    .select('id')
    .eq('booking_id', bookingId)
    .not('contract_status', 'in', '("completed","cancelled")')
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function findContractWithBooking(contractId) {
  const { data, error } = await supabase
    .from('contracts')
    .select('*, bookings!inner(*)')
    .eq('id', contractId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function getContractStatusHistory(contractId) {
  const { data, error } = await supabase
    .from('contract_status_history')
    .select('*')
    .eq('contract_id', contractId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function insertContractStatusHistory(contractId, previousStatus, newStatus, changedBy, reason) {
  const { error } = await supabase
    .from('contract_status_history')
    .insert({
      contract_id: contractId,
      previous_status: previousStatus,
      new_status: newStatus,
      changed_by: changedBy,
      reason: reason || null
    });

  if (error) throw error;
}

async function updateBookingStatus(bookingId, status) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  findById,
  findByEventId,
  findDuplicate,
  create,
  findVendorById,
  findContractByBookingId,
  findContractById,
  createContract,
  updateContractStatus,
  findActiveContractByBooking,
  findContractWithBooking,
  getContractStatusHistory,
  insertContractStatusHistory,
  updateBookingStatus,
  findQuoteForBooking,
  findQuoteById,
  createQuote,
  updateQuoteStatus
};
