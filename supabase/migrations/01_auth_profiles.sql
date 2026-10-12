-- PrepSmart AI - Supabase PostgreSQL Profiles Schema & Row Level Security (RLS)
-- Matches official Supabase Reference Architecture (supabase/examples/auth/nextjs-full)

-- 1. Create public profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  email text,
  avatar_url text,
  target_role text,
  experience_level text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. RLS Policies
-- Allow candidates to read their own profile
create policy "Users can view their own profile." on public.profiles
  for select using (auth.uid() = id);

-- Allow candidates to update their own profile
create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- Allow system/user to insert profile
create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

-- 4. Trigger Function: automatically sync auth.users to public.profiles upon signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    now()
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- 5. Attach Trigger to auth.users table
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
