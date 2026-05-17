create table if not exists invoice_extractions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  gst_number text,
  invoice_number text,
  company_name text,
  invoice_date text,
  total_amount text,
  storage_path text,
  created_at timestamptz not null default now()
);

alter table invoice_extractions
add column if not exists storage_path text;

alter table invoice_extractions enable row level security;

drop policy if exists "Users can view their own extractions"
on invoice_extractions;

create policy "Users can view their own extractions"
on invoice_extractions
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own extractions"
on invoice_extractions;

create policy "Users can create their own extractions"
on invoice_extractions
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own extractions"
on invoice_extractions;

create policy "Users can update their own extractions"
on invoice_extractions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own extractions"
on invoice_extractions;

create policy "Users can delete their own extractions"
on invoice_extractions
for delete
using (auth.uid() = user_id);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'invoice-files',
  'invoice-files',
  false,
  10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload their own invoice files"
on storage.objects;

create policy "Users can upload their own invoice files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'invoice-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can view their own invoice files"
on storage.objects;

create policy "Users can view their own invoice files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'invoice-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their own invoice files"
on storage.objects;

create policy "Users can delete their own invoice files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'invoice-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);
