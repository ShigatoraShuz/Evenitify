require('dotenv').config({ path: require('node:path').resolve(__dirname, '..', '.env') });

const { createClient } = require('@supabase/supabase-js');

const organizerEmail = process.env.E2E_ORGANIZER_EMAIL || 'organizer.test@eventify.dev';
const organizerPassword = process.env.E2E_ORGANIZER_PASSWORD;
const vendorEmail = process.env.E2E_VENDOR_EMAIL || 'vendor.test@eventify.dev';
const vendorPassword = process.env.E2E_VENDOR_PASSWORD;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Manual setup required.');
  process.exit(1);
}

if (!organizerPassword || !vendorPassword) {
  console.error('Missing E2E_ORGANIZER_PASSWORD or E2E_VENDOR_PASSWORD. Export both and rerun.');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function ensureAuthUser({ email, password, role, displayName }) {
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listError) throw listError;

  const existing = usersData.users.find((user) => user.email === email);
  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      email,
      password,
      email_confirm: true,
      user_metadata: { role, display_name: displayName }
    });
    if (error) throw error;
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, display_name: displayName }
  });
  if (error) throw error;
  return data.user;
}

async function ensureUserProfile(userId, email, role, displayName) {
  const { data: existing, error: existingError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (existingError) throw existingError;

  if (existing) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ email, role, display_name: displayName })
      .eq('id', userId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({ id: userId, email, role, display_name: displayName })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function ensureOrganizerProfile(userId) {
  const payload = {
    user_id: userId,
    organization_name: 'Alpha Events Test Org',
    contact_number: '09170000001',
    business_address: 'Manila',
    organization_type: 'Corporate'
  };
  const { data, error } = await supabase
    .from('organizer_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function ensureVendorProfile(userId) {
  const payload = {
    user_id: userId,
    business_name: 'Stellar Catering Test Vendor',
    contact_number: '09170000002',
    service_area: 'Manila',
    business_description: 'Development-only vendor profile for authenticated end-to-end verification.',
    verification_status: 'verified'
  };
  const { data, error } = await supabase
    .from('vendor_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function ensureVendorService(vendorProfileId) {
  const { data: existing, error: existingError } = await supabase
    .from('vendor_services')
    .select('*')
    .eq('vendor_id', vendorProfileId)
    .eq('service_name', 'Premium Catering Package')
    .maybeSingle();
  if (existingError) throw existingError;

  const payload = {
    vendor_id: vendorProfileId,
    category: 'Catering',
    service_name: 'Premium Catering Package',
    description: 'Development-only service package for Eventify end-to-end verification.',
    base_price: 125000,
    availability_status: 'available'
  };

  if (existing) {
    const { data, error } = await supabase
      .from('vendor_services')
      .update(payload)
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('vendor_services')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function ensureEvent(organizerProfileId) {
  const { data: existing, error: existingError } = await supabase
    .from('large_events')
    .select('*')
    .eq('organizer_id', organizerProfileId)
    .eq('title', 'Eventify E2E Test Summit')
    .maybeSingle();
  if (existingError) throw existingError;

  const payload = {
    organizer_id: organizerProfileId,
    title: 'Eventify E2E Test Summit',
    event_date: '2027-03-15',
    venue: 'Manila',
    budget: 500000,
    expected_guests: 500,
    status: 'planning'
  };

  if (existing) {
    const { data, error } = await supabase
      .from('large_events')
      .update(payload)
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('large_events')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function ensureRequirement(eventId) {
  const { data: existing, error: existingError } = await supabase
    .from('event_requirements')
    .select('*')
    .eq('event_id', eventId)
    .eq('category', 'Catering')
    .maybeSingle();
  if (existingError) throw existingError;

  const payload = {
    event_id: eventId,
    category: 'Catering',
    quantity: 1,
    min_budget: 100000,
    max_budget: 150000,
    requirement_status: 'open',
    notes: 'Development-only catering requirement for authenticated request flow verification.'
  };

  if (existing) {
    const { data, error } = await supabase
      .from('event_requirements')
      .update(payload)
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('event_requirements')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function main() {
  const organizerUser = await ensureAuthUser({
    email: organizerEmail,
    password: organizerPassword,
    role: 'organizer',
    displayName: 'Eventify Test Organizer'
  });
  await ensureUserProfile(organizerUser.id, organizerEmail, 'organizer', 'Eventify Test Organizer');
  const organizerProfile = await ensureOrganizerProfile(organizerUser.id);
  const event = await ensureEvent(organizerProfile.id);
  const requirement = await ensureRequirement(event.id);

  const vendorUser = await ensureAuthUser({
    email: vendorEmail,
    password: vendorPassword,
    role: 'vendor',
    displayName: 'Eventify Test Vendor'
  });
  await ensureUserProfile(vendorUser.id, vendorEmail, 'vendor', 'Eventify Test Vendor');
  const vendorProfile = await ensureVendorProfile(vendorUser.id);
  const service = await ensureVendorService(vendorProfile.id);

  console.log(JSON.stringify({
    organizer: { email: organizerEmail, userId: organizerUser.id, organizerProfileId: organizerProfile.id },
    vendor: { email: vendorEmail, userId: vendorUser.id, vendorProfileId: vendorProfile.id },
    event: { id: event.id, title: event.title },
    requirement: { id: requirement.id, category: requirement.category },
    service: { id: service.id, name: service.service_name, category: service.category }
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
