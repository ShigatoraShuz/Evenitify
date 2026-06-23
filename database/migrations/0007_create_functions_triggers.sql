-- Updated At Trigger Function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- RLS Helper Functions
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

-- Booking Requirement Validation Trigger
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

-- Booking Status History Logger
create or replace function public.log_booking_status_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.booking_status_history (
      booking_id,
      previous_status,
      new_status,
      changed_by,
      reason
    ) values (
      new.id,
      null,
      new.status,
      auth.uid(),
      'Booking created'
    );
  elsif old.status is distinct from new.status then
    insert into public.booking_status_history (
      booking_id,
      previous_status,
      new_status,
      changed_by,
      reason
    ) values (
      new.id,
      old.status,
      new.status,
      auth.uid(),
      null
    );
  end if;

  return new;
end;
$$;

-- Booking Notification Creator
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

  select op.user_id into v_organizer_user_id
  from public.organizer_profiles op
  where op.id = new.organizer_id;

  select vp.user_id into v_vendor_user_id
  from public.vendor_profiles vp
  where vp.id = new.vendor_id;

  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, booking_id, title, message)
    values (
      v_vendor_user_id,
      new.id,
      'New Booking Request',
      'You have received a new B2B booking request for event: ' || coalesce(v_event_title, 'Unknown Event')
    );
  end if;

  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.notifications (user_id, booking_id, title, message)
    values (
      v_organizer_user_id,
      new.id,
      'Booking Status Updated',
      'Your booking for event ' || coalesce(v_event_title, 'Unknown Event') || ' has been updated to: ' || new.status::text
    );
  end if;

  return new;
end;
$$;

-- Apply Updated At Triggers
create trigger trg_set_updated_at_user_profiles
before update on public.user_profiles
for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_organizer_profiles
before update on public.organizer_profiles
for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_vendor_profiles
before update on public.vendor_profiles
for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_large_events
before update on public.large_events
for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_event_requirements
before update on public.event_requirements
for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_vendor_services
before update on public.vendor_services
for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_bookings
before update on public.bookings
for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_contracts
before update on public.contracts
for each row execute function public.set_updated_at();

-- Apply Booking Validation Trigger
create trigger trg_requirement_matches_booking_event
before insert or update on public.bookings
for each row execute function public.requirement_matches_booking_event();

-- Apply Booking Status History Trigger
create trigger trg_log_booking_status_change
after insert or update of status on public.bookings
for each row execute function public.log_booking_status_change();

-- Apply Booking Notification Trigger
create trigger trg_create_booking_notification
after insert or update of status on public.bookings
for each row execute function public.create_booking_notification();
