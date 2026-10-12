create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  subject varchar(50) not null check (char_length(trim(subject)) between 1 and 50),
  minutes integer not null check (minutes between 1 and 480),
  feedback text not null,
  created_at timestamptz not null default now()
);

alter table public.study_sessions enable row level security;

grant select, insert, delete on table public.study_sessions to service_role;

comment on table public.study_sessions is
  'Study sessions written by the private Express API through a Supabase secret key.';
