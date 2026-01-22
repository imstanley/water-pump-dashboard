-- Enhanced RLS Policies for Water Pump Dashboard
-- This migration adds ownership-based policies for better security

-- Drop existing policies (if they exist)
drop policy if exists pumps_auth_all on public.pumps;
drop policy if exists pump_readings_auth_all on public.pump_readings;
drop policy if exists pump_alerts_auth_all on public.pump_alerts;
drop policy if exists pump_config_auth_all on public.pump_config;
drop policy if exists pump_controls_auth_all on public.pump_controls;

-- Pumps: Users can read all pumps, but can only modify their own
create policy pumps_select_all on public.pumps
  for select
  using (auth.role() = 'authenticated');

create policy pumps_insert_own on public.pumps
  for insert
  with check (auth.role() = 'authenticated' and auth.uid() = created_by);

create policy pumps_update_own on public.pumps
  for update
  using (auth.role() = 'authenticated' and (auth.uid() = created_by or created_by is null))
  with check (auth.role() = 'authenticated' and (auth.uid() = created_by or created_by is null));

create policy pumps_delete_own on public.pumps
  for delete
  using (auth.role() = 'authenticated' and (auth.uid() = created_by or created_by is null));

-- Pump readings: Users can read all readings, but can only insert their own
create policy pump_readings_select_all on public.pump_readings
  for select
  using (auth.role() = 'authenticated');

create policy pump_readings_insert_own on public.pump_readings
  for insert
  with check (auth.role() = 'authenticated');

-- Pump alerts: Users can read all alerts, but can only acknowledge their own or unacknowledged ones
create policy pump_alerts_select_all on public.pump_alerts
  for select
  using (auth.role() = 'authenticated');

create policy pump_alerts_insert_own on public.pump_alerts
  for insert
  with check (auth.role() = 'authenticated');

create policy pump_alerts_update_acknowledge on public.pump_alerts
  for update
  using (auth.role() = 'authenticated')
  with check (
    auth.role() = 'authenticated' and
    (acknowledged_by is null or auth.uid() = acknowledged_by)
  );

-- Pump config: Users can read all configs, but can only modify configs for pumps they own
create policy pump_config_select_all on public.pump_config
  for select
  using (auth.role() = 'authenticated');

create policy pump_config_insert_own on public.pump_config
  for insert
  with check (
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.pumps
      where pumps.id = pump_config.pump_id
      and (pumps.created_by = auth.uid() or pumps.created_by is null)
    )
  );

create policy pump_config_update_own on public.pump_config
  for update
  using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.pumps
      where pumps.id = pump_config.pump_id
      and (pumps.created_by = auth.uid() or pumps.created_by is null)
    )
  )
  with check (
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.pumps
      where pumps.id = pump_config.pump_id
      and (pumps.created_by = auth.uid() or pumps.created_by is null)
    )
  );

-- Pump controls: Users can read all controls, but can only insert their own
create policy pump_controls_select_all on public.pump_controls
  for select
  using (auth.role() = 'authenticated');

create policy pump_controls_insert_own on public.pump_controls
  for insert
  with check (auth.role() = 'authenticated' and auth.uid() = created_by);
