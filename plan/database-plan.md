# Eventify Supabase Database Incremental Development Plan

## Project Context
Eventify relies on Supabase as the main database and authentication layer. The database must link users, Organizer profiles, Vendor profiles, Large Events, Event Requirements, Vendor Services, B2B Bookings, Contracts, Notifications, and Status History.

## Supabase Responsibilities

| Area | Responsibility |
|---|---|
| Auth | Manage user identity through Supabase Auth. |
| Database | Store relational procurement data in PostgreSQL. |
| RLS | Enforce role-based access at the data layer. |
| Storage | Store private contract files and optional Vendor documents. |
| Functions | Run triggers, PostgreSQL functions, and scheduled Edge Functions. |
| Performance | Provide indexes, views, constraints, and query optimization. |

---

## Phase 1: Supabase Project Bootstrap

### Objective
Prepare the Supabase environment, migration workflow, and base PostgreSQL extensions.

### Implementation Tasks

| Task | Action |
|---|---|
| Project setup | Create Supabase project for development and separate project for production. |
| CLI setup | Initialize `supabase/` directory and local migration workflow. |
| Extensions | Enable `pgcrypto` for UUID generation and optional `pg_trgm` for search. |
| Naming standards | Use lowercase plural table names and snake_case columns. |
| Environments | Define `.env.local`, `.env.staging`, and `.env.production` variables. |

### Deliverables

- Supabase project created.
- Migration folder created.
- Base extension migration committed.

### Acceptance Criteria

- Local migrations can be reset and replayed.
- Project has no manual-only schema changes.

---

## Phase 2: Identity, Roles, and Profile Tables

### Objective
Create user role mapping and profile records for Organizer, Vendor, and Admin/Operations.

### Tables

| Table | Purpose |
|---|---|
| `user_profiles` | Public application profile linked to `auth.users`. |
| `organizer_profiles` | Organizer business profile. |
| `vendor_profiles` | Vendor business profile and verification state. |

### Suggested SQL Shape

```sql
create type public.user_role as enum ('organizer', 'vendor', 'admin');
create type public.vendor_verification_status as enum ('pending', 'verified', 'rejected');

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.user_role not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.user_profiles(id) on delete cascade,
  organization_name text not null,
  contact_number text,
  business_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vendor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.user_profiles(id) on delete cascade,
  business_name text not null,
  contact_number text,
  service_area text,
  rating numeric(3,2) not null default 0 check (rating >= 0 and rating <= 5),
  verification_status public.vendor_verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Acceptance Criteria

- Every app user has one `user_profiles` row.
- Organizer users can have one Organizer profile.
- Vendor users can have one Vendor profile.
- Admin users are represented through `user_profiles.role = 'admin'`.

---

## Phase 3: Large Event Portfolio Tables

### Objective
Create the Organizer event portfolio structure that all procurement records attach to.

### Tables

| Table | Purpose |
|---|---|
| `large_events` | Organizer-owned large-scale event. |
| `event_requirements` | Category-based Vendor needs for one event. |

### Suggested SQL Shape

```sql
create type public.event_status as enum ('draft', 'planning', 'booking', 'confirmed', 'completed', 'cancelled');
create type public.requirement_status as enum ('open', 'pending_booking', 'fulfilled', 'cancelled');

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
```

### Acceptance Criteria

- Large Events belong to Organizer profiles.
- Requirements belong to Large Events.
- Requirements cannot have invalid budget ranges.

---

## Phase 4: Vendor Services and Discovery Data

### Objective
Model Vendor service offerings so Organizer searches can match requirements to available Vendors.

### Table

| Table | Purpose |
|---|---|
| `vendor_services` | Services offered by Vendors, grouped by category, price, and availability. |

### Suggested SQL Shape

```sql
create type public.service_availability_status as enum ('available', 'limited', 'unavailable');

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
```

### Acceptance Criteria

- Vendor can own many services.
- Search queries can filter by category, price, availability, and service area.

---

## Phase 5: Booking, Contract, Notification, and Status History Tables

### Objective
Create the core B2B booking lifecycle and audit trail.

### Tables

| Table | Purpose |
|---|---|
| `bookings` | Main B2B booking record. |
| `booking_status_history` | Audit trail for all status changes. |
| `contracts` | Contract metadata or private file reference linked to booking. |
| `notifications` | Status update messages for Organizer and Vendor users. |

### Suggested SQL Shape

```sql
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
```

### Acceptance Criteria

- Booking links event, requirement, Organizer, Vendor, and contract lifecycle.
- Every status update has a history row.
- Notifications can be queried by receiving user.

---

## Phase 6: Relationship Validation and Database Constraints

### Objective
Prevent invalid data even if application-level validation fails.

### Required Constraints

| Constraint | Reason |
|---|---|
| `bookings.event_id` references `large_events.id` | Booking must belong to event portfolio. |
| `bookings.requirement_id` references `event_requirements.id` | Booking must be tied to a need. |
| `bookings.vendor_id` references `vendor_profiles.id` | Booking must target a Vendor. |
| `bookings.organizer_id` references `organizer_profiles.id` | Booking must have Organizer owner. |
| Unique active contract per booking | Prevent conflicting contract records. |
| Budget check constraints | Prevent invalid negative amounts. |
| Enum statuses | Prevent inconsistent string values. |

### Suggested Validation Function

```sql
create or replace function public.requirement_matches_booking_event()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.event_requirements er
    where er.id = new.requirement_id
      and er.event_id = new.event_id
  ) then
    raise exception 'Requirement does not belong to booking event.';
  end if;

  return new;
