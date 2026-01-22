-- Water Pump Dashboard Schema for Supabase

-- Pumps: Store pump information
create table if not exists public.pumps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  api_endpoint text,
  api_key text,
  status text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create index if not exists idx_pumps_status on public.pumps(status);
create index if not exists idx_pumps_location on public.pumps(latitude, longitude);

-- Pump readings: time-series metrics from the pump API
create table if not exists public.pump_readings (
  id uuid primary key default gen_random_uuid(),
  pump_id uuid not null references public.pumps(id) on delete cascade,
  timestamp timestamptz not null default now(),
  pressure numeric(10, 2),
  flow_rate numeric(10, 2),
  temperature numeric(10, 2),
  status text not null default 'unknown',
  power_consumption numeric(10, 2),
  created_at timestamptz not null default now()
);

create index if not exists idx_pump_readings_timestamp on public.pump_readings(timestamp desc);
create index if not exists idx_pump_readings_status on public.pump_readings(status);
create index if not exists idx_pump_readings_pump_id on public.pump_readings(pump_id, timestamp desc);

-- Pump alerts: alert/notification system
create table if not exists public.pump_alerts (
  id uuid primary key default gen_random_uuid(),
  pump_id uuid not null references public.pumps(id) on delete cascade,
  severity text not null check (severity in ('critical', 'warning', 'info')),
  message text not null,
  pump_reading_id uuid references public.pump_readings(id) on delete set null,
  acknowledged boolean not null default false,
  acknowledged_at timestamptz,
  acknowledged_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pump_alerts_acknowledged on public.pump_alerts(acknowledged, created_at desc);
create index if not exists idx_pump_alerts_severity on public.pump_alerts(severity);
create index if not exists idx_pump_alerts_pump_id on public.pump_alerts(pump_id, created_at desc);

-- Pump config: pump settings and API configuration (per-pump)
create table if not exists public.pump_config (
  id uuid primary key default gen_random_uuid(),
  pump_id uuid not null references public.pumps(id) on delete cascade,
  api_endpoint text,
  api_key text,
  poll_interval integer not null default 30,
  alert_thresholds jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  unique(pump_id)
);

create index if not exists idx_pump_config_pump_id on public.pump_config(pump_id);

-- Pump controls: control command history
create table if not exists public.pump_controls (
  id uuid primary key default gen_random_uuid(),
  pump_id uuid not null references public.pumps(id) on delete cascade,
  command_type text not null,
  command_value text,
  status text not null default 'pending',
  executed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pump_controls_status on public.pump_controls(status, created_at desc);
create index if not exists idx_pump_controls_type on public.pump_controls(command_type);
create index if not exists idx_pump_controls_pump_id on public.pump_controls(pump_id, created_at desc);

-- Enable Row Level Security
alter table public.pumps enable row level security;
alter table public.pump_readings enable row level security;
alter table public.pump_alerts enable row level security;
alter table public.pump_config enable row level security;
alter table public.pump_controls enable row level security;

-- RLS Policies: authenticated users can access all data
do $$
begin
  -- Pumps policies
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'pumps' and policyname = 'pumps_auth_all') then
    create policy pumps_auth_all on public.pumps
      for all using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;

  -- Pump readings policies
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'pump_readings' and policyname = 'pump_readings_auth_all') then
    create policy pump_readings_auth_all on public.pump_readings
      for all using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;

  -- Pump alerts policies
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'pump_alerts' and policyname = 'pump_alerts_auth_all') then
    create policy pump_alerts_auth_all on public.pump_alerts
      for all using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;

  -- Pump config policies
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'pump_config' and policyname = 'pump_config_auth_all') then
    create policy pump_config_auth_all on public.pump_config
      for all using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;

  -- Pump controls policies
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'pump_controls' and policyname = 'pump_controls_auth_all') then
    create policy pump_controls_auth_all on public.pump_controls
      for all using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;
end$$;

-- Enable Realtime for pumps, pump_readings and pump_alerts
-- Note: This may fail if tables are already in the publication, which is fine
do $$
begin
  alter publication supabase_realtime add table public.pumps;
exception when others then
  -- Table already in publication, ignore
  null;
end$$;

do $$
begin
  alter publication supabase_realtime add table public.pump_readings;
exception when others then
  -- Table already in publication, ignore
  null;
end$$;

do $$
begin
  alter publication supabase_realtime add table public.pump_alerts;
exception when others then
  -- Table already in publication, ignore
  null;
end$$;

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for pump_config
drop trigger if exists update_pump_config_updated_at on public.pump_config;
create trigger update_pump_config_updated_at
  before update on public.pump_config
  for each row
  execute function update_updated_at_column();

-- Trigger for pumps
drop trigger if exists update_pumps_updated_at on public.pumps;
create trigger update_pumps_updated_at
  before update on public.pumps
  for each row
  execute function update_updated_at_column();
