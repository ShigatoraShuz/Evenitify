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
  if (input.businessDescription !== undefined) updates.business_description = input.businessDescription;
  if (input.contactNumber !== undefined) updates.contact_number = input.contactNumber;
  if (input.phone !== undefined) updates.contact_number = input.phone;
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

  if (filters.businessName) {
    query = query.ilike('business_name', `%${filters.businessName}%`);
  }

  if (filters.minRating) {
    query = query.gte('rating', filters.minRating);
  }

  if (filters.location) {
    query = query.ilike('service_area', `%${filters.location}%`);
  }

  const orderColumn = filters.sortBy === 'name' ? 'business_name' : 'rating';
  const orderAsc = filters.sortOrder === 'asc';

  const { data, error } = await query.order(orderColumn, { ascending: orderAsc });

  if (error) throw error;
  return data || [];
}

async function searchVendorServices(vendorIds, category, minBudget, maxBudget, sortBy) {
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

  if (sortBy === 'price_asc') {
    query = query.order('base_price', { ascending: true });
  } else if (sortBy === 'price_desc') {
    query = query.order('base_price', { ascending: false });
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

async function listB2BBookings(vendorId, statusFilter, bookingTypeFilter) {
  let query = supabase
    .from('bookings')
    .select(`
      *,
      large_events!inner(title, event_date, venue, expected_guests, status),
      event_requirements!inner(category, quantity),
      organizer_profiles!inner(organization_name)
    `)
    .eq('vendor_id', vendorId)
    .order('requested_at', { ascending: false });

  if (bookingTypeFilter && bookingTypeFilter !== 'all') {
    query = query.eq('booking_type', bookingTypeFilter === 'large_event' ? 'B2B' : 'PERSONAL');
  }

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

// Quote methods

async function findOrCreateProcurementRequest(eventId, organizerId, title) {
  const { data: existing } = await supabase
    .from('procurement_requests')
    .select('id')
    .eq('event_id', eventId)
    .eq('organizer_id', organizerId)
    .limit(1)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('procurement_requests')
    .insert({
      event_id: eventId,
      organizer_id: organizerId,
      title: title || 'Procurement Request',
      status: 'open'
    })
    .select('id')
    .single();

  if (error) throw error;
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

async function findQuoteByVendorAndRequirement(vendorId, requirementId) {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('requirement_id', requirementId)
    .maybeSingle();

  if (error) throw error;
  return data;
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
  updateBookingStatus,
  findOrCreateProcurementRequest,
  createQuote,
  findQuoteByVendorAndRequirement
};
