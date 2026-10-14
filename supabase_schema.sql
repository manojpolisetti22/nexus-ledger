-- =========================================================================
-- NEXUS LEDGER: SUPABASE DATABASE SCHEMA
-- Run this script in your Supabase Dashboard:
-- 1. Go to https://supabase.com/dashboard/project/lpnhoilcvnwbzryxdhez
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New Query", paste this SQL, and click "Run" (▶)
-- =========================================================================

-- 1. Create expenses table
create table if not exists public.expenses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric not null,
  payee text not null,
  category text not null,
  date text not null,
  notes text default '',
  payment_method text default 'Company Card',
  raw_input text default '',
  timestamp bigint default (extract(epoch from now()) * 1000)::bigint,
  created_at timestamptz default now()
);

-- 2. Create index for fast user querying
create index if not exists idx_expenses_user_date on public.expenses(user_id, date desc);

-- 3. Enable Row Level Security (RLS)
alter table public.expenses enable row level security;

-- 4. Row Level Security Policies
drop policy if exists "Users can view their own expenses" on public.expenses;
create policy "Users can view their own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own expenses" on public.expenses;
create policy "Users can insert their own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own expenses" on public.expenses;
create policy "Users can update their own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own expenses" on public.expenses;
create policy "Users can delete their own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- 5. Enable Realtime publication so Phone and Laptop update instantly
alter publication supabase_realtime add table public.expenses;
