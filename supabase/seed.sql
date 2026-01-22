-- Seed data for development
-- This file contains sample data for testing and development

-- Note: This seed file should only be run in development environments
-- In production, data should be added through the application

-- Insert sample pumps (only if table is empty)
do $$
declare
  pump_count integer;
begin
  select count(*) into pump_count from public.pumps;
  
  if pump_count = 0 then
    -- Sample pump 1
    insert into public.pumps (name, location, latitude, longitude, status)
    values (
      'Main Irrigation Pump',
      'Orlando, FL',
      28.5383,
      -81.3792,
      'running'
    );

    -- Sample pump 2
    insert into public.pumps (name, location, latitude, longitude, status)
    values (
      'North Field Pump',
      'Tampa, FL',
      27.9506,
      -82.4572,
      'running'
    );

    -- Sample pump 3
    insert into public.pumps (name, location, latitude, longitude, status)
    values (
      'South Zone Pump',
      'Miami, FL',
      25.7617,
      -80.1918,
      'stopped'
    );
  end if;
end $$;

-- Insert sample pump readings (only if table is empty)
do $$
declare
  reading_count integer;
  pump_id_1 uuid;
  pump_id_2 uuid;
begin
  select count(*) into reading_count from public.pump_readings;
  select id into pump_id_1 from public.pumps limit 1;
  select id into pump_id_2 from public.pumps offset 1 limit 1;
  
  if reading_count = 0 and pump_id_1 is not null then
    -- Insert readings for the last 7 days
    for i in 0..168 loop
      insert into public.pump_readings (
        pump_id,
        timestamp,
        pressure,
        flow_rate,
        temperature,
        status,
        power_consumption
      )
      values (
        pump_id_1,
        now() - (i || ' hours')::interval,
        40 + random() * 20,
        20 + random() * 10,
        70 + random() * 10,
        'running',
        1000 + random() * 500
      );

      if pump_id_2 is not null and i % 2 = 0 then
        insert into public.pump_readings (
          pump_id,
          timestamp,
          pressure,
          flow_rate,
          temperature,
          status,
          power_consumption
        )
        values (
          pump_id_2,
          now() - (i || ' hours')::interval,
          35 + random() * 15,
          15 + random() * 8,
          65 + random() * 8,
          'running',
          800 + random() * 400
        );
      end if;
    end loop;
  end if;
end $$;

-- Insert sample pump configs
do $$
declare
  config_count integer;
  pump_id uuid;
begin
  for pump_id in select id from public.pumps loop
    select count(*) into config_count from public.pump_config where pump_config.pump_id = pump_id;
    
    if config_count = 0 then
      insert into public.pump_config (
        pump_id,
        poll_interval,
        alert_thresholds
      )
      values (
        pump_id,
        30,
        jsonb_build_object(
          'pressure_min', 20,
          'pressure_max', 100,
          'flow_rate_min', 5,
          'flow_rate_max', 50,
          'temperature_max', 120
        )
      );
    end if;
  end loop;
end $$;
