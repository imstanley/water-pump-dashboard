-- Add database constraints for data integrity

-- Add check constraints for pump status
alter table public.pumps
  drop constraint if exists pumps_status_check;

alter table public.pumps
  add constraint pumps_status_check
  check (status in ('running', 'stopped', 'error', 'unknown'));

-- Add check constraints for pump reading status
alter table public.pump_readings
  drop constraint if exists pump_readings_status_check;

alter table public.pump_readings
  add constraint pump_readings_status_check
  check (status in ('running', 'stopped', 'error', 'unknown'));

-- Add check constraints for pump control status
alter table public.pump_controls
  drop constraint if exists pump_controls_status_check;

alter table public.pump_controls
  add constraint pump_controls_status_check
  check (status in ('pending', 'executed', 'failed', 'cancelled'));

-- Add check constraints for pump control command type
alter table public.pump_controls
  drop constraint if exists pump_controls_command_type_check;

alter table public.pump_controls
  add constraint pump_controls_command_type_check
  check (command_type in ('start', 'stop', 'set_pressure', 'set_flow_rate'));

-- Add constraints for numeric values
alter table public.pump_readings
  drop constraint if exists pump_readings_pressure_check;

alter table public.pump_readings
  add constraint pump_readings_pressure_check
  check (pressure is null or (pressure >= 0 and pressure <= 1000));

alter table public.pump_readings
  drop constraint if exists pump_readings_flow_rate_check;

alter table public.pump_readings
  add constraint pump_readings_flow_rate_check
  check (flow_rate is null or (flow_rate >= 0 and flow_rate <= 1000));

alter table public.pump_readings
  drop constraint if exists pump_readings_temperature_check;

alter table public.pump_readings
  add constraint pump_readings_temperature_check
  check (temperature is null or (temperature >= -50 and temperature <= 300));

alter table public.pump_readings
  drop constraint if exists pump_readings_power_consumption_check;

alter table public.pump_readings
  add constraint pump_readings_power_consumption_check
  check (power_consumption is null or (power_consumption >= 0 and power_consumption <= 100000));

-- Add constraint for poll interval
alter table public.pump_config
  drop constraint if exists pump_config_poll_interval_check;

alter table public.pump_config
  add constraint pump_config_poll_interval_check
  check (poll_interval >= 5 and poll_interval <= 3600);

-- Add constraint for coordinates
alter table public.pumps
  drop constraint if exists pumps_latitude_check;

alter table public.pumps
  add constraint pumps_latitude_check
  check (latitude is null or (latitude >= -90 and latitude <= 90));

alter table public.pumps
  drop constraint if exists pumps_longitude_check;

alter table public.pumps
  add constraint pumps_longitude_check
  check (longitude is null or (longitude >= -180 and longitude <= 180));
