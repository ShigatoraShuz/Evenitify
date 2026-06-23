-- Storage Buckets
insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('vendor-documents', 'vendor-documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

-- Contracts Bucket Policies
create policy "authenticated users can read contracts"
on storage.objects for select
using (
  bucket_id = 'contracts'
  and auth.role() = 'authenticated'
);

create policy "vendors and admin can upload contracts"
on storage.objects for insert
with check (
  bucket_id = 'contracts'
  and auth.role() = 'authenticated'
);

-- Vendor Documents Bucket Policies
create policy "vendors can read own vendor documents"
on storage.objects for select
using (
  bucket_id = 'vendor-documents'
  and auth.role() = 'authenticated'
);

create policy "vendors can upload own vendor documents"
on storage.objects for insert
with check (
  bucket_id = 'vendor-documents'
  and auth.role() = 'authenticated'
);

-- Public Assets Bucket Policies
create policy "anyone can read public assets"
on storage.objects for select
using (bucket_id = 'public-assets');

create policy "admin can upload public assets"
on storage.objects for insert
with check (
  bucket_id = 'public-assets'
  and auth.role() = 'authenticated'
);
