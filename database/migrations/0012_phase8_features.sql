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
