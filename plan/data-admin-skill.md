# Eventify Data Admin / Supabase Manager Skill Documentation

## Role
Database Administrator / Supabase Manager

## Description
The Data Admin is responsible for provisioning, managing, securing, and maintaining the Eventify database infrastructure inside Supabase. This role owns schema creation, migrations, PostgreSQL functions, Row-Level Security policies, indexes, storage rules, backups, and data quality.

## Primary Mission
Ensure that Eventify's Supabase database correctly and securely links Organizer event portfolios, Vendor services, booking status, contract records, notifications, and audit history.

---

## Core Responsibilities

| Area | Responsibility |
|---|---|
| Schema design | Create normalized tables, relationships, constraints, enums, and views. |
| Migrations | Manage repeatable SQL migrations through Supabase CLI. |
| RLS | Implement least-privilege access policies for Organizer, Vendor, and Admin. |
| SQL functions | Write PostgreSQL functions for timestamps, status history, validation, and notifications. |
| Storage | Manage private contract and Vendor document buckets. |
| Performance | Add indexes, monitor slow queries, and optimize dashboard queries. |
| Data quality | Enforce constraints, seed safe demo data, and prevent orphan records. |
| Operations | Manage backups, environment separation, auditability, and production release safety. |

---

## Supabase Project Structure

```txt
supabase/
├── migrations/
│   ├── 202601010001_enable_extensions.sql
│   ├── 202601010002_create_enums.sql
│   ├── 202601010003_create_profiles.sql
│   ├── 202601010004_create_events_requirements.sql
│   ├── 202601010005_create_vendors_services.sql
│   ├── 202601010006_create_bookings_contracts_notifications.sql
│   ├── 202601010007_create_functions_triggers.sql
│   ├── 202601010008_enable_rls.sql
│   ├── 202601010009_create_indexes_views.sql
│   └── 202601010010_storage_policies.sql
├── seed.sql
├── functions/
│   ├── send-booking-notification/
│   ├── send-contract-reminder/
│   └── send-event-deadline-reminder/
└── config.toml
```

---

## Database Entity Ownership

| Entity | Owner | Access Pattern |
|---|---|---|
| `user_profiles` | User account | Users read/update own profile; Admin reads all. |
| `organizer_profiles` | Organizer user | Organizer owns profile and Large Events. |
| `vendor_profiles` | Vendor user | Vendor owns profile and services. |
| `large_events` | Organizer profile | Organizer owns many events. |
| `event_requirements` | Large Event | Organizer owns through event. |
| `vendor_services` | Vendor profile | Vendor manages own service listings. |
| `bookings` | Organizer event + Vendor | Shared between Organizer and assigned Vendor. |
| `contracts` | Booking | Shared between Organizer, assigned Vendor, and Admin. |
| `notifications` | Receiving user | User reads own notifications. |
| `booking_status_history` | Booking | Readable by authorized booking participants and Admin. |

---

## Migration Execution Process

### Required Workflow

1. Create a new migration file with a timestamped name.
2. Write SQL in small, reviewable units.
3. Run migration locally.
4. Reset local database and replay all migrations.
5. Run seed data.
6. Test RLS access using Organizer, Vendor, and Admin users.
7. Review query plans for dashboard endpoints.
8. Apply to staging.
9. Verify staging with API and frontend.
10. Apply to production during a controlled release window.

### Migration Naming Format

```txt
YYYYMMDDHHMM_short_description.sql
```

Example:

```txt
202606220001_create_booking_status_history.sql
```

### Migration Rules

| Rule | Requirement |
|---|---|
| No manual-only schema changes | Every database change must be stored in migration files. |
| No destructive production change without plan | Dropping columns/tables requires backup and rollback plan. |
| Use constraints | Prefer database constraints over application-only validation. |
| Use enums for statuses | Booking, contract, event, and role states must be controlled. |
| Test RLS | Every table with user data must have tested RLS policies. |

---

## Schema Creation Standards

### Naming Conventions

