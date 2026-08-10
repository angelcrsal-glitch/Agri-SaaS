-- Enable PostGIS extension for geographical data
create extension if not exists postgis;

-- 1. USERS Table
-- Extends Supabase Auth (handled automatically by Supabase usually, but good to have a profile table)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  role text default 'farmer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 2. FARMS Table
-- Stores farm metadata and geographical boundaries (Polygon)
create table public.farms (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  crop_type text,
  -- Geography column for Polygon (SRID 4326 is standard GPS)
  location geography(Polygon, 4326), 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.farms enable row level security;

-- 3. SENSOR_DATA Table
-- Stores the processed metrics (Time Series data)
create table public.sensor_data (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- The 3 critical metrics
  water_risk_score float check (water_risk_score >= 0 and water_risk_score <= 100), -- 0-100 scale
  ndvi_value float check (ndvi_value >= -1 and ndvi_value <= 1), -- Standard NDVI range
  climate_alert_level text check (climate_alert_level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  
  raw_data jsonb -- To store extra API response data/metadata if needed
);

-- Index for faster time-series queries
create index idx_sensor_data_farm_date on public.sensor_data(farm_id, recorded_at desc);

-- 4. ALERTS Table
-- Notifications generated for the user
create table public.alerts (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  severity text check (severity in ('INFO', 'WARNING', 'CRITICAL')),
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- POLICIES (Simple examples)
-- Users can only see their own farms
create policy "Users can view own farms" on public.farms
  for select using (auth.uid() = user_id);

create policy "Users can insert own farms" on public.farms
  for insert with check (auth.uid() = user_id);
