-- Create the farms table
create table farms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  geometry jsonb not null,
  risk_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) recommended basic policy
alter table farms enable row level security;

-- Create a policy that allows anyone to read/write for this demo (adjust for production)
create policy "Enable all access for all users" on farms
for all using (true) with check (true);
