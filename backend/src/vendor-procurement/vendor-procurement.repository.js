const { supabase } = require('../config/supabase');

async function findByEventId(eventId) {
  const { data, error } = await supabase
    .from('event_requirements')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

async function findById(requirementId) {
  const { data, error } = await supabase
    .from('event_requirements')
    .select('*')
    .eq('id', requirementId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function create(input) {
  const { data, error } = await supabase
    .from('event_requirements')
    .insert({
      event_id: input.eventId,
      category: input.category,
      quantity: input.quantity,
      min_budget: input.minBudget || null,
      max_budget: input.maxBudget || null,
      notes: input.notes || null
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function update(requirementId, input) {
  const updates = {};
  if (input.category !== undefined) updates.category = input.category;
  if (input.quantity !== undefined) updates.quantity = input.quantity;
  if (input.minBudget !== undefined) updates.min_budget = input.minBudget;
  if (input.maxBudget !== undefined) updates.max_budget = input.maxBudget;
  if (input.requirementStatus !== undefined) updates.requirement_status = input.requirementStatus;
  if (input.notes !== undefined) updates.notes = input.notes;

  if (updates.min_budget !== undefined && updates.max_budget !== undefined) {
    if (updates.min_budget > updates.max_budget) {
      throw new Error('min_budget must be less than or equal to max_budget');
    }
  }

  const { data, error } = await supabase
    .from('event_requirements')
    .update(updates)
    .eq('id', requirementId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function remove(requirementId) {
  const { error } = await supabase
    .from('event_requirements')
    .delete()
    .eq('id', requirementId);

  if (error) throw error;
}

module.exports = { findByEventId, findById, create, update, remove };
