-- ============================================================
-- Migration 0016: Create procurement_request_messages table
-- Separate from booking_messages since procurement_requests
-- are distinct entities from bookings.
-- ============================================================

create table if not exists public.procurement_request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.procurement_requests(id) on delete cascade,
  author_user_id uuid not null references public.user_profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.procurement_request_messages enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'procurement_request_messages' and policyname = 'participants can read procurement request messages'
  ) then
    create policy "participants can read procurement request messages"
    on public.procurement_request_messages for select
    using (
      public.is_admin() or exists (
        select 1 from public.procurement_requests pr
        where pr.id = procurement_request_messages.request_id
          and (
            pr.organizer_id = public.current_organizer_profile_id()
            or exists (
              select 1 from public.request_vendors rv
              where rv.request_id = pr.id
                and rv.vendor_id = public.current_vendor_profile_id()
            )
          )
      )
    );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'procurement_request_messages' and policyname = 'participants can insert procurement request messages'
  ) then
    create policy "participants can insert procurement request messages"
    on public.procurement_request_messages for insert
    with check (
      (author_user_id = auth.uid()) and (
        public.is_admin() or exists (
          select 1 from public.procurement_requests pr
          where pr.id = procurement_request_messages.request_id
            and (
              pr.organizer_id = public.current_organizer_profile_id()
              or exists (
                select 1 from public.request_vendors rv
                where rv.request_id = pr.id
                  and rv.vendor_id = public.current_vendor_profile_id()
              )
            )
        )
      )
    );
  end if;
end $$;

create index if not exists idx_procurement_request_messages_request_id
  on public.procurement_request_messages(request_id);

create index if not exists idx_procurement_request_messages_created_at
  on public.procurement_request_messages(created_at);
