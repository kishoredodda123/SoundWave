-- Create liked_tracks table
create table if not exists public.liked_tracks (
  id uuid default gen_random_uuid() primary key,
  track_id uuid not null references public.music_files(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(track_id)
);

-- Add RLS policies
alter table public.liked_tracks enable row level security;

create policy "Enable read access for all users"
  on public.liked_tracks for select
  using (true);

create policy "Enable insert for all users"
  on public.liked_tracks for insert
  with check (true);

create policy "Enable delete for all users"
  on public.liked_tracks for delete
  using (true); 