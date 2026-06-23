create table public.vendor_services (
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
