-- Vestigia Increment 1: Profiles Table, Trigger & RLS Policies

-- 1. Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  roll_number text,
  department text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Create function to automatically insert a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- 3. Create trigger to fire after a user is inserted in auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 5. RLS Policies
-- Allow users to read their own profile or any profile marked as public
create policy "users read own profile"
  on public.profiles
  for select
  using (auth.uid() = id or is_public = true);

-- Allow users to update only their own profile
create policy "users update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

