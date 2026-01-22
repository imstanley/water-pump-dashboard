-- Add database triggers for data validation and integrity

-- Function to validate alert thresholds
create or replace function validate_alert_thresholds()
returns trigger as $$
begin
  -- Validate that min values are less than max values
  if (new.alert_thresholds->>'pressure_min')::numeric is not null
     and (new.alert_thresholds->>'pressure_max')::numeric is not null
     and (new.alert_thresholds->>'pressure_min')::numeric > (new.alert_thresholds->>'pressure_max')::numeric then
    raise exception 'pressure_min must be less than or equal to pressure_max';
  end if;

  if (new.alert_thresholds->>'flow_rate_min')::numeric is not null
     and (new.alert_thresholds->>'flow_rate_max')::numeric is not null
     and (new.alert_thresholds->>'flow_rate_min')::numeric > (new.alert_thresholds->>'flow_rate_max')::numeric then
    raise exception 'flow_rate_min must be less than or equal to flow_rate_max';
  end if;

  return new;
end;
$$ language plpgsql;

-- Trigger to validate alert thresholds
drop trigger if exists validate_pump_config_thresholds on public.pump_config;
create trigger validate_pump_config_thresholds
  before insert or update on public.pump_config
  for each row
  execute function validate_alert_thresholds();

-- Function to automatically create alerts based on readings
create or replace function check_reading_thresholds()
returns trigger as $$
declare
  config_record public.pump_config%rowtype;
  alert_severity text;
  alert_message text;
begin
  -- Get pump config
  select * into config_record
  from public.pump_config
  where pump_id = new.pump_id;

  -- If no config, skip
  if not found then
    return new;
  end if;

  -- Check pressure thresholds
  if new.pressure is not null then
    if (config_record.alert_thresholds->>'pressure_min')::numeric is not null
       and new.pressure < (config_record.alert_thresholds->>'pressure_min')::numeric then
      alert_severity := 'critical';
      alert_message := format('Pressure below minimum threshold: %.2f (min: %.2f)',
        new.pressure,
        (config_record.alert_thresholds->>'pressure_min')::numeric
      );
    elsif (config_record.alert_thresholds->>'pressure_max')::numeric is not null
       and new.pressure > (config_record.alert_thresholds->>'pressure_max')::numeric then
      alert_severity := 'critical';
      alert_message := format('Pressure above maximum threshold: %.2f (max: %.2f)',
        new.pressure,
        (config_record.alert_thresholds->>'pressure_max')::numeric
      );
    end if;
  end if;

  -- Check flow rate thresholds
  if new.flow_rate is not null then
    if (config_record.alert_thresholds->>'flow_rate_min')::numeric is not null
       and new.flow_rate < (config_record.alert_thresholds->>'flow_rate_min')::numeric then
      alert_severity := 'warning';
      alert_message := format('Flow rate below minimum threshold: %.2f (min: %.2f)',
        new.flow_rate,
        (config_record.alert_thresholds->>'flow_rate_min')::numeric
      );
    elsif (config_record.alert_thresholds->>'flow_rate_max')::numeric is not null
       and new.flow_rate > (config_record.alert_thresholds->>'flow_rate_max')::numeric then
      alert_severity := 'warning';
      alert_message := format('Flow rate above maximum threshold: %.2f (max: %.2f)',
        new.flow_rate,
        (config_record.alert_thresholds->>'flow_rate_max')::numeric
      );
    end if;
  end if;

  -- Check temperature threshold
  if new.temperature is not null then
    if (config_record.alert_thresholds->>'temperature_max')::numeric is not null
       and new.temperature > (config_record.alert_thresholds->>'temperature_max')::numeric then
      alert_severity := 'critical';
      alert_message := format('Temperature above maximum threshold: %.2f (max: %.2f)',
        new.temperature,
        (config_record.alert_thresholds->>'temperature_max')::numeric
      );
    end if;
  end if;

  -- Create alert if threshold exceeded
  if alert_message is not null then
    insert into public.pump_alerts (
      pump_id,
      severity,
      message,
      pump_reading_id
    )
    values (
      new.pump_id,
      alert_severity,
      alert_message,
      new.id
    );
  end if;

  return new;
end;
$$ language plpgsql;

-- Trigger to check thresholds on new readings
drop trigger if exists check_pump_reading_thresholds on public.pump_readings;
create trigger check_pump_reading_thresholds
  after insert on public.pump_readings
  for each row
  execute function check_reading_thresholds();
