const { supabase } = require('../config/supabase');

async function getDashboardSummary() {
  const { data, error } = await supabase
    .from('admin_dashboard_summary')
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data || {
    total_organizers: 0,
    total_vendors: 0,
    total_events: 0,
    large_events_500plus: 0,
    pending_bookings: 0,
    accepted_bookings: 0,
    completed_bookings: 0,
    confirmed_bookings: 0,
    rejected_bookings: 0,
    cancelled_bookings: 0,
    pending_verifications: 0,
    draft_contracts: 0,
    active_contracts: 0
  };
}

async function listUsers({ page, limit, role, search }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('user_profiles')
    .select('*', { count: 'exact' });

  if (role) {
    query = query.eq('role', role);
  }

  if (search) {
    query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data: data || [], total: count || 0 };
}

async function listEvents({ page, limit, status, search }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('large_events')
    .select('*, organizer_profiles!inner(organization_name)', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data: data || [], total: count || 0 };
}

async function listBookings({ page, limit, status, search }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('bookings')
    .select(`
      *,
      large_events!inner(title, event_date, venue),
      organizer_profiles!inner(organization_name),
      vendor_profiles!inner(business_name),
      event_requirements!inner(category)
    `, { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(
      `large_events.title.ilike.%${search}%,vendor_profiles.business_name.ilike.%${search}%,organizer_profiles.organization_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query
    .order('requested_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data: data || [], total: count || 0 };
}

async function listVendors({ page, limit, status, search }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('vendor_profiles')
    .select('*', { count: 'exact' });

  if (status) {
    query = query.eq('verification_status', status);
  }

  if (search) {
    query = query.or(`business_name.ilike.%${search}%,service_area.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data: data || [], total: count || 0 };
}

async function updateVendorVerification(vendorId, verificationStatus) {
  const { data, error } = await supabase
    .from('vendor_profiles')
    .update({ verification_status: verificationStatus })
    .eq('id', vendorId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function overrideBookingStatus(bookingId, status) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function findVendorById(vendorId) {
  const { data, error } = await supabase
    .from('vendor_profiles')
    .select('*')
    .eq('id', vendorId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findBookingById(bookingId) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findUserByVendorId(vendorId) {
  const { data, error } = await supabase
    .from('vendor_profiles')
    .select('user_id')
    .eq('id', vendorId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

module.exports = {
  getDashboardSummary,
  listUsers,
  listEvents,
  listBookings,
  listVendors,
  updateVendorVerification,
  overrideBookingStatus,
  findVendorById,
  findBookingById,
  findUserByVendorId
};