end;
$$;

create trigger trg_requirement_matches_booking_event
before insert or update on public.bookings
for each row execute function public.requirement_matches_booking_event();
```

### Acceptance Criteria

- Database rejects booking if requirement does not belong to event.
- Database rejects invalid status strings.
- Database rejects invalid budget ranges.

---

## Phase 7: Row-Level Security Policies

### Objective
Enable RLS on all public tables and enforce least-privilege access.

### RLS Policy Matrix

| Table | Organizer Access | Vendor Access | Admin Access |
|---|---|---|---|
| `user_profiles` | Read/update own profile | Read/update own profile | Read all |
| `organizer_profiles` | Read/update own Organizer profile | Read limited Organizer info for assigned bookings | Read all |
| `vendor_profiles` | Read verified Vendors | Read/update own Vendor profile | Read/update all |
| `large_events` | CRUD own events | Read events tied to assigned bookings | CRUD all |
| `event_requirements` | CRUD own event requirements | Read requirements tied to assigned bookings | CRUD all |
| `vendor_services` | Read active services | CRUD own services | CRUD all |
| `bookings` | CRUD own Organizer bookings | Read/update assigned Vendor bookings | CRUD all |
| `contracts` | Read own booking contracts | Read/update assigned booking contracts | CRUD all |
| `notifications` | Read/update own notifications | Read/update own notifications | Read all |
| `booking_status_history` | Read own booking history | Read assigned booking history | Read all |

### Helper Functions

```sql
create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
as $$
  select role from public.user_profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
```

### Example RLS Policy

```sql
alter table public.large_events enable row level security;

