create extension if not exists pgcrypto;

create table if not exists public.users (
  id text primary key,
  name text not null default '',
  username text not null default '',
  password text not null default '',
  password_salt text,
  role text not null default 'owner',
  avatar text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  name text not null default '',
  icon text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null default '',
  category_id text not null default '',
  price bigint not null default 0,
  stock integer not null default 0,
  track_stock boolean not null default true,
  image text not null default '',
  active boolean not null default true,
  recipe jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id text primary key,
  code text not null default '',
  date timestamptz not null default now(),
  cashier_id text not null default '',
  cashier_name text not null default '',
  items jsonb not null default '[]'::jsonb,
  subtotal bigint not null default 0,
  extra_charge bigint not null default 0,
  total bigint not null default 0,
  payment_method text not null default 'tunai',
  cash_received bigint,
  change_amount bigint,
  status text not null default 'selesai',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id text primary key,
  product_id text not null default '',
  product_name text not null default '',
  type text not null default 'masuk',
  qty integer not null default 0,
  reason text not null default '',
  date timestamptz not null default now(),
  user_id text not null default '',
  user_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id text primary key,
  date timestamptz not null default now(),
  category text not null default '',
  amount bigint not null default 0,
  note text not null default '',
  created_by_user_id text not null default '',
  created_by text not null default '',
  created_by_role text not null default 'owner',
  receipt_image text,
  receipt_image_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id text primary key,
  business_name text not null default '',
  business_address text not null default '',
  business_phone text not null default '',
  business_logo text,
  footer_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shifts (
  id text primary key,
  cashier_id text not null default '',
  cashier_name text not null default '',
  closed_by_cashier_id text,
  closed_by_cashier_name text,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  opening_cash bigint not null default 0,
  total_cash_sales bigint,
  total_cash_expenses bigint,
  expected_cash bigint,
  actual_cash bigint,
  difference bigint,
  notes text,
  status text not null default 'buka',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.raw_materials (
  id text primary key,
  name text not null default '',
  unit text not null default 'pcs',
  stock integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.raw_material_movements (
  id text primary key,
  raw_material_id text not null default '',
  raw_material_name text not null default '',
  type text not null default 'masuk',
  qty integer not null default 0,
  reason text not null default '',
  date timestamptz not null default now(),
  user_id text not null default '',
  user_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users add column if not exists name text not null default '';
alter table public.users add column if not exists username text not null default '';
alter table public.users add column if not exists password text not null default '';
alter table public.users add column if not exists password_salt text;
alter table public.users add column if not exists role text not null default 'owner';
alter table public.users add column if not exists avatar text;
alter table public.users add column if not exists active boolean not null default true;

alter table public.categories add column if not exists name text not null default '';
alter table public.categories add column if not exists icon text not null default '';
alter table public.categories add column if not exists active boolean not null default true;

alter table public.products add column if not exists name text not null default '';
alter table public.products add column if not exists category_id text not null default '';
alter table public.products add column if not exists price bigint not null default 0;
alter table public.products add column if not exists stock integer not null default 0;
alter table public.products add column if not exists track_stock boolean not null default true;
alter table public.products add column if not exists image text not null default '';
alter table public.products add column if not exists active boolean not null default true;
alter table public.products add column if not exists recipe jsonb not null default '[]'::jsonb;

alter table public.transactions add column if not exists code text not null default '';
alter table public.transactions add column if not exists date timestamptz not null default now();
alter table public.transactions add column if not exists cashier_id text not null default '';
alter table public.transactions add column if not exists cashier_name text not null default '';
alter table public.transactions add column if not exists items jsonb not null default '[]'::jsonb;
alter table public.transactions add column if not exists subtotal bigint not null default 0;
alter table public.transactions add column if not exists extra_charge bigint not null default 0;
alter table public.transactions add column if not exists total bigint not null default 0;
alter table public.transactions add column if not exists payment_method text not null default 'tunai';
alter table public.transactions add column if not exists cash_received bigint;
alter table public.transactions add column if not exists change_amount bigint;
alter table public.transactions add column if not exists status text not null default 'selesai';

alter table public.stock_movements add column if not exists product_id text not null default '';
alter table public.stock_movements add column if not exists product_name text not null default '';
alter table public.stock_movements add column if not exists type text not null default 'masuk';
alter table public.stock_movements add column if not exists qty integer not null default 0;
alter table public.stock_movements add column if not exists reason text not null default '';
alter table public.stock_movements add column if not exists date timestamptz not null default now();
alter table public.stock_movements add column if not exists user_id text not null default '';
alter table public.stock_movements add column if not exists user_name text not null default '';

alter table public.expenses add column if not exists date timestamptz not null default now();
alter table public.expenses add column if not exists category text not null default '';
alter table public.expenses add column if not exists amount bigint not null default 0;
alter table public.expenses add column if not exists note text not null default '';
alter table public.expenses add column if not exists created_by_user_id text not null default '';
alter table public.expenses add column if not exists created_by text not null default '';
alter table public.expenses add column if not exists created_by_role text not null default 'owner';
alter table public.expenses add column if not exists receipt_image text;
alter table public.expenses add column if not exists receipt_image_name text;

alter table public.app_settings add column if not exists business_name text not null default '';
alter table public.app_settings add column if not exists business_address text not null default '';
alter table public.app_settings add column if not exists business_phone text not null default '';
alter table public.app_settings add column if not exists business_logo text;
alter table public.app_settings add column if not exists footer_note text not null default '';

alter table public.shifts add column if not exists cashier_id text not null default '';
alter table public.shifts add column if not exists cashier_name text not null default '';
alter table public.shifts add column if not exists closed_by_cashier_id text;
alter table public.shifts add column if not exists closed_by_cashier_name text;
alter table public.shifts add column if not exists opened_at timestamptz not null default now();
alter table public.shifts add column if not exists closed_at timestamptz;
alter table public.shifts add column if not exists opening_cash bigint not null default 0;
alter table public.shifts add column if not exists total_cash_sales bigint;
alter table public.shifts add column if not exists total_cash_expenses bigint;
alter table public.shifts add column if not exists expected_cash bigint;
alter table public.shifts add column if not exists actual_cash bigint;
alter table public.shifts add column if not exists difference bigint;
alter table public.shifts add column if not exists notes text;
alter table public.shifts add column if not exists status text not null default 'buka';

create unique index if not exists shifts_one_open_idx on public.shifts (status) where status = 'buka';

alter table public.raw_materials add column if not exists name text not null default '';
alter table public.raw_materials add column if not exists unit text not null default 'pcs';
alter table public.raw_materials add column if not exists stock integer not null default 0;
alter table public.raw_materials add column if not exists active boolean not null default true;

alter table public.raw_material_movements add column if not exists raw_material_id text not null default '';
alter table public.raw_material_movements add column if not exists raw_material_name text not null default '';
alter table public.raw_material_movements add column if not exists type text not null default 'masuk';
alter table public.raw_material_movements add column if not exists qty integer not null default 0;
alter table public.raw_material_movements add column if not exists reason text not null default '';
alter table public.raw_material_movements add column if not exists date timestamptz not null default now();
alter table public.raw_material_movements add column if not exists user_id text not null default '';
alter table public.raw_material_movements add column if not exists user_name text not null default '';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'payload'
  ) then
    update public.users
    set
      name = coalesce(payload->>'name', name),
      username = coalesce(payload->>'username', payload->>'email', username),
      password = coalesce(payload->>'password', password),
      password_salt = coalesce(payload->>'passwordSalt', password_salt),
      role = coalesce(payload->>'role', role),
      avatar = coalesce(payload->>'avatar', avatar),
      active = coalesce((payload->>'active')::boolean, active),
      created_at = coalesce((payload->>'createdAt')::timestamptz, created_at)
    where payload is not null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'categories' and column_name = 'payload'
  ) then
    update public.categories
    set
      name = coalesce(payload->>'name', name),
      icon = coalesce(payload->>'icon', icon),
      active = coalesce((payload->>'active')::boolean, active),
      created_at = coalesce((payload->>'createdAt')::timestamptz, created_at)
    where payload is not null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'payload'
  ) then
    update public.products
    set
      name = coalesce(payload->>'name', name),
      category_id = coalesce(payload->>'categoryId', category_id),
      price = coalesce((payload->>'price')::bigint, price),
      stock = coalesce((payload->>'stock')::integer, stock),
      track_stock = coalesce((payload->>'trackStock')::boolean, track_stock),
      image = coalesce(payload->>'image', image),
      active = coalesce((payload->>'active')::boolean, active),
      created_at = coalesce((payload->>'createdAt')::timestamptz, created_at)
    where payload is not null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'payload'
  ) then
    update public.transactions
    set
      code = coalesce(payload->>'code', code),
      date = coalesce((payload->>'date')::timestamptz, date),
      cashier_id = coalesce(payload->>'cashierId', cashier_id),
      cashier_name = coalesce(payload->>'cashierName', cashier_name),
      items = coalesce(payload->'items', items),
      subtotal = coalesce((payload->>'subtotal')::bigint, subtotal),
      extra_charge = coalesce((payload->>'extraCharge')::bigint, extra_charge),
      total = coalesce((payload->>'total')::bigint, total),
      payment_method = coalesce(payload->>'paymentMethod', payment_method),
      cash_received = coalesce((payload->>'cashReceived')::bigint, cash_received),
      change_amount = coalesce((payload->>'change')::bigint, change_amount),
      status = coalesce(payload->>'status', status),
      created_at = coalesce((payload->>'date')::timestamptz, created_at)
    where payload is not null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'stock_movements' and column_name = 'payload'
  ) then
    update public.stock_movements
    set
      product_id = coalesce(payload->>'productId', product_id),
      product_name = coalesce(payload->>'productName', product_name),
      type = coalesce(payload->>'type', type),
      qty = coalesce((payload->>'qty')::integer, qty),
      reason = coalesce(payload->>'reason', reason),
      date = coalesce((payload->>'date')::timestamptz, date),
      user_id = coalesce(payload->>'userId', user_id),
      user_name = coalesce(payload->>'userName', user_name),
      created_at = coalesce((payload->>'date')::timestamptz, created_at)
    where payload is not null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'expenses' and column_name = 'payload'
  ) then
    update public.expenses
    set
      date = coalesce((payload->>'date')::timestamptz, date),
      category = coalesce(payload->>'category', category),
      amount = coalesce((payload->>'amount')::bigint, amount),
      note = coalesce(payload->>'note', note),
      created_by_user_id = coalesce(payload->>'createdByUserId', created_by_user_id),
      created_by = coalesce(payload->>'createdBy', created_by),
      created_by_role = coalesce(payload->>'createdByRole', created_by_role),
      receipt_image = coalesce(payload->>'receiptImage', receipt_image),
      receipt_image_name = coalesce(payload->>'receiptImageName', receipt_image_name),
      created_at = coalesce((payload->>'createdAt')::timestamptz, (payload->>'date')::timestamptz, created_at)
    where payload is not null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'app_settings' and column_name = 'payload'
  ) then
    update public.app_settings
    set
      business_name = coalesce(payload->'businessProfile'->>'name', business_name),
      business_address = coalesce(payload->'businessProfile'->>'address', business_address),
      business_phone = coalesce(payload->'businessProfile'->>'phone', business_phone),
      business_logo = coalesce(payload->'businessProfile'->>'logo', business_logo),
      footer_note = coalesce(payload->'businessProfile'->>'footerNote', footer_note)
    where payload is not null;
  end if;
