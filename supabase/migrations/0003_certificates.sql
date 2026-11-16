-- Increment 3: Certificates Table, Storage Bucket, and RLS Policies

-- 1. Create certificates table
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  provider text,
  issued_on date,
  file_path text,
  file_name text,
  file_size_bytes int check (file_size_bytes is null or file_size_bytes <= 2097152),
  file_type text check (file_type is null or file_type in ('application/pdf', 'image/jpeg', 'image/png')),
  credential_url text,
  created_at timestamptz not null default now()
);

-- 2. Index for filtering user's certificates ordered by issue date
create index on public.certificates (user_id, issued_on desc);

-- 3. Enable Row Level Security (RLS) on certificates
alter table public.certificates enable row level security;

-- 4. Policy for certificates table: users have full CRUD on their own records
create policy "own certificates"
  on public.certificates
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Storage: Create private bucket "certificates" with 2 MB limit and allowed MIME types
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certificates',
  'certificates',
  false,
  2097152,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 2097152,
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png'];

-- 6. Storage RLS Policies: users access only their own subfolder (<user_id>/...)
create policy "Users can view own certificate files"
  on storage.objects for select
  using (
    bucket_id = 'certificates'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can upload own certificate files"
  on storage.objects for insert
  with check (
    bucket_id = 'certificates'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own certificate files"
  on storage.objects for update
  using (
    bucket_id = 'certificates'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own certificate files"
  on storage.objects for delete
  using (
    bucket_id = 'certificates'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

