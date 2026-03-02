-- Stores clients appointments
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  phone text not null,
  appointment_time timestamptz not null,
  timezone text default 'Europe/London',
  status text default 'scheduled',
  created_at timestamptz default now()
);

-- One row per phone call

create table if not exists call_sessions (
  call_sid text primary key,
  from_number text,
  to_number text,
  status text default 'active',
  last_intent text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Message history per call

create table if not exists call_messages (
  id bigserial primary key,
  call_sid text references call_sessions(call_sid) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists idx_call_messages_call_sid on call_messages(call_sid);