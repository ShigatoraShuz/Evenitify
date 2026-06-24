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


-- ============================================================
-- Phase 2: Database Enhancements
-- Improves contracts, notifications, indexes, and triggers
-- ============================================================

-- 1. Enhance contract_status enum
alter type public.contract_status add value if not exists 'organizer_signed';
alter type public.contract_status add value if not exists 'vendor_signed';
alter type public.contract_status add value if not exists 'active';
alter type public.contract_status add value if not exists 'completed';
alter type public.contract_status add value if not exists 'cancelled';

-- Note: 'signed' is kept for backward compat; new code uses organizer_signed/vendor_signed

-- 2. Enhance contracts table
alter table public.contracts
  add column if not exists contract_number text,
  add column if not exists terms_summary text,
  add column if not exists organizer_signed_at timestamptz,
  add column if not exists vendor_signed_at timestamptz,
  add column if not exists final_status public.booking_status;

-- Generate contract_number for existing rows
update public.contracts
set contract_number = 'CNT-' || to_char(created_at, 'YYYYMMDD') || '-' || upper(substr(md5(id::text), 1, 8))
where contract_number is null;

-- 3. Create contract_status_history table
create table if not exists public.contract_status_history (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  previous_status public.contract_status,
  new_status public.contract_status not null,
  changed_by uuid references public.user_profiles(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

-- 4. Enhance notifications table
alter table public.notifications
  add column if not exists notification_type text not null default 'general',
  add column if not exists priority text not null default 'normal',
  add column if not exists action_url text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- 5. New indexes for Phase 2 query patterns
create index if not exists idx_large_events_organizer_status on public.large_events(organizer_id, status);
create index if not exists idx_bookings_vendor_booking_type on public.bookings(vendor_id, booking_type, status);
create index if not exists idx_notifications_unread on public.notifications(user_id, is_read) where is_read = false;
create index if not exists idx_contracts_status on public.contracts(contract_status);
create index if not exists idx_contract_status_history_contract on public.contract_status_history(contract_id, created_at desc);
create index if not exists idx_notifications_type on public.notifications(notification_type);

-- 6. Add updated_at triggers for tables missing them
create trigger if not exists trg_set_updated_at_booking_status_history
before update on public.booking_status_history
for each row execute function public.set_updated_at();

create trigger if not exists trg_set_updated_at_notifications
before update on public.notifications
for each row execute function public.set_updated_at();

alter table public.booking_status_history add column if not exists updated_at timestamptz not null default now();
alter table public.notifications add column if not exists updated_at timestamptz not null default now();

-- 7. Update create_booking_notification trigger for richer notification data
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
      'You have received a new B2B booking request for event: ' || coalesce(v_event_title, 'Unknown Event'),
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

-- 8. Function to create contract notifications
create or replace function public.create_contract_notification()
returns trigger
language plpgsql
as $$
declare
  v_organizer_user_id uuid;
  v_vendor_user_id uuid;
  v_booking_record record;
  v_notification_type text;
  v_priority text;
  v_action_url text;
  v_metadata jsonb;
begin
  select
    b.event_id, b.organizer_id, b.vendor_id,
    op.user_id as organizer_user_id,
    vp.user_id as vendor_user_id,
    le.title as event_title
  into v_booking_record
  from public.bookings b
  join public.organizer_profiles op on op.id = b.organizer_id
  join public.vendor_profiles vp on vp.id = b.vendor_id
  join public.large_events le on le.id = b.event_id
  where b.id = new.booking_id;

  if tg_op = 'INSERT' then
    v_notification_type := 'contract_sent';
    v_priority := 'high';
    v_action_url := '/vendor/bookings/' || new.booking_id;
    v_metadata := jsonb_build_object('contractId', new.id, 'bookingId', new.booking_id, 'eventTitle', v_booking_record.event_title);

    insert into public.notifications (user_id, booking_id, title, message, notification_type, priority, action_url, metadata)
    values (
      v_booking_record.vendor_user_id,
      new.booking_id,
      'Contract Sent',
      'A contract has been sent for booking related to: ' || coalesce(v_booking_record.event_title, 'Unknown Event'),
      v_notification_type,
      v_priority,
      v_action_url,
      v_metadata
    );
  end if;

  if tg_op = 'UPDATE' and old.contract_status is distinct from new.contract_status then
    if new.contract_status = 'organizer_signed' then
      v_notification_type := 'contract_signed';
      v_priority := 'high';
      v_action_url := '/vendor/bookings/' || new.booking_id;
      v_metadata := jsonb_build_object('contractId', new.id, 'signedBy', 'organizer');

      insert into public.notifications (user_id, booking_id, title, message, notification_type, priority, action_url, metadata)
      values (
        v_booking_record.vendor_user_id,
        new.booking_id,
        'Contract Signed by Organizer',
        'The organizer has signed the contract for event: ' || coalesce(v_booking_record.event_title, 'Unknown Event'),
        v_notification_type,
        v_priority,
        v_action_url,
        v_metadata
      );
    end if;

    if new.contract_status = 'vendor_signed' then
      v_notification_type := 'contract_signed';
      v_priority := 'high';
      v_action_url := '/organizer/portfolio?eventId=' || v_booking_record.event_id;
      v_metadata := jsonb_build_object('contractId', new.id, 'signedBy', 'vendor');

      insert into public.notifications (user_id, booking_id, title, message, notification_type, priority, action_url, metadata)
      values (
        v_booking_record.organizer_user_id,
        new.booking_id,
        'Contract Signed by Vendor',
        'The vendor has signed the contract for event: ' || coalesce(v_booking_record.event_title, 'Unknown Event'),
        v_notification_type,
        v_priority,
        v_action_url,
        v_metadata
      );
    end if;

    if new.contract_status = 'active' then
      v_notification_type := 'contract_signed';
      v_priority := 'high';
      v_action_url := '/organizer/portfolio?eventId=' || v_booking_record.event_id;
      v_metadata := jsonb_build_object('contractId', new.id, 'newStatus', 'active');

      insert into public.notifications (user_id, booking_id, title, message, notification_type, priority, action_url, metadata)
      values (
        v_booking_record.organizer_user_id,
        new.booking_id,
        'Contract Now Active',
        'The contract for event ' || coalesce(v_booking_record.event_title, 'Unknown Event') || ' is now active.',
        v_notification_type,
        v_priority,
        v_action_url,
        v_metadata
      );

      insert into public.notifications (user_id, booking_id, title, message, notification_type, priority, action_url, metadata)
      values (
        v_booking_record.vendor_user_id,
        new.booking_id,
        'Contract Now Active',
        'The contract for event ' || coalesce(v_booking_record.event_title, 'Unknown Event') || ' is now active.',
        v_notification_type,
        v_priority,
        v_action_url,
        v_metadata
      );
    end if;
  end if;

  return new;
end;
$$;

-- 9. Apply contract notification trigger
drop trigger if exists trg_create_contract_notification on public.contracts;
create trigger trg_create_contract_notification
after insert or update of contract_status on public.contracts
for each row execute function public.create_contract_notification();

-- 10. Update views to include new fields
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
  count(distinct case when b.status = 'accepted' then b.id end) as accepted_bookings,
  count(distinct case when b.status = 'confirmed' then b.id end) as confirmed_bookings,
  count(distinct case when b.status = 'completed' then b.id end) as completed_bookings,
  count(distinct c.id) as contract_count
from public.large_events le
join public.organizer_profiles op on op.id = le.organizer_id
left join public.event_requirements er on er.event_id = le.id
left join public.bookings b on b.event_id = le.id
left join public.contracts c on c.booking_id = b.id
group by le.id, op.id;

create or replace view public.admin_dashboard_summary as
select
  (select count(*) from public.user_profiles where role = 'organizer') as total_organizers,
  (select count(*) from public.user_profiles where role = 'vendor') as total_vendors,
  (select count(*) from public.large_events) as total_events,
  (select count(*) from public.large_events where expected_guests >= 500) as large_events_500plus,
  (select count(*) from public.bookings where status = 'pending') as pending_bookings,
  (select count(*) from public.bookings where status = 'accepted') as accepted_bookings,
  (select count(*) from public.bookings where status = 'completed') as completed_bookings,
  (select count(*) from public.bookings where status = 'confirmed') as confirmed_bookings,
  (select count(*) from public.bookings where status = 'rejected') as rejected_bookings,
  (select count(*) from public.bookings where status = 'cancelled') as cancelled_bookings,
  (select count(*) from public.vendor_profiles where verification_status = 'pending') as pending_verifications,
  (select count(*) from public.contracts where contract_status = 'draft') as draft_contracts,
  (select count(*) from public.contracts where contract_status = 'active') as active_contracts;


-- ============================================================
-- Phase 8: Features and Integration
-- Adds booking_messages, document_metadata, and vendor_blocked_dates tables
-- ============================================================

-- 1. Create booking_messages table
create table if not exists public.booking_messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  author_user_id uuid not null references public.user_profiles(id) on delete cascade,
  type text not null check (type in ('organizer_message', 'vendor_message', 'admin_note', 'system_update')),
  body text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS for booking_messages
alter table public.booking_messages enable row level security;

create policy "participants can read booking messages"
on public.booking_messages for select
using (
  public.is_admin() or exists (
    select 1 from public.bookings b
    where b.id = booking_messages.booking_id
      and (b.organizer_id = public.current_organizer_profile_id()
        or b.vendor_id = public.current_vendor_profile_id())
  )
);

create policy "participants can insert booking messages"
on public.booking_messages for insert
with check (
  (author_user_id = auth.uid()) and (
    public.is_admin() or exists (
      select 1 from public.bookings b
      where b.id = booking_messages.booking_id
        and (b.organizer_id = public.current_organizer_profile_id()
          or b.vendor_id = public.current_vendor_profile_id())
    )
  )
);

-- 2. Create document_metadata table
create table if not exists public.document_metadata (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  title text not null,
  file_name text not null,
  storage_path text,
  state text not null default 'pending_review' check (state in ('not_uploaded', 'uploaded', 'pending_review', 'approved', 'rejected')),
  uploaded_at timestamptz not null default now(),
  reviewed_at timestamptz,
  notes text
);

-- Enable RLS for document_metadata
alter table public.document_metadata enable row level security;

create policy "authenticated users can read documents"
on public.document_metadata for select
using (auth.role() = 'authenticated');

create policy "authenticated users can insert documents"
on public.document_metadata for insert
with check (auth.role() = 'authenticated');

create policy "authenticated users can update documents"
on public.document_metadata for update
using (auth.role() = 'authenticated');

-- 3. Create vendor_blocked_dates table
create table if not exists public.vendor_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendor_profiles(id) on delete cascade,
  date date not null,
  reason text,
  unique (vendor_id, date)
);

-- Enable RLS for vendor_blocked_dates
alter table public.vendor_blocked_dates enable row level security;

create policy "anyone can read blocked dates"
on public.vendor_blocked_dates for select
using (true);

create policy "vendors can manage own blocked dates"
on public.vendor_blocked_dates for all
using (vendor_id = public.current_vendor_profile_id() or public.is_admin());

-- 0013: Additional Profile Fields
alter table public.organizer_profiles
  add column if not exists organization_type text;

alter table public.vendor_profiles
  add column if not exists business_description text;
