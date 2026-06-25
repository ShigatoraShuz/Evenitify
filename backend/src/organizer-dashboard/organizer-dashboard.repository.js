const { supabase } = require('../config/supabase');

async function findOrganizerProfileByUserId(userId) {
  const { data, error } = await supabase
    .from('organizer_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function findEventsByOrganizerId(organizerId) {
  const { data, error } = await supabase
    .from('large_events')
    .select('*')
    .eq('organizer_id', organizerId)
    .order('event_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function findBookingsByOrganizerId(organizerId) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      large_events(id, title, event_date, venue),
      vendor_profiles(id, business_name, rating),
      event_requirements(id, category),
      contracts(contract_status)
    `)
    .eq('organizer_id', organizerId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function findVendorRequestsByOrganizerId(organizerId) {
  const { data, error } = await supabase
    .from('procurement_requests')
    .select(`
      *,
      large_events(id, title, event_date, venue),
      vendor_profiles(id, business_name, rating),
      vendor_services(id, category, service_name),
      request_vendors(id, status, request_message, budget_min, budget_max, deadline, sent_at, viewed_at, accepted_at, rejected_at, changes_requested_at, vendor_service_id)
    `)
    .eq('organizer_id', organizerId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function findUnreadNotificationsByUserId(userId, limit = 5) {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, notification_type, title, message, action_url, created_at')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

async function findRecentBookingActivityByOrganizerId(organizerId, limit = 10) {
  const { data, error } = await supabase
    .from('booking_status_history')
    .select(`
      id,
      new_status,
      reason,
      created_at,
      bookings!inner(
        id,
        organizer_id,
        large_events(title),
        vendor_profiles(business_name),
        event_requirements(category)
      )
    `)
    .eq('bookings.organizer_id', organizerId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

async function findRelevantVendorServices(categories, limit = 6) {
  if (!categories.length) {
    return [];
  }

  const { data, error } = await supabase
    .from('vendor_services')
    .select(`
      id,
      category,
      base_price,
      availability_status,
      vendor_profiles!inner(id, business_name, rating, verification_status)
    `)
    .in('category', categories)
    .in('availability_status', ['available', 'limited'])
    .order('base_price', { ascending: true })
    .limit(limit * 3);

  if (error) throw error;
  return data || [];
}

module.exports = {
  findOrganizerProfileByUserId,
  findEventsByOrganizerId,
  findBookingsByOrganizerId,
  findVendorRequestsByOrganizerId,
  findUnreadNotificationsByUserId,
  findRecentBookingActivityByOrganizerId,
  findRelevantVendorServices
};
