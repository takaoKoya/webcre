-- ウェブクリ Supabase Schema
-- Run this SQL in your Supabase SQL editor

-- ユーザープロフィール
create table if not exists profiles (
  id uuid references auth.users primary key,
  display_name text,
  company_name text,
  plan text default 'free',  -- free/standard/pro/agency
  ai_calls_used integer default 0,
  ai_calls_reset_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS (Row Level Security)
alter table profiles enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- プロジェクト（生成サイト）
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  config jsonb not null default '{}',
  generated_site jsonb,
  status text default 'draft',  -- draft/published
  deploy_url text,
  custom_domain text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table projects enable row level security;

create policy "Users can view own projects" on projects
  for select using (auth.uid() = user_id);

create policy "Users can insert own projects" on projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update own projects" on projects
  for update using (auth.uid() = user_id);

create policy "Users can delete own projects" on projects
  for delete using (auth.uid() = user_id);

-- デプロイ履歴
create table if not exists deployments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  url text,
  provider text,  -- vercel/netlify/download
  created_at timestamptz default now()
);

alter table deployments enable row level security;

create policy "Users can view own deployments" on deployments
  for select using (
    auth.uid() = (select user_id from projects where id = project_id)
  );

create policy "Users can insert own deployments" on deployments
  for insert with check (
    auth.uid() = (select user_id from projects where id = project_id)
  );

-- プロフィール自動作成トリガー
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
