-- Create recently_played table
create table if not exists public.recently_played (
  id uuid default gen_random_uuid() primary key,
  track_id uuid not null references public.music_files(id) on delete cascade,
  played_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.recently_played enable row level security;

create policy "Enable read access for all users"
  on public.recently_played for select
  using (true);

create policy "Enable insert for all users"
  on public.recently_played for insert
  with check (true);

create policy "Enable delete for all users"
  on public.recently_played for delete
  using (true); 