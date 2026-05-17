# GST Invoice Extractor

A beginner-friendly AI SaaS starter built with Next.js, Tailwind CSS, Supabase authentication, file upload, and Gemini invoice extraction.

## Features

- Login and signup with Supabase email/password auth
- Mobile-responsive dashboard
- PDF and image invoice upload
- Gemini-powered extraction for:
  - GST number
  - Invoice number
  - Company name
  - Date
  - Total amount
- Extracted data table
- Edit and delete saved extraction rows
- Private invoice file storage with signed view links
- Search and invoice-date filters
- CSV export

## Folder Structure

```txt
gst-invoice-extractor/
|-- app/
|   |-- api/
|   |   `-- extract/
|   |       `-- route.ts
|   |-- auth/
|   |   `-- page.tsx
|   |-- dashboard/
|   |   `-- page.tsx
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- components/
|   |-- dashboard-client.tsx
|   |-- dashboard-shell.tsx
|   |-- extraction-table.tsx
|   `-- upload-panel.tsx
|-- lib/
|   |-- csv.ts
|   |-- gemini.ts
|   |-- supabase-client.ts
|   |-- supabase-server.ts
|   `-- types.ts
|-- .env.example
|-- next.config.mjs
|-- package.json
|-- postcss.config.mjs
|-- tailwind.config.ts
`-- tsconfig.json
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

In Supabase, enable **Authentication > Providers > Email**. For a beginner starter, you can also disable email confirmation while testing locally.

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How Extraction Works

The dashboard sends the uploaded file to `app/api/extract/route.ts` with the user's Supabase access token. The API route verifies the token with Supabase, converts the invoice to base64, and sends it to the Gemini API with a strict JSON schema.

After extraction, the API route uploads the original file to the private `invoice-files` Supabase Storage bucket and saves the row to the `invoice_extractions` Supabase table. The dashboard loads saved rows from that table when the user returns and creates short-lived signed URLs when the user clicks the view-file action.

## Suggested Supabase Table for Production

You can also find this SQL in `supabase/invoice_extractions.sql`.

```sql
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

create policy "Users can view their own extractions"
on invoice_extractions
for select
using (auth.uid() = user_id);

create policy "Users can create their own extractions"
on invoice_extractions
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own extractions"
on invoice_extractions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

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

create policy "Users can upload their own invoice files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'invoice-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can view their own invoice files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'invoice-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own invoice files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'invoice-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

## Notes

- Upload size is limited to 10 MB in the UI and API route.
- Supported files are PDF, PNG, JPG, and WebP.
- `GEMINI_MODEL` is configurable. `gemini-2.5-flash` is used as a fast starter default for vision and PDF invoice extraction.
- Deployment steps are in `DEPLOYMENT.md`.
