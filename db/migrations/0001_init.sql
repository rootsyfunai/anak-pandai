create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  token_hash text primary key,
  profile_id uuid not null references profiles(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists sessions_profile_idx on sessions(profile_id);

create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  code text not null unique,
  display_name text not null,
  email text not null,
  commission_rate numeric(4,3) not null default 0.500,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references profiles(id) on delete cascade,
  amount_myr numeric(10,2) not null default 50.00,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  proof_path text,
  reference_note text,
  affiliate_id uuid references affiliates(id) on delete set null,
  affiliate_code text,
  commission_myr numeric(10,2),
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_idx on orders(created_at desc);

create table if not exists entitlements (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references profiles(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);
create unique index if not exists entitlements_active_parent_idx
  on entitlements(parent_id) where revoked_at is null;

create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  birth_year int not null,
  avatar text not null default 'owl',
  xp int not null default 0,
  streak_days int not null default 0,
  last_played_on date,
  created_at timestamptz not null default now()
);

create table if not exists game_results (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  game_id text not null,
  subject text not null,
  age_band text not null,
  score int not null default 0,
  total int not null default 0,
  xp_earned int not null default 0,
  duration_seconds int,
  played_at timestamptz not null default now()
);
