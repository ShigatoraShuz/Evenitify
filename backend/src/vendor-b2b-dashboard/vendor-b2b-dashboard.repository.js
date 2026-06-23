const { supabase } = require('../config/supabase');

async function findByUserId(userId) {
  const { data, error } = await supabase
    .from('vendor_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findById(vendorId) {
  const { data, error } = await supabase
    .from('vendor_profiles')
    .select('*')
    .eq('id', vendorId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function updateProfile(vendorId, input) {
  const updates = {};
  if (input.businessName !== undefined) updates.business_name = input.businessName;
  if (input.contactNumber !== undefined) updates.contact_number = input.contactNumber;
  if (input.serviceArea !== undefined) updates.service_area = input.serviceArea;

  const { data, error } = await supabase
    .from('vendor_profiles')
    .update(updates)
    .eq('id', vendorId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function listServices(vendorId) {
  const { data, error } = await supabase
    .from('vendor_services')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function createService(vendorId, input) {
  const { data, error } = await supabase
    .from('vendor_services')
    .insert({
      vendor_id: vendorId,
      category: input.category,
      service_name: input.serviceName,
      description: input.description || null,
      base_price: input.basePrice,
      availability_status: input.availabilityStatus || 'available'
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function updateService(serviceId, vendorId, input) {
  const updates = {};
  if (input.category !== undefined) updates.category = input.category;
  if (input.serviceName !== undefined) updates.service_name = input.serviceName;
  if (input.description !== undefined) updates.description = input.description;
  if (input.basePrice !== undefined) updates.base_price = input.basePrice;
  if (input.availabilityStatus !== undefined) updates.availability_status = input.availabilityStatus;

  const { data, error } = await supabase
    .from('vendor_services')
    .update(updates)
    .eq('id', serviceId)
    .eq('vendor_id', vendorId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function searchVendors(filters) {
  let query = supabase
    .from('vendor_profiles')
    .select('*')
    .eq('verification_status', 'verified');

  if (filters.minRating) {
    query = query.gte('rating', filters.minRating);
  }

  if (filters.location) {
    query = query.ilike('service_area', `%${filters.location}%`);
  }

  const { data, error } = await query.order('rating', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function searchVendorServices(vendorIds, category, minBudget, maxBudget) {
  let query = supabase
    .from('vendor_services')
    .select('*, vendor_profiles!inner(*)')
    .in('vendor_id', vendorIds)
    .neq('availability_status', 'unavailable');

  if (category) {
    query = query.eq('category', category);
  }

  if (minBudget !== undefined) {
    query = query.gte('base_price', minBudget);
  }

  if (maxBudget !== undefined) {
    query = query.lte('base_price', maxBudget);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

async function getVendorWithServices(vendorId) {
  const vendor = await findById(vendorId);
  if (!vendor) return null;

  const { data: services } = await supabase
    .from('vendor_services')
    .select('*')
    .eq('vendor_id', vendorId)
    .neq('availability_status', 'unavailable');

  return { ...vendor, services: services || [] };
}

async function listB2BBookings(vendorId, statusFilter) {
  let query = supabase
    .from('bookings')
    .select(`
      *,
      large_events!inner(title, event_date, venue, expected_guests, status),
      event_requirements!inner(category, quantity),
      organizer_profiles!inner(organization_name)
    `)
    .eq('vendor_id', vendorId)
    .eq('booking_type', 'B2B')
    .order('requested_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

async function findBookingById(bookingId) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      large_events!inner(title, event_date, venue, expected_guests, budget, status),
      event_requirements!inner(category, quantity, min_budget, max_budget),
      organizer_profiles!inner(organization_name, contact_number)
    `)
    .eq('id', bookingId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function updateBookingStatus(bookingId, vendorId, status, reason) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .eq('vendor_id', vendorId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  findByUserId,
  findById,
  updateProfile,
  listServices,
  createService,
  updateService,
  searchVendors,
  searchVendorServices,
  getVendorWithServices,
  listB2BBookings,
  findBookingById,
  updateBookingStatus
};
