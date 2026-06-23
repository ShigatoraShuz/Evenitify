const { supabase } = require('../config/supabase');

async function findByOrganizerId(organizerId) {
  const { data, error } = await supabase
    .from('large_events')
    .select('*')
    .eq('organizer_id', organizerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function findById(eventId) {
  const { data, error } = await supabase
    .from('large_events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function create(input) {
  const { data, error } = await supabase
    .from('large_events')
    .insert({
      organizer_id: input.organizerId,
      title: input.title,
      event_date: input.eventDate,
      venue: input.venue,
      budget: input.budget,
      expected_guests: input.expectedGuests
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function update(eventId, input) {
  const updates = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.eventDate !== undefined) updates.event_date = input.eventDate;
  if (input.venue !== undefined) updates.venue = input.venue;
  if (input.budget !== undefined) updates.budget = input.budget;
  if (input.expectedGuests !== undefined) updates.expected_guests = input.expectedGuests;
  if (input.status !== undefined) updates.status = input.status;

  const { data, error } = await supabase
    .from('large_events')
    .update(updates)
    .eq('id', eventId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

module.exports = { findByOrganizerId, findById, create, update };
