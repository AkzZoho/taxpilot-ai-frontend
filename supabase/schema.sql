-- Run this in your Supabase SQL Editor

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  mobile text,
  pan text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Tax documents (uploaded files)
create table public.tax_documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null, -- 'Form 16', 'AIS', 'Form 26AS', 'Salary Slip'
  storage_path text,
  status text default 'uploaded', -- 'uploaded' | 'processing' | 'done' | 'error'
  created_at timestamptz default now()
);
alter table public.tax_documents enable row level security;
create policy "Users manage own documents" on public.tax_documents
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Extracted tax fields
create table public.extracted_fields (
  id text not null,
  user_id uuid references auth.users on delete cascade not null,
  label text not null,
  value numeric not null,
  source text not null,
  confidence text not null, -- 'high' | 'medium' | 'low'
  formula text,
  explanation text,
  created_at timestamptz default now(),
  primary key (id, user_id)
);
alter table public.extracted_fields enable row level security;
create policy "Users manage own fields" on public.extracted_fields
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tax analyses (regime comparison results)
create table public.tax_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  assessment_year text not null default '2024-25',
  gross_income numeric,
  old_regime_tax numeric,
  new_regime_tax numeric,
  recommended_regime text,
  health_score integer,
  filing_status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.tax_analyses enable row level security;
create policy "Users manage own analyses" on public.tax_analyses
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage bucket for documents
insert into storage.buckets (id, name, public) values ('tax-documents', 'tax-documents', false)
  on conflict do nothing;
create policy "Users upload own documents" on storage.objects for insert
  with check (bucket_id = 'tax-documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users read own documents" on storage.objects for select
  using (bucket_id = 'tax-documents' and auth.uid()::text = (storage.foldername(name))[1]);
