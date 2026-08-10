-- Create fields table for GeoJSON persistence
create table if not exists fields (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null, -- Assumes Supabase Auth is active, or we might need to relax this for MVP
  name text not null,
  polygon jsonb not null, -- Stores the GeoJSON coordinates
  crop_type text default 'generic',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security) if needed, but for MVP we might keep it open or simple
alter table fields enable row level security;

create policy "Users can view their own fields"
  on fields for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own fields"
  on fields for insert
  with check ( auth.uid() = user_id );
