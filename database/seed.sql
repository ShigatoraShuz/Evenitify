-- Seed data for Eventify B2B platform
-- Run after migrations have been applied

-- Insert test organizer (user_id references a placeholder - update with actual auth user)
INSERT INTO organizer_profiles (user_id, organization_name, contact_number, business_address)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Eventful Inc.', '+1-555-0100', '123 Event St, New York, NY'),
  ('00000000-0000-0000-0000-000000000002', 'Gala Planners', '+1-555-0101', '456 Gala Ave, Los Angeles, CA')
ON CONFLICT DO NOTHING;

-- Insert test vendors
INSERT INTO vendor_profiles (user_id, business_name, contact_number, service_area, rating, verification_status)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'Elite Catering Co.', '+1-555-0200', 'New York, NY', 4.8, 'verified'),
  ('00000000-0000-0000-0000-000000000011', 'SoundWave Productions', '+1-555-0201', 'Los Angeles, CA', 4.5, 'verified'),
  ('00000000-0000-0000-0000-000000000012', 'Grand Venues Ltd.', '+1-555-0202', 'New York, NY', 4.9, 'verified'),
  ('00000000-0000-0000-0000-000000000013', 'CaptureTheMoment', '+1-555-0203', 'San Francisco, CA', 4.6, 'verified'),
  ('00000000-0000-0000-0000-000000000014', 'ProStaff Events', '+1-555-0204', 'Miami, FL', 4.3, 'verified'),
  ('00000000-0000-0000-0000-000000000015', 'Luxury Transports', '+1-555-0205', 'New York, NY', 4.7, 'verified')
ON CONFLICT DO NOTHING;

-- Insert vendor services
INSERT INTO vendor_services (vendor_id, category, service_name, description, base_price, availability_status)
VALUES
  ((SELECT id FROM vendor_profiles WHERE business_name = 'Elite Catering Co.'), 'Catering', 'Premium Buffet', 'Full premium buffet service for up to 500 guests', 5000.00, 'available'),
  ((SELECT id FROM vendor_profiles WHERE business_name = 'Elite Catering Co.'), 'Catering', 'Plated Dinner', '5-course plated dinner service', 8000.00, 'available'),
  ((SELECT id FROM vendor_profiles WHERE business_name = 'SoundWave Productions'), 'Lights and Sounds', 'Basic PA System', 'Complete PA system with 2 speakers and mixer', 1500.00, 'available'),
  ((SELECT id FROM vendor_profiles WHERE business_name = 'SoundWave Productions'), 'Lights and Sounds', 'Premium AV Package', 'Full lighting, sound, and video setup', 5000.00, 'available'),
  ((SELECT id FROM vendor_profiles WHERE business_name = 'Grand Venues Ltd.'), 'Venue', 'Grand Ballroom', 'Elegant ballroom for up to 1000 guests', 15000.00, 'available'),
  ((SELECT id FROM vendor_profiles WHERE business_name = 'CaptureTheMoment'), 'Photo/Video', 'Event Photography', '8-hour event photography with 2 photographers', 2500.00, 'available'),
  ((SELECT id FROM vendor_profiles WHERE business_name = 'CaptureTheMoment'), 'Photo/Video', 'Videography Package', 'Full event videography with edited highlight reel', 3500.00, 'available'),
  ((SELECT id FROM vendor_profiles WHERE business_name = 'ProStaff Events'), 'Staff', 'Event Staff Package', '10 event staff for 8 hours', 2000.00, 'available'),
  ((SELECT id FROM vendor_profiles WHERE business_name = 'ProStaff Events'), 'Staff', 'VIP Security', '4 licensed security personnel', 1500.00, 'available'),
  ((SELECT id FROM vendor_profiles WHERE business_name = 'Luxury Transports'), 'Transport', 'Luxury Fleet', '5 luxury vehicles with drivers for 12 hours', 4000.00, 'limited'),
  ((SELECT id FROM vendor_profiles WHERE business_name = 'Luxury Transports'), 'Transport', 'Shuttle Service', '2 shuttle buses for guest transport', 2000.00, 'available')
ON CONFLICT DO NOTHING;

