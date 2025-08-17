-- Enable required extensions
create extension if not exists pgcrypto;

-- profiles
create table if not exists public.profiles (
  id uuid primary key,
  email text,
  display_name text,
  class text check (class in ('Fighter','Assassin','Healer/Mage','Tank','Ranger')),
  rank text not null default 'E' check (rank in ('E','D','C','B','A','S')),
  exp integer not null default 0,
  rank_locked_until timestamptz,
  goal_summary text,
  bio text,
  avatar_url text,
  qr_payload text,
  last_workout_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy if not exists "Profiles are self-access" on public.profiles for select using (auth.uid() = id);
create policy if not exists "Profiles self-update" on public.profiles for update using (auth.uid() = id);

-- questionnaire_questions
create table if not exists public.questionnaire_questions (
  id serial primary key,
  slug text unique,
  prompt text,
  choices jsonb,
  weight_keys jsonb,
  order_index int
);

-- questionnaire_responses
create table if not exists public.questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  question_id int references public.questionnaire_questions(id) on delete cascade,
  choice_key text,
  created_at timestamptz default now(),
  unique(user_id, question_id)
);

alter table public.questionnaire_responses enable row level security;
create policy if not exists "Own responses" on public.questionnaire_responses for select using (auth.uid() = user_id);
create policy if not exists "Own responses upsert" on public.questionnaire_responses for insert with check (auth.uid() = user_id);
create policy if not exists "Own responses update" on public.questionnaire_responses for update using (auth.uid() = user_id);

-- classes
create table if not exists public.classes (
  name text primary key,
  description text,
  workouts text
);

-- exp_log
create table if not exists public.exp_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  delta int,
  reason text,
  created_at timestamptz default now()
);

alter table public.exp_log enable row level security;
create policy if not exists "Own exp_log" on public.exp_log for select using (auth.uid() = user_id);
create policy if not exists "Own exp_log insert" on public.exp_log for insert with check (auth.uid() = user_id);

-- popups
create table if not exists public.popups (
  id uuid primary key default gen_random_uuid(),
  title text,
  venue text,
  city text,
  start_at timestamptz,
  end_at timestamptz,
  description text,
  signup_url text,
  created_at timestamptz default now()
);

alter table public.popups enable row level security;
create policy if not exists "Popups public read" on public.popups for select using (true);

-- messages (chat history)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('system','user','assistant')),
  content text,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;
create policy if not exists "Own messages" on public.messages for select using (auth.uid() = user_id);
create policy if not exists "Own messages insert" on public.messages for insert with check (auth.uid() = user_id);

-- Storage policy note (to apply via dashboard):
-- Create bucket 'avatars' public read; policy: users can insert/update paths prefixed with their uid.


