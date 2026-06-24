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
do $$ begin
  create trigger trg_set_updated_at_booking_status_history
    before update on public.booking_status_history for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_set_updated_at_notifications
    before update on public.notifications for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

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
drop view if exists public.event_portfolio_summary;
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
  (select count(*) from public.contracts where contract_status::text = 'active') as active_contracts;