| Object | Convention | Example |
|---|---|---|
| Tables | plural snake_case | `large_events` |
| Columns | snake_case | `expected_guests` |
| Primary keys | `id uuid primary key` | `id uuid primary key default gen_random_uuid()` |
| Foreign keys | referenced table singular + `_id` | `vendor_id` |
| Enum types | singular concept | `booking_status` |
| Indexes | `idx_table_columns` | `idx_bookings_vendor_id_status` |
| Policies | readable sentence | `vendors can read assigned bookings` |
| Triggers | `trg_action_table` | `trg_set_updated_at_bookings` |
| Functions | verb phrase | `set_updated_at()` |

---

## Required Core Tables

| Table | Required Key Fields |
|---|---|
| `user_profiles` | `id`, `email`, `role`, `display_name`, `created_at`, `updated_at` |
| `organizer_profiles` | `id`, `user_id`, `organization_name`, `contact_number`, `business_address` |
| `vendor_profiles` | `id`, `user_id`, `business_name`, `service_area`, `rating`, `verification_status` |
| `large_events` | `id`, `organizer_id`, `title`, `event_date`, `venue`, `budget`, `expected_guests`, `status` |
| `event_requirements` | `id`, `event_id`, `category`, `quantity`, `min_budget`, `max_budget`, `requirement_status` |
| `vendor_services` | `id`, `vendor_id`, `category`, `service_name`, `base_price`, `availability_status` |
| `bookings` | `id`, `event_id`, `requirement_id`, `vendor_id`, `organizer_id`, `booking_type`, `status` |
| `contracts` | `id`, `booking_id`, `contract_url`, `storage_path`, `contract_status`, `sent_at`, `signed_at` |
| `notifications` | `id`, `user_id`, `booking_id`, `title`, `message`, `is_read`, `read_at` |
| `booking_status_history` | `id`, `booking_id`, `previous_status`, `new_status`, `changed_by`, `reason` |

---

## Row-Level Security Execution Requirements

### Policy Design Principles

| Principle | Requirement |
|---|---|
| Default deny | Enable RLS and only open specific allowed actions. |
| Role-based | Use `user_profiles.role` to distinguish Organizer, Vendor, and Admin. |
| Ownership-based | Organizer can access records through owned `organizer_profiles`. |
| Assignment-based | Vendor can access bookings assigned to their `vendor_profiles.id`. |
| Admin scoped | Admin can read all and update operational fields only when required. |
| No anonymous access | Private application tables should not allow anonymous reads/writes. |

---

## Helper Functions for RLS

```sql
create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
as $$
  select role
  from public.user_profiles
  where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.current_organizer_profile_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id
  from public.organizer_profiles
  where user_id = auth.uid();
$$;

create or replace function public.current_vendor_profile_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id
  from public.vendor_profiles
  where user_id = auth.uid();
$$;
```

---

## RLS Implementation Examples

### Large Events

```sql
alter table public.large_events enable row level security;

create policy "organizers can read own large events"
on public.large_events
for select
using (
  public.is_admin()
  or organizer_id = public.current_organizer_profile_id()
);

create policy "organizers can create own large events"
on public.large_events
for insert
with check (
  organizer_id = public.current_organizer_profile_id()
);

create policy "organizers can update own large events"
on public.large_events
for update
using (
  organizer_id = public.current_organizer_profile_id()
)
with check (
  organizer_id = public.current_organizer_profile_id()
);
```

### Vendor Bookings

```sql
alter table public.bookings enable row level security;

create policy "organizers can read own event bookings"
on public.bookings
for select
using (
  public.is_admin()
  or organizer_id = public.current_organizer_profile_id()
  or vendor_id = public.current_vendor_profile_id()
);

create policy "organizers can create b2b bookings"
on public.bookings
for insert
with check (
  organizer_id = public.current_organizer_profile_id()
  and booking_type = 'B2B'
  and status = 'pending'
);

create policy "vendors can update assigned booking status"
on public.bookings
for update
using (
  vendor_id = public.current_vendor_profile_id()
)
with check (
  vendor_id = public.current_vendor_profile_id()
);
```

### Notifications

