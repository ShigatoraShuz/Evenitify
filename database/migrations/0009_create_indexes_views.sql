-- Indexes
create index idx_large_events_organizer_id on public.large_events(organizer_id);
create index idx_event_requirements_event_id on public.event_requirements(event_id);
create index idx_vendor_services_vendor_id on public.vendor_services(vendor_id);
create index idx_vendor_services_category_price on public.vendor_services(category, base_price);
create index idx_bookings_event_id on public.bookings(event_id);
create index idx_bookings_vendor_id_status on public.bookings(vendor_id, status);
create index idx_bookings_organizer_id_status on public.bookings(organizer_id, status);
create index idx_contracts_booking_id on public.contracts(booking_id);
create index idx_notifications_user_read on public.notifications(user_id, is_read, created_at desc);
create index idx_booking_status_history_booking_id on public.booking_status_history(booking_id, created_at desc);

-- Views
create or replace view public.event_portfolio_summary as
select
  le.id as event_id,
  le.title as event_title,
  le.event_date,
  le.venue,
  le.budget,
  le.expected_guests,
  le.status as event_status,
  op.organization_name,
  op.id as organizer_profile_id,
  count(distinct er.id) as requirement_count,
  count(distinct b.id) as booking_count,
  count(distinct case when b.status = 'pending' then b.id end) as pending_bookings,
  count(distinct case when b.status = 'confirmed' then b.id end) as confirmed_bookings,
  count(distinct case when b.status = 'completed' then b.id end) as completed_bookings,
  count(distinct c.id) as contract_count
from public.large_events le
join public.organizer_profiles op on op.id = le.organizer_id
left join public.event_requirements er on er.event_id = le.id
left join public.bookings b on b.event_id = le.id
left join public.contracts c on c.booking_id = b.id
group by le.id, op.id;

create or replace view public.vendor_b2b_booking_queue as
select
  b.id as booking_id,
  b.status,
  b.requested_budget,
  b.notes,
  b.requested_at,
  le.id as event_id,
  le.title as event_title,
  le.event_date,
  le.venue,
  le.expected_guests,
  er.category as requirement_category,
  er.quantity as requirement_quantity,
  vp.id as vendor_profile_id,
  vp.business_name as vendor_business_name,
  op.id as organizer_profile_id,
  op.organization_name
from public.bookings b
join public.large_events le on le.id = b.event_id
join public.event_requirements er on er.id = b.requirement_id
join public.vendor_profiles vp on vp.id = b.vendor_id
join public.organizer_profiles op on op.id = b.organizer_id
where b.booking_type = 'B2B';

create or replace view public.admin_booking_overview as
select
  b.id as booking_id,
  b.status,
  b.booking_type,
  b.requested_budget,
  b.requested_at,
  b.updated_at,
  le.title as event_title,
  op.organization_name,
  vp.business_name as vendor_business_name,
  er.category as requirement_category
from public.bookings b
join public.large_events le on le.id = b.event_id
join public.organizer_profiles op on op.id = b.organizer_id
join public.vendor_profiles vp on vp.id = b.vendor_id
join public.event_requirements er on er.id = b.requirement_id;
