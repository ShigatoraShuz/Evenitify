-- ============================================================================
-- Phase 1: Normalize organizer-to-vendor request flow
-- Adds RFQ fields to existing procurement tables without creating new tables.
-- ============================================================================

alter table public.procurement_requests
  add column if not exists vendor_id uuid references public.vendor_profiles(id) on delete cascade,
  add column if not exists vendor_service_id uuid references public.vendor_services(id) on delete set null,
  add column if not exists request_message text,
  add column if not exists budget_min numeric(12,2) check (budget_min is null or budget_min >= 0),
  add column if not exists budget_max numeric(12,2) check (budget_max is null or budget_max >= 0),
  add column if not exists deadline timestamptz;

alter table public.request_vendors
  add column if not exists vendor_service_id uuid references public.vendor_services(id) on delete set null,
  add column if not exists request_message text,
  add column if not exists budget_min numeric(12,2) check (budget_min is null or budget_min >= 0),
  add column if not exists budget_max numeric(12,2) check (budget_max is null or budget_max >= 0),
  add column if not exists deadline timestamptz,
  add column if not exists sent_at timestamptz not null default now(),
  add column if not exists viewed_at timestamptz,
  add column if not exists accepted_at timestamptz,
  add column if not exists rejected_at timestamptz,
  add column if not exists changes_requested_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

do $$ begin
  create trigger trg_set_updated_at_request_vendors
    before update on public.request_vendors for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;
