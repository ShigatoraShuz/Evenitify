create table public.bookings (
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

create table public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  previous_status public.booking_status,
  new_status public.booking_status not null,
  changed_by uuid references public.user_profiles(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create table public.contracts (
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

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
