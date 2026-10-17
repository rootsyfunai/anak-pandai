-- Cross-device progress and password recovery.

create table if not exists progress (
  profile_id uuid primary key references profiles(id) on delete cascade,
  child_name text not null default 'Anak Saya',
  xp int not null default 0 check (xp >= 0),
  streak_days int not null default 0 check (streak_days >= 0),
  last_played_on date,
  completed_levels text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists password_resets (
  token_hash text primary key,
  profile_id uuid not null references profiles(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists password_resets_profile_idx on password_resets(profile_id);
create index if not exists password_resets_expiry_idx on password_resets(expires_at);