-- Insert large events
INSERT INTO large_events (organizer_id, title, event_date, venue, budget, expected_guests, status)
VALUES
  ((SELECT id FROM organizer_profiles WHERE organization_name = 'Eventful Inc.'), 'Tech Summit 2026', '2026-09-15', 'Convention Center NYC', 100000.00, 500, 'booking'),
  ((SELECT id FROM organizer_profiles WHERE organization_name = 'Eventful Inc.'), 'Charity Gala', '2026-12-01', 'Ritz Carlton NYC', 75000.00, 300, 'planning'),
  ((SELECT id FROM organizer_profiles WHERE organization_name = 'Gala Planners'), 'Film Premiere', '2026-08-20', 'Sunset Theater LA', 200000.00, 800, 'booking');

-- Insert event requirements
INSERT INTO event_requirements (event_id, category, quantity, min_budget, max_budget, requirement_status)
SELECT e.id, 'Catering', 1, 5000, 15000, 'open'
FROM large_events e WHERE e.title = 'Tech Summit 2026'
UNION ALL
SELECT e.id, 'Lights and Sounds', 1, 3000, 10000, 'open'
FROM large_events e WHERE e.title = 'Tech Summit 2026'
UNION ALL
SELECT e.id, 'Venue', 1, 10000, 30000, 'fulfilled'
FROM large_events e WHERE e.title = 'Tech Summit 2026'
UNION ALL
SELECT e.id, 'Catering', 1, 8000, 20000, 'open'
FROM large_events e WHERE e.title = 'Charity Gala'
UNION ALL
SELECT e.id, 'Photo/Video', 1, 2000, 5000, 'open'
FROM large_events e WHERE e.title = 'Charity Gala'
UNION ALL
SELECT e.id, 'Catering', 1, 10000, 30000, 'pending_booking'
FROM large_events e WHERE e.title = 'Film Premiere'
UNION ALL
SELECT e.id, 'Lights and Sounds', 1, 5000, 15000, 'open'
FROM large_events e WHERE e.title = 'Film Premiere';

-- Insert test bookings (with various statuses)
INSERT INTO bookings (event_id, requirement_id, vendor_id, organizer_id, status, requested_budget, notes)
SELECT
  e.id,
  (SELECT id FROM event_requirements WHERE event_id = e.id AND category = 'Venue' LIMIT 1),
  (SELECT id FROM vendor_profiles WHERE business_name = 'Grand Venues Ltd.'),
  e.organizer_id,
  'accepted',
  25000.00,
  'Would like to schedule a site visit next week'
FROM large_events e WHERE e.title = 'Tech Summit 2026'
UNION ALL
SELECT
  e.id,
  (SELECT id FROM event_requirements WHERE event_id = e.id AND category = 'Catering' LIMIT 1),
  (SELECT id FROM vendor_profiles WHERE business_name = 'Elite Catering Co.'),
  e.organizer_id,
  'pending',
  12000.00,
  'Need menu customization for dietary restrictions'
FROM large_events e WHERE e.title = 'Tech Summit 2026'
UNION ALL
SELECT
  e.id,
  (SELECT id FROM event_requirements WHERE event_id = e.id AND category = 'Catering' LIMIT 1),
  (SELECT id FROM vendor_profiles WHERE business_name = 'Elite Catering Co.'),
  e.organizer_id,
  'pending',
  18000.00,
  'Requesting premium buffet for 300 guests'
FROM large_events e WHERE e.title = 'Film Premiere';

-- Insert contracts for accepted bookings
INSERT INTO contracts (booking_id, contract_number, terms_summary, contract_status)
SELECT
  b.id,
  'CNT-2026-' || b.id::text,
  'Standard event service agreement. Payment terms: 50% deposit upon signing, 50% due 7 days before event.',
  'organizer_signed'
FROM bookings b
JOIN large_events e ON b.event_id = e.id
WHERE e.title = 'Tech Summit 2026' AND b.status = 'accepted';

-- Update fulfilled requirement status
UPDATE event_requirements
SET requirement_status = 'fulfilled'
WHERE category = 'Venue'
  AND event_id IN (SELECT id FROM large_events WHERE title = 'Tech Summit 2026');

-- Insert booking status history
INSERT INTO booking_status_history (booking_id, previous_status, new_status, reason)
SELECT
  b.id,
  'pending',
  'accepted',
  'Organizer accepted the venue booking'
FROM bookings b
JOIN large_events e ON b.event_id = e.id
WHERE e.title = 'Tech Summit 2026' AND b.status = 'accepted';
