# Deploy GST Invoice Extractor to Vercel

## 1. Confirm Supabase Is Ready

Run the latest SQL in Supabase SQL Editor:

```txt
supabase/invoice_extractions.sql
```

This creates:

- `invoice_extractions` table
- Row-level security policies
- Private `invoice-files` Storage bucket
- Storage upload/view/delete policies

## 2. Create A Vercel Account

Go to:

```txt
https://vercel.com
```

Sign in with GitHub, Google, or email.

## 3. Link The Project From VS Code With Vercel CLI

Stop the local dev server first:

```bash
Ctrl + C
```

Install the Vercel CLI:

```bash
npm install -g vercel
```

Login:

```bash
vercel login
```

Deploy:

```bash
vercel
```

Recommended answers:

```txt
Set up and deploy? yes
Which scope? your account
Link to existing project? no
Project name? gst-invoice-extractor
Directory? ./
Override settings? no
```

If this first preview deploy fails because env vars are missing, that is okay. The Vercel project will still usually be created, and you can add env vars next.

## 4. Add Environment Variables In Vercel Before Production

Open your Vercel project:

```txt
Project > Settings > Environment Variables
```

Add these for Production, Preview, and Development:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

Do not upload `.env.local`. It is intentionally ignored by Git.

You can also add them from the VS Code terminal:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add GEMINI_API_KEY production
vercel env add GEMINI_MODEL production
```

## 5. Deploy Production

After adding environment variables:

```bash
vercel --prod
```

Vercel will print your production URL.

## 6. Update Supabase Auth URLs

In Supabase, open:

```txt
Authentication > URL Configuration
```

Set Site URL to your Vercel URL:

```txt
https://your-project.vercel.app
```

Add Redirect URLs:

```txt
http://localhost:3000/**
https://your-project.vercel.app/**
```

## 7. Test Production

Open your Vercel URL and test:

1. Sign up or log in
2. Upload an invoice
3. Extract data
4. View stored file
5. Edit and delete a row
6. Export CSV

## Notes

- The app uploads invoice files directly to Supabase Storage before calling the extraction API. This avoids Vercel Function request body limits.
- The Gemini key is server-side only. Never expose it with a `NEXT_PUBLIC_` prefix.
