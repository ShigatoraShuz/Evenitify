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

function applyVendorFilter(query, column, vendorIds) {
  const ids = [...new Set((vendorIds || []).filter(Boolean))];
  if (ids.length === 0) return query;
  if (ids.length === 1) return query.eq(column, ids[0]);
  return query.in(column, ids);
}

async function listVendorRequests(vendorIds, statusFilter, requestTypeFilter) {
  const ids = [...new Set((vendorIds || []).filter(Boolean))];
  if (ids.length === 0) return [];

  let requestVendorQuery = supabase
    .from('request_vendors')
    .select('request_id, vendor_id, status')
    .order('updated_at', { ascending: false });

  requestVendorQuery = applyVendorFilter(requestVendorQuery, 'vendor_id', ids);

  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === 'pending') {
      requestVendorQuery = requestVendorQuery.in('status', ['open', 'pending', 'viewed']);
    } else if (statusFilter === 'changes_requested') {
      requestVendorQuery = requestVendorQuery.eq('status', 'changes_requested');
    } else {
      requestVendorQuery = requestVendorQuery.eq('status', statusFilter);
    }
  }

  const { data: requestVendorRows, error: requestVendorError } = await requestVendorQuery;
  if (requestVendorError) throw requestVendorError;

  const requestIds = [...new Set((requestVendorRows || []).map((row) => row.request_id).filter(Boolean))];
  if (requestIds.length === 0) return [];

  let query = supabase
    .from('procurement_requests')
    .select(`
      *,
      large_events(title, event_date, venue, expected_guests),
      organizer_profiles(organization_name),
      vendor_profiles(business_name),
      vendor_services(id, service_name, category),
      request_vendors(*)
    `)
    .in('id', requestIds)
    .order('updated_at', { ascending: false });

  if (requestTypeFilter && requestTypeFilter !== 'all') {
    // Organizer B2B requests are stored as procurement requests and should not be
    // filtered by event lifecycle status. Keep this branch as a no-op until we
    // have a real request-type column to target.
    query = query;
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function listVendorBookings(vendorIds, statusFilter, requestTypeFilter) {
  let query = supabase
    .from('bookings')
    .select(`
      *,
      large_events(title, event_date, venue, expected_guests, status),
      organizer_profiles(organization_name),
      vendor_profiles(business_name),
      event_requirements(category, quantity, min_budget, max_budget, notes, requirement_status)
    `)
    .order('requested_at', { ascending: false });

  query = applyVendorFilter(query, 'vendor_id', vendorIds);

  if (requestTypeFilter && requestTypeFilter !== 'all') {
    // Vendor booking types are not represented by event lifecycle status.
    // Keep all vendor bookings here so organizer RFQs and legacy bookings stay visible.
    query = query;
  }

  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === 'pending') {
      query = query.in('status', ['pending']);
    } else if (statusFilter === 'changes_requested') {
      query = query.eq('status', 'changes_requested');
    } else {
      query = query.eq('status', statusFilter);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function listVendorB2BRequests(vendorIds, statusFilter, requestTypeFilter) {
  const [requests, bookings] = await Promise.all([
    listVendorRequests(vendorIds, statusFilter, requestTypeFilter),
    listVendorBookings(vendorIds, statusFilter, requestTypeFilter)
  ]);

  return [...requests, ...bookings];
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

async function findRequestById(requestId) {
  const { data, error } = await supabase
    .from('procurement_requests')
    .select(`
      *,
      large_events(title, event_date, venue, expected_guests, budget, status),
      organizer_profiles(id, user_id, organization_name, contact_number),
      vendor_profiles(id, user_id, business_name, contact_number),
      vendor_services(id, service_name, category),
      request_vendors!inner(*)
    `)
    .eq('id', requestId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findBookingById(bookingId) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      large_events(title, event_date, venue, expected_guests, budget, status),
      organizer_profiles(id, user_id, organization_name, contact_number),
      vendor_profiles(id, user_id, business_name, contact_number),
      event_requirements(category, quantity, min_budget, max_budget, notes, requirement_status)
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

async function createRequest(input) {
  const { data, error } = await supabase
    .from('procurement_requests')
    .insert({
      event_id: input.eventId,
      organizer_id: input.organizerId,
      vendor_id: input.vendorId,
      vendor_service_id: input.vendorServiceId || null,
      title: input.title,
      description: input.requestMessage || null,
      request_message: input.requestMessage || null,
      budget_min: input.budgetMin ?? null,
      budget_max: input.budgetMax ?? null,
      deadline: input.deadline || null,
      status: 'open'
    })
    .select('*')
    .single();

  if (error) throw error;

  const { error: rvError } = await supabase
    .from('request_vendors')
    .insert({
      request_id: data.id,
      vendor_id: input.vendorId,
      vendor_service_id: input.vendorServiceId || null,
      request_message: input.requestMessage || null,
      budget_min: input.budgetMin ?? null,
      budget_max: input.budgetMax ?? null,
      deadline: input.deadline || null,
      status: 'pending'
    });

  if (rvError) throw rvError;
  return data;
}

async function updateRequestVendorStatus(requestId, vendorId, status, reason) {
  const updates = { status, responded_at: new Date().toISOString() };
  if (status === 'viewed') updates.viewed_at = new Date().toISOString();
  if (status === 'accepted') updates.accepted_at = new Date().toISOString();
  if (status === 'rejected') updates.rejected_at = new Date().toISOString();
  if (status === 'changes_requested') updates.changes_requested_at = new Date().toISOString();
  if (status === 'changes_requested' && reason) updates.request_message = reason;

  const { data, error } = await supabase
    .from('request_vendors')
    .update(updates)
    .eq('request_id', requestId)
    .eq('vendor_id', vendorId)
    .select('*')
    .single();
  if (error) throw error;

  await supabase.from('procurement_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', requestId);
  return data;
}

async function updateRequestStatus(requestId, status) {
  const { data, error } = await supabase
    .from('procurement_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)
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
  listVendorRequests,
  listVendorBookings,
  findRequestById,
  findBookingById,
  updateBookingStatus,
  createRequest,
  updateRequestVendorStatus,
  updateRequestStatus,
  findOrCreateProcurementRequest,
  createQuote,
  findQuoteByVendorAndRequirement,
  listVendorB2BRequests
};
