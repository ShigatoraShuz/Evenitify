-- ============================================================================
-- EVENTIFY - Phase: Feature Audit Fixes
-- Adds missing tables: procurement_requests, request_vendors, quotes, service_categories
-- Fixes: booking_type constraint, missing columns, RLS policies
-- ============================================================================

-- 1. New Enums
do $$ begin
  create type public.quote_status as enum ('pending', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn');
exception when duplicate_object then null;
end $$;

-- 2. service_categories (normalized lookup)
create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

-- Seed standard service categories
insert into public.service_categories (name) values
  ('catering'), ('av'), ('lighting'), ('security'),
  ('logistics'), ('decor'), ('photography'), ('entertainment'),
  ('transportation'), ('staff'), ('venue'), ('equipment')
on conflict (name) do nothing;

-- 3. procurement_requests (formal RFQ entity per event)
create table if not exists public.procurement_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.large_events(id) on delete cascade,
  organizer_id uuid not null references public.organizer_profiles(id) on delete cascade,
  title text not null,
  description text,
  status public.requirement_status not null default 'open',
  deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. request_vendors (junction: procurement_request → vendors)
create table if not exists public.request_vendors (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.procurement_requests(id) on delete cascade,
  vendor_id uuid not null references public.vendor_profiles(id) on delete cascade,
  status text not null default 'invited',
  invited_at timestamptz not null default now(),
  responded_at timestamptz,
  unique(request_id, vendor_id)
);

-- 5. quotes (vendor-submitted price quotes)
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.procurement_requests(id) on delete cascade,
  vendor_id uuid not null references public.vendor_profiles(id) on delete cascade,
  requirement_id uuid references public.event_requirements(id) on delete set null,
  price numeric(12,2) not null check (price >= 0),
  notes text,
  status public.quote_status not null default 'submitted',
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Fix bookings table
-- 6a. Drop constraint that forces ALL bookings to be B2B (blocks PERSONAL event support)
alter table public.bookings drop constraint if exists booking_type_for_event;

-- 6b. Add response_deadline column for vendor request deadline tracking
alter table public.bookings
  add column if not exists response_deadline timestamptz;

-- 7. Add denormalized FKs to contracts for direct event/vendor querying
alter table public.contracts
  add column if not exists event_id uuid references public.large_events(id) on delete cascade,
  add column if not exists vendor_id uuid references public.vendor_profiles(id) on delete cascade;

-- 8. Enable RLS on new tables
alter table if exists public.service_categories enable row level security;
alter table if exists public.procurement_requests enable row level security;
alter table if exists public.request_vendors enable row level security;
alter table if exists public.quotes enable row level security;

-- 9. RLS policies for service_categories (public read, admin write)
do $$ begin
  create policy "anyone can read service categories"
    on public.service_categories for select
    using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "admin can manage service categories"
    on public.service_categories for all
    using (public.is_admin());
exception when duplicate_object then null;
end $$;

-- 10. RLS policies for procurement_requests
do $$ begin
  create policy "organizers can read own procurement requests"
    on public.procurement_requests for select
    using (public.is_admin() or organizer_id = public.current_organizer_profile_id());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can create procurement requests"
    on public.procurement_requests for insert
    with check (organizer_id = public.current_organizer_profile_id());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can update own procurement requests"
    on public.procurement_requests for update
    using (organizer_id = public.current_organizer_profile_id())
    with check (organizer_id = public.current_organizer_profile_id());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can delete own procurement requests"
    on public.procurement_requests for delete
    using (organizer_id = public.current_organizer_profile_id());
exception when duplicate_object then null;
end $$;

-- 11. RLS policies for request_vendors
do $$ begin
  create policy "organizers and vendors can read request_vendors"
    on public.request_vendors for select
    using (public.is_admin()
      or exists (select 1 from public.procurement_requests pr where pr.id = request_vendors.request_id and pr.organizer_id = public.current_organizer_profile_id())
      or vendor_id = public.current_vendor_profile_id());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can manage request_vendors"
    on public.request_vendors for insert
    with check (exists (select 1 from public.procurement_requests pr where pr.id = request_vendors.request_id and pr.organizer_id = public.current_organizer_profile_id()));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can update request_vendors"
    on public.request_vendors for update
    using (exists (select 1 from public.procurement_requests pr where pr.id = request_vendors.request_id and pr.organizer_id = public.current_organizer_profile_id()))
    with check (exists (select 1 from public.procurement_requests pr where pr.id = request_vendors.request_id and pr.organizer_id = public.current_organizer_profile_id()));
exception when duplicate_object then null;
end $$;

-- 12. RLS policies for quotes
do $$ begin
  create policy "organizers and vendors can read quotes"
    on public.quotes for select
    using (public.is_admin()
      or exists (select 1 from public.procurement_requests pr where pr.id = quotes.request_id and pr.organizer_id = public.current_organizer_profile_id())
      or vendor_id = public.current_vendor_profile_id());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "vendors can create quotes"
    on public.quotes for insert
    with check (vendor_id = public.current_vendor_profile_id());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "vendors can update own quotes"
    on public.quotes for update
    using (vendor_id = public.current_vendor_profile_id())
    with check (vendor_id = public.current_vendor_profile_id());
exception when duplicate_object then null;
end $$;

-- 13. Fix bookings insert RLS — remove B2B-only restriction
drop policy if exists "organizers can create b2b bookings" on public.bookings;

do $$ begin
  create policy "organizers can create bookings"
    on public.bookings for insert
    with check (
      organizer_id = public.current_organizer_profile_id()
      and status = 'pending'
    );
exception when duplicate_object then null;
end $$;

-- 14. Update notification trigger — remove "B2B" label to be type-agnostic
create or replace function public.create_booking_notification()
returns trigger
language plpgsql
as $$
declare
  v_organizer_user_id uuid;
  v_vendor_user_id uuid;
  v_event_title text;
  v_notification_type text;
  v_priority text;
  v_action_url text;
  v_metadata jsonb;
begin
  select title into v_event_title from public.large_events where id = new.event_id;

  select op.user_id into v_organizer_user_id
  from public.organizer_profiles op
  where op.id = new.organizer_id;

  select vp.user_id into v_vendor_user_id
  from public.vendor_profiles vp
  where vp.id = new.vendor_id;

  if tg_op = 'INSERT' then
    v_notification_type := 'booking_created';
    v_priority := 'normal';
    v_action_url := '/vendor/bookings/' || new.id;
    v_metadata := jsonb_build_object('bookingId', new.id, 'eventTitle', v_event_title);

    insert into public.notifications (user_id, booking_id, title, message, notification_type, priority, action_url, metadata)
    values (
      v_vendor_user_id,
      new.id,
      'New Booking Request',
      'You have received a new booking request for event: ' || coalesce(v_event_title, 'Unknown Event'),
      v_notification_type,
      v_priority,
      v_action_url,
      v_metadata
    );
  end if;

  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    case new.status
      when 'accepted' then
        v_notification_type := 'booking_status_changed';
        v_priority := 'high';
        v_action_url := '/organizer/portfolio?eventId=' || new.event_id;
        v_metadata := jsonb_build_object('bookingId', new.id, 'eventTitle', v_event_title, 'newStatus', new.status);
      when 'rejected' then
        v_notification_type := 'booking_status_changed';
        v_priority := 'high';
        v_action_url := '/organizer/portfolio?eventId=' || new.event_id;
        v_metadata := jsonb_build_object('bookingId', new.id, 'eventTitle', v_event_title, 'newStatus', new.status);
      when 'changes_requested' then
        v_notification_type := 'booking_status_changed';
        v_priority := 'normal';
        v_action_url := '/organizer/portfolio?eventId=' || new.event_id;
        v_metadata := jsonb_build_object('bookingId', new.id, 'eventTitle', v_event_title, 'newStatus', new.status);
      when 'confirmed' then
        v_notification_type := 'booking_status_changed';
        v_priority := 'high';
        v_action_url := '/organizer/portfolio?eventId=' || new.event_id;
        v_metadata := jsonb_build_object('bookingId', new.id, 'eventTitle', v_event_title, 'newStatus', new.status);
      when 'completed' then
        v_notification_type := 'booking_status_changed';
        v_priority := 'normal';
        v_action_url := '/organizer/portfolio?eventId=' || new.event_id;
        v_metadata := jsonb_build_object('bookingId', new.id, 'eventTitle', v_event_title, 'newStatus', new.status);
      else
        v_notification_type := 'booking_status_changed';
        v_priority := 'normal';
        v_action_url := '/organizer/portfolio?eventId=' || new.event_id;
        v_metadata := jsonb_build_object('bookingId', new.id, 'eventTitle', v_event_title, 'newStatus', new.status);
    end case;

    insert into public.notifications (user_id, booking_id, title, message, notification_type, priority, action_url, metadata)
    values (
      v_organizer_user_id,
      new.id,
      'Booking ' || initcap(new.status::text),
      'Your booking for event ' || coalesce(v_event_title, 'Unknown Event') || ' has been updated to: ' || new.status::text,
      v_notification_type,
      v_priority,
      v_action_url,
      v_metadata
    );
  end if;

  return new;
end;
$$;

-- 15. Update vendor_b2b_booking_queue view — remove B2B-only filter to include all booking types
create or replace view public.vendor_b2b_booking_queue as
select
  b.id as booking_id,
  b.status,
  b.booking_type,
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
join public.organizer_profiles op on op.id = b.organizer_id;

-- 16. Indexes for new tables
create index if not exists idx_procurement_requests_event_id on public.procurement_requests(event_id);
create index if not exists idx_procurement_requests_organizer_id on public.procurement_requests(organizer_id);
create index if not exists idx_procurement_requests_status on public.procurement_requests(status);
create index if not exists idx_request_vendors_request_id on public.request_vendors(request_id);
create index if not exists idx_request_vendors_vendor_id on public.request_vendors(vendor_id);
create index if not exists idx_quotes_request_id on public.quotes(request_id);
create index if not exists idx_quotes_vendor_id on public.quotes(vendor_id);
create index if not exists idx_quotes_status on public.quotes(status);

-- 17. Add updated_at triggers for new tables
do $$ begin
  create trigger trg_set_updated_at_procurement_requests
    before update on public.procurement_requests for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_set_updated_at_quotes
    before update on public.quotes for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;
