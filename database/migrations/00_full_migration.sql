-- ============================================================================
-- EVENTIFY - Full Database Migration (Idempotent)
-- Safe to run multiple times; uses IF NOT EXISTS / exception handling
-- ============================================================================

-- 0001: Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- 0002: Enums (safe creation via exception handling)
do $$ begin
  create type public.user_role as enum ('organizer', 'vendor', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.event_status as enum ('draft', 'planning', 'booking', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.requirement_status as enum ('open', 'pending_booking', 'fulfilled', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.vendor_verification_status as enum ('pending', 'verified', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.service_availability_status as enum ('available', 'limited', 'unavailable');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.booking_type as enum ('B2B', 'PERSONAL');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.booking_status as enum (
    'pending', 'accepted', 'rejected', 'changes_requested',
    'contract_sent', 'confirmed', 'completed', 'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.contract_status as enum ('draft', 'sent', 'signed', 'rejected', 'expired');
exception when duplicate_object then null;
end $$;

-- 0003: Profiles
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.user_role not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.user_profiles(id) on delete cascade,
  organization_name text not null,
  contact_number text,
  business_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.user_profiles(id) on delete cascade,
  business_name text not null,
  contact_number text,
  service_area text,
  rating numeric(3,2) not null default 0 check (rating >= 0 and rating <= 5),
  verification_status public.vendor_verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 0004: Events & Requirements
create table if not exists public.large_events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.organizer_profiles(id) on delete cascade,
  title text not null,
  event_date date not null,
  venue text not null,
  budget numeric(12,2) not null check (budget >= 0),
  expected_guests integer not null check (expected_guests > 0),
  status public.event_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_requirements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.large_events(id) on delete cascade,
  category text not null,
  quantity integer not null default 1 check (quantity > 0),
  min_budget numeric(12,2) check (min_budget >= 0),
  max_budget numeric(12,2) check (max_budget >= 0),
  requirement_status public.requirement_status not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_requirement_budget check (min_budget is null or max_budget is null or min_budget <= max_budget)
);

-- 0005: Vendors & Services
create table if not exists public.vendor_services (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendor_profiles(id) on delete cascade,
  category text not null,
  service_name text not null,
  description text,
  base_price numeric(12,2) not null check (base_price >= 0),
  availability_status public.service_availability_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 0006: Bookings, Contracts, Notifications
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.large_events(id) on delete cascade,
  requirement_id uuid not null references public.event_requirements(id) on delete restrict,
  vendor_id uuid not null references public.vendor_profiles(id) on delete restrict,
  organizer_id uuid not null references public.organizer_profiles(id) on delete cascade,
  booking_type public.booking_type not null default 'B2B',
  status public.booking_status not null default 'pending',
  requested_budget numeric(12,2) check (requested_budget is null or requested_budget >= 0),
  notes text,
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_type_for_event check (booking_type = 'B2B')
);

create table if not exists public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  previous_status public.booking_status,
  new_status public.booking_status not null,
  changed_by uuid references public.user_profiles(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  contract_url text,
  storage_path text,
  contract_status public.contract_status not null default 'draft',
  sent_at timestamptz,
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

-- 0007: Functions & Triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
as $$
  select role from public.user_profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_organizer_profile_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from public.organizer_profiles where user_id = auth.uid();
$$;

create or replace function public.current_vendor_profile_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from public.vendor_profiles where user_id = auth.uid();
$$;

create or replace function public.requirement_matches_booking_event()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.event_requirements er
    where er.id = new.requirement_id
      and er.event_id = new.event_id
  ) then
    raise exception 'Requirement does not belong to the selected event.';
  end if;
  return new;
end;
$$;

create or replace function public.log_booking_status_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.booking_status_history (booking_id, previous_status, new_status, changed_by, reason)
    values (new.id, null, new.status, auth.uid(), 'Booking created');
  elsif old.status is distinct from new.status then
    insert into public.booking_status_history (booking_id, previous_status, new_status, changed_by, reason)
    values (new.id, old.status, new.status, auth.uid(), null);
  end if;
  return new;
end;
$$;

create or replace function public.create_booking_notification()
returns trigger
language plpgsql
as $$
declare
  v_organizer_user_id uuid;
  v_vendor_user_id uuid;
  v_event_title text;
begin
  select title into v_event_title from public.large_events where id = new.event_id;
  select op.user_id into v_organizer_user_id from public.organizer_profiles op where op.id = new.organizer_id;
  select vp.user_id into v_vendor_user_id from public.vendor_profiles vp where vp.id = new.vendor_id;

  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, booking_id, title, message)
    values (v_vendor_user_id, new.id, 'New Booking Request',
      'You have received a new B2B booking request for event: ' || coalesce(v_event_title, 'Unknown Event'));
  end if;

  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.notifications (user_id, booking_id, title, message)
    values (v_organizer_user_id, new.id, 'Booking Status Updated',
      'Your booking for event ' || coalesce(v_event_title, 'Unknown Event') || ' has been updated to: ' || new.status::text);
  end if;
  return new;
end;
$$;

do $$ begin
  create trigger trg_set_updated_at_user_profiles
    before update on public.user_profiles for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_set_updated_at_organizer_profiles
    before update on public.organizer_profiles for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_set_updated_at_vendor_profiles
    before update on public.vendor_profiles for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_set_updated_at_large_events
    before update on public.large_events for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_set_updated_at_event_requirements
    before update on public.event_requirements for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_set_updated_at_vendor_services
    before update on public.vendor_services for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_set_updated_at_bookings
    before update on public.bookings for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_set_updated_at_contracts
    before update on public.contracts for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_requirement_matches_booking_event
    before insert or update on public.bookings for each row execute function public.requirement_matches_booking_event();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_log_booking_status_change
    after insert or update of status on public.bookings for each row execute function public.log_booking_status_change();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_create_booking_notification
    after insert or update of status on public.bookings for each row execute function public.create_booking_notification();
exception when duplicate_object then null;
end $$;

-- 0008: Row Level Security
alter table if exists public.user_profiles enable row level security;
alter table if exists public.organizer_profiles enable row level security;
alter table if exists public.vendor_profiles enable row level security;
alter table if exists public.large_events enable row level security;
alter table if exists public.event_requirements enable row level security;
alter table if exists public.vendor_services enable row level security;
alter table if exists public.bookings enable row level security;
alter table if exists public.booking_status_history enable row level security;
alter table if exists public.contracts enable row level security;
alter table if exists public.notifications enable row level security;

do $$ begin
  create policy "users can read own profile" on public.user_profiles for select using (id = auth.uid() or public.is_admin());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "users can update own profile" on public.user_profiles for update using (id = auth.uid()) with check (id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can read own organizer profile" on public.organizer_profiles for select using (user_id = auth.uid() or public.is_admin());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can create own organizer profile" on public.organizer_profiles for insert with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can update own organizer profile" on public.organizer_profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "anyone can read verified vendors" on public.vendor_profiles for select using (verification_status = 'verified' or user_id = auth.uid() or public.is_admin());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "vendors can create own vendor profile" on public.vendor_profiles for insert with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "vendors can update own vendor profile" on public.vendor_profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can read own large events" on public.large_events for select using (public.is_admin() or organizer_id = public.current_organizer_profile_id());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can create own large events" on public.large_events for insert with check (organizer_id = public.current_organizer_profile_id());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can update own large events" on public.large_events for update using (organizer_id = public.current_organizer_profile_id()) with check (organizer_id = public.current_organizer_profile_id());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can delete own draft large events" on public.large_events for delete using (organizer_id = public.current_organizer_profile_id() and status = 'draft');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can read own event requirements" on public.event_requirements for select using (public.is_admin() or exists (select 1 from public.large_events le where le.id = event_requirements.event_id and le.organizer_id = public.current_organizer_profile_id()));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can create event requirements" on public.event_requirements for insert with check (exists (select 1 from public.large_events le where le.id = event_requirements.event_id and le.organizer_id = public.current_organizer_profile_id()));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can update own event requirements" on public.event_requirements for update using (exists (select 1 from public.large_events le where le.id = event_requirements.event_id and le.organizer_id = public.current_organizer_profile_id())) with check (exists (select 1 from public.large_events le where le.id = event_requirements.event_id and le.organizer_id = public.current_organizer_profile_id()));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can delete own event requirements" on public.event_requirements for delete using (exists (select 1 from public.large_events le where le.id = event_requirements.event_id and le.organizer_id = public.current_organizer_profile_id()));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "anyone can read available vendor services" on public.vendor_services for select using (availability_status != 'unavailable' or vendor_id = public.current_vendor_profile_id() or public.is_admin());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "vendors can create own services" on public.vendor_services for insert with check (vendor_id = public.current_vendor_profile_id());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "vendors can update own services" on public.vendor_services for update using (vendor_id = public.current_vendor_profile_id()) with check (vendor_id = public.current_vendor_profile_id());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "vendors can delete own services" on public.vendor_services for delete using (vendor_id = public.current_vendor_profile_id());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can read own event bookings" on public.bookings for select using (public.is_admin() or organizer_id = public.current_organizer_profile_id() or vendor_id = public.current_vendor_profile_id());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can create b2b bookings" on public.bookings for insert with check (organizer_id = public.current_organizer_profile_id() and booking_type = 'B2B' and status = 'pending');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "vendors can update assigned booking status" on public.bookings for update using (vendor_id = public.current_vendor_profile_id()) with check (vendor_id = public.current_vendor_profile_id());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "organizers can update own booking notes" on public.bookings for update using (organizer_id = public.current_organizer_profile_id()) with check (organizer_id = public.current_organizer_profile_id());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "participants can read booking status history" on public.booking_status_history for select using (public.is_admin() or exists (select 1 from public.bookings b where b.id = booking_status_history.booking_id and (b.organizer_id = public.current_organizer_profile_id() or b.vendor_id = public.current_vendor_profile_id())));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "participants can read contracts" on public.contracts for select using (public.is_admin() or exists (select 1 from public.bookings b where b.id = contracts.booking_id and (b.organizer_id = public.current_organizer_profile_id() or b.vendor_id = public.current_vendor_profile_id())));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "vendors can create contracts for accepted bookings" on public.contracts for insert with check (exists (select 1 from public.bookings b where b.id = contracts.booking_id and (b.vendor_id = public.current_vendor_profile_id() or public.is_admin()) and b.status = 'accepted'));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "participants can update contract status" on public.contracts for update using (exists (select 1 from public.bookings b where b.id = contracts.booking_id and (b.organizer_id = public.current_organizer_profile_id() or b.vendor_id = public.current_vendor_profile_id() or public.is_admin())));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "users can read own notifications" on public.notifications for select using (user_id = auth.uid() or public.is_admin());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "users can update own notification read state" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

-- 0009: Indexes & Views
create index if not exists idx_large_events_organizer_id on public.large_events(organizer_id);
create index if not exists idx_event_requirements_event_id on public.event_requirements(event_id);
create index if not exists idx_vendor_services_vendor_id on public.vendor_services(vendor_id);
create index if not exists idx_vendor_services_category_price on public.vendor_services(category, base_price);
create index if not exists idx_bookings_event_id on public.bookings(event_id);
create index if not exists idx_bookings_vendor_id_status on public.bookings(vendor_id, status);
create index if not exists idx_bookings_organizer_id_status on public.bookings(organizer_id, status);
create index if not exists idx_contracts_booking_id on public.contracts(booking_id);
create index if not exists idx_notifications_user_read on public.notifications(user_id, is_read, created_at desc);
create index if not exists idx_booking_status_history_booking_id on public.booking_status_history(booking_id, created_at desc);

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

-- 0010: Storage Policies
insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('vendor-documents', 'vendor-documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

do $$ begin
  create policy "authenticated users can read contracts" on storage.objects for select using (bucket_id = 'contracts' and auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "vendors and admin can upload contracts" on storage.objects for insert with check (bucket_id = 'contracts' and auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "vendors can read own vendor documents" on storage.objects for select using (bucket_id = 'vendor-documents' and auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "vendors can upload own vendor documents" on storage.objects for insert with check (bucket_id = 'vendor-documents' and auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "anyone can read public assets" on storage.objects for select using (bucket_id = 'public-assets');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "admin can upload public assets" on storage.objects for insert with check (bucket_id = 'public-assets' and auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;
