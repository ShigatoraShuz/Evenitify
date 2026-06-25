-- ============================================================================
-- Add vendor_service_ids JSONB column to support multiple selected services
-- ============================================================================

alter table public.procurement_requests
  add column if not exists vendor_service_ids jsonb default '[]'::jsonb;
