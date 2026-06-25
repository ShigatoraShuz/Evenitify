alter table public.vendor_services
  add column capacity integer check (capacity > 0),
  add column service_address text;