end $$;

alter table public.users drop column if exists payload;
alter table public.categories drop column if exists payload;
alter table public.products drop column if exists payload;
alter table public.transactions drop column if exists payload;
alter table public.stock_movements drop column if exists payload;
alter table public.expenses drop column if exists payload;
alter table public.app_settings drop column if exists payload;

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
drop trigger if exists shifts_set_updated_at on public.shifts;
create trigger shifts_set_updated_at before update on public.shifts for each row execute function public.set_updated_at();
drop trigger if exists raw_materials_set_updated_at on public.raw_materials;
create trigger raw_materials_set_updated_at before update on public.raw_materials for each row execute function public.set_updated_at();
drop trigger if exists raw_material_movements_set_updated_at on public.raw_material_movements;
create trigger raw_material_movements_set_updated_at before update on public.raw_material_movements for each row execute function public.set_updated_at();

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
alter table public.shifts enable row level security;
alter table public.raw_materials enable row level security;
alter table public.raw_material_movements enable row level security;

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
drop policy if exists "public access shifts" on public.shifts;
create policy "public access shifts" on public.shifts for all using (true) with check (true);
drop policy if exists "public access raw_materials" on public.raw_materials;
create policy "public access raw_materials" on public.raw_materials for all using (true) with check (true);
drop policy if exists "public access raw_material_movements" on public.raw_material_movements;
create policy "public access raw_material_movements" on public.raw_material_movements for all using (true) with check (true);

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