create policy "organizers can read own large events"
on public.large_events
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.organizer_profiles op
    where op.id = large_events.organizer_id
      and op.user_id = auth.uid()
  )
);
```

### Acceptance Criteria

- RLS is enabled on every app table.
- Organizer cannot read another Organizer's event.
- Vendor cannot read bookings not assigned to them.
- Admin can audit all records through controlled policies.

---

## Phase 8: Storage Buckets and File Access

### Objective
Secure private contract documents and optional Vendor verification files.

### Buckets

| Bucket | Privacy | Purpose |
|---|---|---|
| `contracts` | Private | Contract PDFs and signed documents. |
| `vendor-documents` | Private | Verification documents for Admin review. |
| `public-assets` | Public | Non-sensitive branding or generic assets. |

### Rules

- Contracts must never be public.
- Store only `storage_path` in the database.
- Generate signed URLs only after role verification.
- File names must be sanitized before upload.

### Acceptance Criteria

- Unauthorized users cannot fetch contract files.
- Contract files are organized by booking ID.
- Signed URLs expire.

---

## Phase 9: Functions, Triggers, and Automation

### Objective
Automate repetitive database tasks and ensure consistent audit behavior.

### Required Database Functions

| Function | Purpose |
|---|---|
| `set_updated_at()` | Updates `updated_at` on row change. |
| `log_booking_status_change()` | Inserts a status history row after booking status changes. |
| `create_booking_notification()` | Creates notification rows after booking creation or status change. |
| `requirement_matches_booking_event()` | Validates requirement-to-event relationship. |

### Example Updated At Trigger

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

### Acceptance Criteria

- All mutable tables update `updated_at` automatically.
- Booking status changes are auditable.
- Notifications are generated consistently.

---

## Phase 10: Indexing, Views, and Performance Tuning

### Objective
Optimize common Organizer and Vendor dashboard queries.

### Required Indexes

```sql
create index idx_large_events_organizer_id on public.large_events(organizer_id);
create index idx_event_requirements_event_id on public.event_requirements(event_id);
create index idx_vendor_services_vendor_id on public.vendor_services(vendor_id);
create index idx_vendor_services_category_price on public.vendor_services(category, base_price);
create index idx_bookings_event_id on public.bookings(event_id);
create index idx_bookings_vendor_id_status on public.bookings(vendor_id, status);
create index idx_bookings_organizer_id_status on public.bookings(organizer_id, status);
create index idx_contracts_booking_id on public.contracts(booking_id);
create index idx_notifications_user_read on public.notifications(user_id, is_read, created_at desc);
create index idx_booking_status_history_booking_id on public.booking_status_history(booking_id, created_at desc);
```

### Suggested Views

| View | Purpose |
|---|---|
| `event_portfolio_summary` | Organizer dashboard summary of event, requirements, bookings, and contracts. |
| `vendor_b2b_booking_queue` | Vendor dashboard queue for Organizer/Large Event bookings. |
| `admin_booking_overview` | Admin searchable booking overview. |

### Acceptance Criteria

- Dashboard queries avoid full table scans for common filters.
- Vendor B2B queue loads with pagination.
- Notification unread count is fast.

---

## Phase 11: Seed Data, Migration Discipline, and QA

### Objective
Make development repeatable and safe for team collaboration.

### Migration Rules

| Rule | Requirement |
|---|---|
| Every schema change | Must be in a migration file. |
| Migration naming | `YYYYMMDDHHMM_description.sql`. |
| Seed data | Must be safe, fictional, and resettable. |
| RLS tests | Must verify unauthorized reads and writes fail. |
| Review | DBA/Supabase Manager reviews constraints and policies before merge. |

### Seed Data

- 2 Organizer users.
- 3 Vendor users.
- 1 Admin user.
- 3 Large Events.
- 10 Event Requirements.
- 12 Vendor Services.
- 8 Bookings across statuses.
- 5 Contracts.
- 20 Notifications.

### Acceptance Criteria

- Local reset produces usable demo data.
- RLS policies pass access tests.
- All migrations can be replayed from scratch.

---

## Final Phase: Production Readiness, Backup, and Monitoring

### Objective
Prepare the Supabase database for stable production use.

### Production Checklist

| Area | Requirement |
|---|---|
| RLS | Enabled and tested on all app tables. |
| Backups | Confirm Supabase backup schedule and recovery process. |
| Secrets | Service role key is never exposed to frontend. |
| Indexes | Added for dashboard, search, and notification queries. |
| Logs | Monitor slow queries and failed auth/RLS attempts. |
| Storage | Private buckets configured and signed URL access tested. |
| Migrations | Production migration applied through controlled release process. |

### Final Acceptance Criteria

- Production schema matches migration history.
- Organizer/Vendor/Admin RLS behavior is verified.
- Backup and recovery process is documented.
- Performance is acceptable for event dashboard and Vendor queue queries.
