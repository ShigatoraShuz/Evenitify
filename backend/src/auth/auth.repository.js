const { supabaseAdmin } = require('../config/supabase');

async function findByUserId(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findOrganizerProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('organizer_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function findVendorProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('vendor_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function createProfile(userId, email, role, displayName) {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .insert({
      id: userId,
      email,
      role,
      display_name: displayName || null
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function updateRole(userId, role) {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .update({ role })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function upsertOrganizerProfile(userId, organizationName, contactNumber, businessAddress) {
  const { data, error } = await supabaseAdmin
    .from('organizer_profiles')
    .upsert({
      user_id: userId,
      organization_name: organizationName,
      contact_number: contactNumber || null,
      business_address: businessAddress || null
    }, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function upsertVendorProfile(userId, businessName, contactNumber, serviceArea) {
  const { data, error } = await supabaseAdmin
    .from('vendor_profiles')
    .upsert({
      user_id: userId,
      business_name: businessName,
      contact_number: contactNumber || null,
      service_area: serviceArea || null
    }, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  findByUserId,
  findOrganizerProfile,
  findVendorProfile,
  createProfile,
  updateRole,
  upsertOrganizerProfile,
  upsertVendorProfile
};