```sql
alter table public.notifications enable row level security;

create policy "users can read own notifications"
on public.notifications
for select
using (user_id = auth.uid() or public.is_admin());

create policy "users can update own notification read state"
on public.notifications
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

---

## SQL Function Requirements

### Updated At Trigger

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

Apply to mutable tables:

```sql
create trigger trg_set_updated_at_large_events
before update on public.large_events
for each row execute function public.set_updated_at();
```

### Booking Requirement Validation

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
    raise exception 'Requirement does not belong to the selected event.';
  end if;

  return new;
end;
$$;
```

### Booking Status History

```sql
create or replace function public.log_booking_status_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.booking_status_history (
      booking_id,
      previous_status,
      new_status,
      changed_by,
      reason
    ) values (
      new.id,
      null,
      new.status,
      auth.uid(),
      'Booking created'
    );
  elsif old.status is distinct from new.status then
    insert into public.booking_status_history (
      booking_id,
      previous_status,
      new_status,
      changed_by,
      reason
    ) values (
      new.id,
      old.status,
      new.status,
      auth.uid(),
      null
    );
  end if;

  return new;
end;
$$;
```

---

## Storage Management

### Buckets

| Bucket | Privacy | Purpose |
|---|---|---|
| `contracts` | Private | Contract files and signed documents. |
| `vendor-documents` | Private | Vendor verification documents. |
| `public-assets` | Public | Non-sensitive brand and UI assets. |

### Contract Storage Rules

- Store path as `contracts/{booking_id}/{timestamp}-{safe_filename}`.
- Database stores `storage_path`, not a permanent public URL.
- Backend generates signed URLs after verifying Organizer/Vendor/Admin access.
- Delete or archive outdated contract files according to retention policy.

---

## Indexing Standards

### Required Indexes

```sql
create index idx_large_events_organizer_id on public.large_events(organizer_id);
create index idx_event_requirements_event_id on public.event_requirements(event_id);
create index idx_vendor_services_vendor_id on public.vendor_services(vendor_id);
create index idx_vendor_services_category_price on public.vendor_services(category, base_price);
create index idx_bookings_event_id on public.bookings(event_id);
create index idx_bookings_vendor_id_status on public.bookings(vendor_id, status);
create index idx_bookings_organizer_id_status on public.bookings(organizer_id, status);
create index idx_notifications_user_read on public.notifications(user_id, is_read, created_at desc);
create index idx_booking_status_history_booking_id on public.booking_status_history(booking_id, created_at desc);
```

### Performance Review Process

1. Identify slow dashboard query.
2. Run `explain analyze` in staging or local data copy.
3. Add targeted index only if it improves real query path.
4. Avoid unnecessary indexes on high-write tables.
5. Re-check insert/update cost after indexing.

---

## Data Quality Rules

| Rule | Enforcement |
|---|---|
| Large Event must have Organizer | Foreign key and RLS. |
| Requirement must belong to event | Foreign key and trigger validation. |
| Booking must link event, requirement, Organizer, and Vendor | Foreign keys and service validation. |
| Contract must belong to booking | Unique foreign key on `contracts.booking_id`. |
| Status values must be valid | PostgreSQL enum types. |
| Budget values cannot be negative | Check constraints. |
| Notifications must have recipient | `user_id not null` foreign key. |

---

## Backup and Recovery Requirements

| Area | Requirement |
|---|---|
| Backup schedule | Confirm Supabase automated backup availability for production tier. |
| Manual backup | Export schema before high-risk migrations. |
| Restore test | Perform periodic staging restore test. |
| Migration rollback | Every destructive migration needs rollback notes. |
| Storage backup | Define retention and archive strategy for contract files. |

---

## Data Admin Definition of Done

A database task is complete only when:

- Migration file is created and committed.
- Schema changes replay from a clean database.
- Foreign keys and constraints are present.
- RLS is enabled and tested.
- Policies match Organizer, Vendor, and Admin access rules.
- Indexes support expected query patterns.
- Seed data works without exposing real personal data.
- Storage policies are private for sensitive files.
- Backup or rollback plan exists for risky changes.
