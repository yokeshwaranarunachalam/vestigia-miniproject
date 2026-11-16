-- Increment 4: Projects and Achievements Tables & RLS Policies

-- 1. Create projects table
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text check (char_length(description) <= 2000),
  tech_stack text[] not null default '{}',
  project_url text,
  github_url text,
  created_at timestamptz not null default now()
);

-- Indexes for projects
create index on public.projects (user_id, created_at desc);
create index on public.projects using gin (tech_stack);

-- Enable RLS on projects
alter table public.projects enable row level security;

-- Policy on projects
create policy "own rows"
  on public.projects
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Create achievements table
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  organization text,
  achieved_on date,
  description text check (char_length(description) <= 2000),
  created_at timestamptz not null default now()
);

-- Index for achievements
create index on public.achievements (user_id, achieved_on desc);

-- Enable RLS on achievements
alter table public.achievements enable row level security;

-- Policy on achievements
create policy "own rows"
  on public.achievements
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

