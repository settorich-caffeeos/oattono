-- DT Copilot — Supabase schema
-- Run this once in Supabase Dashboard → SQL Editor (or via the Supabase CLI).
-- Creates a per-user profile table with Row Level Security and an
-- auto-provisioning trigger that inserts a profile row on signup.

-- 1) Profiles table (1:1 with auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  display_name text,
  department  text,
  role_level  text,
  updated_at  timestamptz default now()
);

-- 2) Row Level Security: each user can only see/edit their own row
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3) Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, department, role_level)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    coalesce(new.raw_user_meta_data ->> 'department', ''),
    coalesce(new.raw_user_meta_data ->> 'role_level', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 4) Projects & documents (per-user, cross-device)
-- ============================================================
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  description text default '',
  created_at  timestamptz default now()
);
alter table public.projects enable row level security;
drop policy if exists "Projects are owned" on public.projects;
create policy "Projects are owned" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  module_slug text,
  title       text,
  content     text,
  created_at  timestamptz default now()
);
alter table public.documents enable row level security;
drop policy if exists "Documents are owned" on public.documents;
create policy "Documents are owned" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists documents_project_idx on public.documents (project_id);

-- ============================================================
-- 5) Knowledge base (RAG source — organisation documents)
-- ============================================================
create table if not exists public.knowledge_base (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title      text not null,
  category   text default '',
  content    text not null,
  created_at timestamptz default now()
);
alter table public.knowledge_base enable row level security;
drop policy if exists "Knowledge is owned" on public.knowledge_base;
create policy "Knowledge is owned" on public.knowledge_base
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
