create table public.large_events (
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

create table public.event_requirements (
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
