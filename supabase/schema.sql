create extension if not exists pgcrypto;

create table if not exists public.users (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at before update on public.transactions for each row execute function public.set_updated_at();
drop trigger if exists stock_movements_set_updated_at on public.stock_movements;
create trigger stock_movements_set_updated_at before update on public.stock_movements for each row execute function public.set_updated_at();
drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at before update on public.expenses for each row execute function public.set_updated_at();
drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at before update on public.app_settings for each row execute function public.set_updated_at();

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.transactions enable row level security;
alter table public.stock_movements enable row level security;
alter table public.expenses enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "public access users" on public.users;
create policy "public access users" on public.users for all using (true) with check (true);
drop policy if exists "public access categories" on public.categories;
create policy "public access categories" on public.categories for all using (true) with check (true);
drop policy if exists "public access products" on public.products;
create policy "public access products" on public.products for all using (true) with check (true);
drop policy if exists "public access transactions" on public.transactions;
create policy "public access transactions" on public.transactions for all using (true) with check (true);
drop policy if exists "public access stock_movements" on public.stock_movements;
create policy "public access stock_movements" on public.stock_movements for all using (true) with check (true);
drop policy if exists "public access expenses" on public.expenses;
create policy "public access expenses" on public.expenses for all using (true) with check (true);
drop policy if exists "public access app_settings" on public.app_settings;
create policy "public access app_settings" on public.app_settings for all using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('expense-receipts', 'expense-receipts', true)
on conflict (id) do nothing;

drop policy if exists "public upload expense receipts" on storage.objects;
create policy "public upload expense receipts"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'expense-receipts');

drop policy if exists "public read expense receipts" on storage.objects;
create policy "public read expense receipts"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'expense-receipts');

drop policy if exists "public update expense receipts" on storage.objects;
create policy "public update expense receipts"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'expense-receipts')
with check (bucket_id = 'expense-receipts');

drop policy if exists "public delete expense receipts" on storage.objects;
create policy "public delete expense receipts"
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'expense-receipts');
