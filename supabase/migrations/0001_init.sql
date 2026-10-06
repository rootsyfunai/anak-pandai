-- Anak Pandai — core schema
-- Age bands: 1-3 (baby), 4-6 (KSPK), 7-9 (KSSR Tahap 1), 10-12 (KSSR Tahap 2)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- profiles
-- One row per parent account. Mirrors auth.users.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- children
create table public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  birth_year int not null check (birth_year between 2000 and 2100),
  avatar text not null default 'owl',
  xp int not null default 0,
  streak_days int not null default 0,
  last_played_on date,
  created_at timestamptz not null default now()
);

create index children_parent_idx on public.children (parent_id);

-- ---------------------------------------------------------------- affiliates
create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  code text not null unique,
  display_name text not null,
  email text not null,
  commission_rate numeric(4, 3) not null default 0.500
    check (commission_rate >= 0 and commission_rate <= 1),
  payout_method text,
  payout_details text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index affiliates_code_idx on public.affiliates (lower(code));

-- ---------------------------------------------------------------- orders
-- Manual QR flow: parent pays, uploads proof, admin approves.
create type order_status as enum ('pending', 'approved', 'rejected');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  amount_myr numeric(10, 2) not null default 50.00,
  status order_status not null default 'pending',
  proof_path text,
  reference_note text,
  affiliate_id uuid references public.affiliates (id) on delete set null,
  affiliate_code text,
  commission_myr numeric(10, 2),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create index orders_status_idx on public.orders (status);
create index orders_parent_idx on public.orders (parent_id);
create index orders_affiliate_idx on public.orders (affiliate_id);

-- ---------------------------------------------------------------- entitlements
-- Created when an order is approved. Grants app access.
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

create unique index entitlements_active_parent_idx
  on public.entitlements (parent_id)
  where revoked_at is null;

-- ---------------------------------------------------------------- game results
create table public.game_results (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  game_id text not null,
  subject text not null,
  age_band text not null,
  score int not null default 0,
  total int not null default 0,
  xp_earned int not null default 0,
  duration_seconds int,
  played_at timestamptz not null default now()
);

create index game_results_child_idx on public.game_results (child_id, played_at desc);

-- ---------------------------------------------------------------- RLS
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.affiliates enable row level security;
alter table public.orders enable row level security;
alter table public.entitlements enable row level security;
alter table public.game_results enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- profiles: own row, or admin
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- children: parent owns them
create policy children_select_own on public.children
  for select using (parent_id = auth.uid() or public.is_admin());
create policy children_insert_own on public.children
  for insert with check (parent_id = auth.uid());
create policy children_update_own on public.children
  for update using (parent_id = auth.uid()) with check (parent_id = auth.uid());
create policy children_delete_own on public.children
  for delete using (parent_id = auth.uid());

-- affiliates: an affiliate sees own row; admin sees all
create policy affiliates_select_own on public.affiliates
  for select using (profile_id = auth.uid() or public.is_admin());
create policy affiliates_admin_write on public.affiliates
  for all using (public.is_admin()) with check (public.is_admin());

-- orders: parent sees own; admin sees all. Parents may create + attach proof.
create policy orders_select_own on public.orders
  for select using (parent_id = auth.uid() or public.is_admin());
create policy orders_insert_own on public.orders
  for insert with check (parent_id = auth.uid());
create policy orders_update_own_pending on public.orders
  for update using (parent_id = auth.uid() and status = 'pending')
  with check (parent_id = auth.uid());
create policy orders_admin_update on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- entitlements: parent reads own; only admin writes
create policy entitlements_select_own on public.entitlements
  for select using (parent_id = auth.uid() or public.is_admin());
create policy entitlements_admin_write on public.entitlements
  for all using (public.is_admin()) with check (public.is_admin());

-- game_results: parent reads/writes results for own children
create policy game_results_select_own on public.game_results
  for select using (
    exists (
      select 1 from public.children c
      where c.id = game_results.child_id and c.parent_id = auth.uid()
    ) or public.is_admin()
  );
create policy game_results_insert_own on public.game_results
  for insert with check (
    exists (
      select 1 from public.children c
      where c.id = game_results.child_id and c.parent_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------- new user trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- commission
-- 50% of the order amount, computed when an order is approved.
create or replace function public.set_order_commission()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'approved' and new.affiliate_id is not null then
    new.commission_myr := round(
      new.amount_myr * coalesce(
        (select a.commission_rate from public.affiliates a where a.id = new.affiliate_id),
        0.500
      ),
      2
    );
  elsif new.status <> 'approved' then
    new.commission_myr := null;
  end if;
  return new;
end;
$$;

create trigger orders_set_commission
  before insert or update of status, affiliate_id, amount_myr on public.orders
  for each row execute function public.set_order_commission();

-- ---------------------------------------------------------------- storage
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

create policy payment_proofs_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy payment_proofs_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
