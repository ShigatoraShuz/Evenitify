create type public.user_role as enum ('organizer', 'vendor', 'admin');

create type public.event_status as enum ('draft', 'planning', 'booking', 'confirmed', 'completed', 'cancelled');

create type public.requirement_status as enum ('open', 'pending_booking', 'fulfilled', 'cancelled');

create type public.vendor_verification_status as enum ('pending', 'verified', 'rejected');

create type public.service_availability_status as enum ('available', 'limited', 'unavailable');

create type public.booking_type as enum ('B2B', 'PERSONAL');

create type public.booking_status as enum (
  'pending',
  'accepted',
  'rejected',
  'changes_requested',
  'contract_sent',
  'confirmed',
  'completed',
  'cancelled'
);

create type public.contract_status as enum ('draft', 'sent', 'signed', 'rejected', 'expired');
