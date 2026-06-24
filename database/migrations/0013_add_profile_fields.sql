-- Add organization_type to organizer_profiles
alter table public.organizer_profiles
  add column if not exists organization_type text;

-- Add business_description to vendor_profiles
alter table public.vendor_profiles
  add column if not exists business_description text;
