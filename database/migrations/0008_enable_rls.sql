-- User Profiles
alter table public.user_profiles enable row level security;

create policy "users can read own profile"
on public.user_profiles for select
using (id = auth.uid() or public.is_admin());

create policy "users can update own profile"
on public.user_profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- Organizer Profiles
alter table public.organizer_profiles enable row level security;

create policy "organizers can read own organizer profile"
on public.organizer_profiles for select
using (user_id = auth.uid() or public.is_admin());

create policy "organizers can create own organizer profile"
on public.organizer_profiles for insert
with check (user_id = auth.uid());

create policy "organizers can update own organizer profile"
on public.organizer_profiles for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Vendor Profiles
alter table public.vendor_profiles enable row level security;

create policy "anyone can read verified vendors"
on public.vendor_profiles for select
using (verification_status = 'verified' or user_id = auth.uid() or public.is_admin());

create policy "vendors can create own vendor profile"
on public.vendor_profiles for insert
with check (user_id = auth.uid());

create policy "vendors can update own vendor profile"
on public.vendor_profiles for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Large Events
alter table public.large_events enable row level security;

create policy "organizers can read own large events"
on public.large_events for select
using (public.is_admin() or organizer_id = public.current_organizer_profile_id());

create policy "organizers can create own large events"
on public.large_events for insert
with check (organizer_id = public.current_organizer_profile_id());

create policy "organizers can update own large events"
on public.large_events for update
using (organizer_id = public.current_organizer_profile_id())
with check (organizer_id = public.current_organizer_profile_id());

create policy "organizers can delete own draft large events"
on public.large_events for delete
using (organizer_id = public.current_organizer_profile_id() and status = 'draft');

-- Event Requirements
alter table public.event_requirements enable row level security;

create policy "organizers can read own event requirements"
on public.event_requirements for select
using (public.is_admin() or exists (
  select 1 from public.large_events le
  where le.id = event_requirements.event_id
    and le.organizer_id = public.current_organizer_profile_id()
));

create policy "organizers can create event requirements"
on public.event_requirements for insert
with check (exists (
  select 1 from public.large_events le
  where le.id = event_requirements.event_id
    and le.organizer_id = public.current_organizer_profile_id()
));

create policy "organizers can update own event requirements"
on public.event_requirements for update
using (exists (
  select 1 from public.large_events le
  where le.id = event_requirements.event_id
    and le.organizer_id = public.current_organizer_profile_id()
))
with check (exists (
  select 1 from public.large_events le
  where le.id = event_requirements.event_id
    and le.organizer_id = public.current_organizer_profile_id()
));

create policy "organizers can delete own event requirements"
on public.event_requirements for delete
using (exists (
  select 1 from public.large_events le
  where le.id = event_requirements.event_id
    and le.organizer_id = public.current_organizer_profile_id()
));

-- Vendor Services
alter table public.vendor_services enable row level security;

create policy "anyone can read available vendor services"
on public.vendor_services for select
using (availability_status != 'unavailable' or vendor_id = public.current_vendor_profile_id() or public.is_admin());

create policy "vendors can create own services"
on public.vendor_services for insert
with check (vendor_id = public.current_vendor_profile_id());

create policy "vendors can update own services"
on public.vendor_services for update
using (vendor_id = public.current_vendor_profile_id())
with check (vendor_id = public.current_vendor_profile_id());

create policy "vendors can delete own services"
on public.vendor_services for delete
using (vendor_id = public.current_vendor_profile_id());

-- Bookings
alter table public.bookings enable row level security;

create policy "organizers can read own event bookings"
on public.bookings for select
using (public.is_admin()
  or organizer_id = public.current_organizer_profile_id()
  or vendor_id = public.current_vendor_profile_id()
);

create policy "organizers can create b2b bookings"
on public.bookings for insert
with check (organizer_id = public.current_organizer_profile_id() and booking_type = 'B2B' and status = 'pending');

create policy "vendors can update assigned booking status"
on public.bookings for update
using (vendor_id = public.current_vendor_profile_id())
with check (vendor_id = public.current_vendor_profile_id());

create policy "organizers can update own booking notes"
on public.bookings for update
using (organizer_id = public.current_organizer_profile_id())
with check (organizer_id = public.current_organizer_profile_id());

-- Booking Status History
alter table public.booking_status_history enable row level security;

create policy "participants can read booking status history"
on public.booking_status_history for select
using (public.is_admin() or exists (
  select 1 from public.bookings b
  where b.id = booking_status_history.booking_id
    and (b.organizer_id = public.current_organizer_profile_id()
      or b.vendor_id = public.current_vendor_profile_id())
));

-- Contracts
alter table public.contracts enable row level security;

create policy "participants can read contracts"
on public.contracts for select
using (public.is_admin() or exists (
  select 1 from public.bookings b
  where b.id = contracts.booking_id
    and (b.organizer_id = public.current_organizer_profile_id()
      or b.vendor_id = public.current_vendor_profile_id())
));

create policy "vendors can create contracts for accepted bookings"
on public.contracts for insert
with check (exists (
  select 1 from public.bookings b
  where b.id = contracts.booking_id
    and (b.vendor_id = public.current_vendor_profile_id() or public.is_admin())
    and b.status = 'accepted'
));

create policy "participants can update contract status"
on public.contracts for update
using (exists (
  select 1 from public.bookings b
  where b.id = contracts.booking_id
    and (b.organizer_id = public.current_organizer_profile_id()
      or b.vendor_id = public.current_vendor_profile_id()
      or public.is_admin())
));

-- Notifications
alter table public.notifications enable row level security;

create policy "users can read own notifications"
on public.notifications for select
using (user_id = auth.uid() or public.is_admin());

create policy "users can update own notification read state"
on public.notifications for update
using (user_id = auth.uid())
with check (user_id = auth.uid());
