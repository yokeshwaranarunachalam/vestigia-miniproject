-- ==============================================================================
-- Vestigia Consolidated Setup Migration (Idempotent / Safe to Re-run)
-- Combines increments 0002 through 0005:
--   1. Semesters (Academics)
--   2. Certificates & Certificates Storage Bucket
--   3. Projects & Achievements
--   4. Hackathons & Uploads Tracking
--   5. Dashboard Stats & Global Search RPC Functions
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ACADEMICS / SEMESTERS
-- ------------------------------------------------------------------------------
create table if not exists public.semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  semester int not null check (semester between 1 and 8),
  gpa numeric(4, 2),
  cgpa numeric(4, 2),
  subjects jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, semester)
);

create index if not exists idx_semesters_user_sem on public.semesters (user_id, semester);

alter table public.semesters enable row level security;

drop policy if exists "own rows" on public.semesters;
create policy "own rows"
  on public.semesters
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 2. CERTIFICATES & CERTIFICATES STORAGE
-- ------------------------------------------------------------------------------
create table if not exists public.certificates (
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

create index if not exists idx_certificates_user_issued on public.certificates (user_id, issued_on desc);

alter table public.certificates enable row level security;

drop policy if exists "own certificates" on public.certificates;
create policy "own certificates"
  on public.certificates
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Private storage bucket for certificates (2 MB limit)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certificates',
  'certificates',
  false,
  2097152,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- Storage object policies
drop policy if exists "Users can view own certificate files" on storage.objects;
create policy "Users can view own certificate files"
  on storage.objects for select
  using (
    bucket_id = 'certificates'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can upload own certificate files" on storage.objects;
create policy "Users can upload own certificate files"
  on storage.objects for insert
  with check (
    bucket_id = 'certificates'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own certificate files" on storage.objects;
create policy "Users can update own certificate files"
  on storage.objects for update
  using (
    bucket_id = 'certificates'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own certificate files" on storage.objects;
create policy "Users can delete own certificate files"
  on storage.objects for delete
  using (
    bucket_id = 'certificates'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ------------------------------------------------------------------------------
-- 3. PROJECTS & ACHIEVEMENTS
-- ------------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text check (char_length(description) <= 2000),
  tech_stack text[] not null default '{}',
  project_url text,
  github_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_user_created on public.projects (user_id, created_at desc);
create index if not exists idx_projects_tech_stack on public.projects using gin (tech_stack);

alter table public.projects enable row level security;

drop policy if exists "own rows" on public.projects;
create policy "own rows"
  on public.projects
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  organization text,
  achieved_on date,
  description text check (char_length(description) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists idx_achievements_user_achieved on public.achievements (user_id, achieved_on desc);

alter table public.achievements enable row level security;

drop policy if exists "own rows" on public.achievements;
create policy "own rows"
  on public.achievements
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. HACKATHONS & UPLOADS TRACKER
-- ------------------------------------------------------------------------------
create table if not exists public.hackathons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_name text not null check (char_length(event_name) between 1 and 200),
  project_name text,
  event_date date,
  location text,
  team_size int check (team_size is null or team_size between 1 and 50),
  prize text,
  tech_stack text[] not null default '{}',
  project_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_hackathons_user_date on public.hackathons (user_id, event_date desc);

alter table public.hackathons enable row level security;

drop policy if exists "own rows" on public.hackathons;
create policy "own rows"
  on public.hackathons
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('certificate', 'marksheet', 'photo', 'other')),
  file_name text not null,
  file_size_bytes int check (file_size_bytes is null or file_size_bytes <= 2097152),
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_uploads_user_created on public.uploads (user_id, created_at desc);

alter table public.uploads enable row level security;

drop policy if exists "own rows" on public.uploads;
create policy "own rows"
  on public.uploads
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. DASHBOARD STATS FUNCTION: get_dashboard()
-- ------------------------------------------------------------------------------
create or replace function public.get_dashboard()
returns json
language sql
stable
security invoker
as $$
  with user_semesters as (
    select semester, gpa, cgpa
    from public.semesters
    where user_id = auth.uid()
    order by semester desc
  ),
  highest_sem as (
    select cgpa from user_semesters limit 1
  ),
  second_highest_sem as (
    select cgpa from user_semesters offset 1 limit 1
  ),
  calculated_cgpa as (
    select
      (select cgpa from highest_sem) as current_cgpa,
      (select cgpa from second_highest_sem) as previous_cgpa,
      case 
        when (select cgpa from highest_sem) is null 
          or (select cgpa from second_highest_sem) is null 
          or (select cgpa from second_highest_sem) = 0 then null
        else round((((select cgpa from highest_sem) - (select cgpa from second_highest_sem)) / (select cgpa from second_highest_sem) * 100)::numeric, 1)
      end as cgpa_change_percent
  ),
  counts as (
    select
      (select count(*) from public.certificates where user_id = auth.uid()) as total_certificates,
      (select count(*) from public.projects where user_id = auth.uid()) as projects_built,
      (select count(*) from public.hackathons where user_id = auth.uid()) as hackathons
  ),
  trend as (
    select coalesce(
      json_agg(
        json_build_object('semester', semester, 'gpa', gpa)
        order by semester asc
      ),
      '[]'::json
    ) as gpa_trend
    from public.semesters
    where user_id = auth.uid()
  ),
  recent as (
    select coalesce(
      json_agg(
        json_build_object(
          'id', id,
          'kind', kind,
          'file_name', file_name,
          'file_size_bytes', file_size_bytes,
          'storage_path', storage_path,
          'created_at', created_at
        )
      ),
      '[]'::json
    ) as recent_uploads
    from (
      select id, kind, file_name, file_size_bytes, storage_path, created_at
      from public.uploads
      where user_id = auth.uid()
      order by created_at desc
      limit 3
    ) u
  )
  select json_build_object(
    'current_cgpa', (select current_cgpa from calculated_cgpa),
    'previous_cgpa', (select previous_cgpa from calculated_cgpa),
    'cgpa_change_percent', (select cgpa_change_percent from calculated_cgpa),
    'total_certificates', (select total_certificates from counts),
    'projects_built', (select projects_built from counts),
    'hackathons', (select hackathons from counts),
    'gpa_trend', (select gpa_trend from trend),
    'recent_uploads', (select recent_uploads from recent)
  );
$$;

-- ------------------------------------------------------------------------------
-- 6. GLOBAL SEARCH FUNCTION: search_all(q text)
-- ------------------------------------------------------------------------------
create or replace function public.search_all(q text)
returns json
language sql
stable
security invoker
as $$
  select case
    when q is null or char_length(trim(q)) < 2 then
      json_build_object(
        'certificates', '[]'::json,
        'projects', '[]'::json,
        'achievements', '[]'::json,
        'hackathons', '[]'::json
      )
    else
      json_build_object(
        'certificates', coalesce((
          select json_agg(c) from (
            select id, title, provider, issued_on
            from public.certificates
            where user_id = auth.uid()
              and (title ilike '%' || trim(q) || '%' or provider ilike '%' || trim(q) || '%')
            limit 5
          ) c
        ), '[]'::json),
        'projects', coalesce((
          select json_agg(p) from (
            select id, title, description, tech_stack, project_url, github_url
            from public.projects
            where user_id = auth.uid()
              and title ilike '%' || trim(q) || '%'
            limit 5
          ) p
        ), '[]'::json),
        'achievements', coalesce((
          select json_agg(a) from (
            select id, title, organization, achieved_on
            from public.achievements
            where user_id = auth.uid()
              and title ilike '%' || trim(q) || '%'
            limit 5
          ) a
        ), '[]'::json),
        'hackathons', coalesce((
          select json_agg(h) from (
            select id, event_name, project_name, event_date, location, prize
            from public.hackathons
            where user_id = auth.uid()
              and (event_name ilike '%' || trim(q) || '%' or project_name ilike '%' || trim(q) || '%')
            limit 5
          ) h
        ), '[]'::json)
      )
  end;
$$;

