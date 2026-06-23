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
      booking_type: 'B2B',
      status: 'pending',
      requested_budget: input.requestedBudget || null,
      notes: input.notes || null
    })
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

module.exports = { findById, findByEventId, findDuplicate, create, findVendorById };
