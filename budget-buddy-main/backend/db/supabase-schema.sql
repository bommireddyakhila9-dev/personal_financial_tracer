create extension if not exists "pgcrypto";

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null,
  category text not null,
  date date not null,
  tags text[] not null default '{}',
  payment_method text not null,
  notes text not null default ''
);

create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  amount numeric not null,
  date date not null,
  recurring boolean not null default false
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  "limit" numeric not null,
  spent numeric not null default 0,
  month text not null
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_amount numeric not null,
  current_amount numeric not null default 0,
  deadline date not null,
  icon text not null default '*'
);

alter table public.expenses enable row level security;
alter table public.incomes enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;

drop policy if exists "Allow full access to expenses" on public.expenses;
create policy "Allow full access to expenses"
on public.expenses for all
using (true)
with check (true);

drop policy if exists "Allow full access to incomes" on public.incomes;
create policy "Allow full access to incomes"
on public.incomes for all
using (true)
with check (true);

drop policy if exists "Allow full access to budgets" on public.budgets;
create policy "Allow full access to budgets"
on public.budgets for all
using (true)
with check (true);

drop policy if exists "Allow full access to savings goals" on public.savings_goals;
create policy "Allow full access to savings goals"
on public.savings_goals for all
using (true)
with check (true);
