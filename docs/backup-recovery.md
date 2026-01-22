# Backup & Recovery Procedures

## Database Backups

### Supabase Automatic Backups

Supabase provides automatic daily backups for all projects. These backups are retained for:
- **Free tier**: 7 days
- **Pro tier**: 30 days
- **Team/Enterprise**: Custom retention

### Manual Backup

To create a manual backup:

1. **Via Supabase Dashboard**:
   - Navigate to Database → Backups
   - Click "Create Backup"
   - Download the backup file

2. **Via Supabase CLI**:
   ```bash
   supabase db dump -f backup.sql
   ```

### Backup Contents

Backups include:
- All table data
- Schema definitions
- Indexes and constraints
- RLS policies
- Functions and triggers

## Data Export

### Export Pump Data

```sql
-- Export all pump data
COPY (
  SELECT * FROM public.pumps
) TO '/path/to/pumps.csv' WITH CSV HEADER;

-- Export readings for a specific date range
COPY (
  SELECT * FROM public.pump_readings
  WHERE timestamp >= '2024-01-01'
  AND timestamp <= '2024-12-31'
) TO '/path/to/readings.csv' WITH CSV HEADER;
```

### Export via API

Use the API endpoints to export data programmatically:

```bash
# Get all pumps
curl -H "Authorization: Bearer $TOKEN" \
  https://api.example.com/api/pumps > pumps.json

# Get readings
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.example.com/api/pumps/{id}/readings?start_date=2024-01-01&end_date=2024-12-31" \
  > readings.json
```

## Recovery Procedures

### Restore from Backup

1. **Via Supabase Dashboard**:
   - Navigate to Database → Backups
   - Select a backup
   - Click "Restore"

2. **Via Supabase CLI**:
   ```bash
   supabase db reset
   psql -h your-db-host -U postgres -d postgres -f backup.sql
   ```

### Point-in-Time Recovery

Supabase Pro and above support point-in-time recovery:

1. Navigate to Database → Backups
2. Select "Point-in-Time Recovery"
3. Choose the recovery point
4. Confirm restoration

### Partial Recovery

To restore specific tables:

```sql
-- Restore pumps table
TRUNCATE TABLE public.pumps;
COPY public.pumps FROM '/path/to/pumps.csv' WITH CSV HEADER;

-- Restore readings
TRUNCATE TABLE public.pump_readings;
COPY public.pump_readings FROM '/path/to/readings.csv' WITH CSV HEADER;
```

## Disaster Recovery Plan

### 1. Database Failure

**Scenario**: Complete database loss

**Recovery Steps**:
1. Contact Supabase support immediately
2. Identify last known good backup
3. Restore from backup
4. Verify data integrity
5. Update application if schema changed

### 2. Data Corruption

**Scenario**: Corrupted data in specific tables

**Recovery Steps**:
1. Identify affected tables
2. Export unaffected data
3. Restore affected tables from backup
4. Re-import unaffected data
5. Verify data integrity

### 3. Accidental Deletion

**Scenario**: Data accidentally deleted

**Recovery Steps**:
1. Stop all write operations
2. Identify deletion time
3. Use point-in-time recovery if available
4. Or restore from most recent backup
5. Verify recovered data

## Backup Verification

### Verify Backup Integrity

```bash
# Check backup file
pg_restore --list backup.dump

# Test restore to temporary database
createdb test_restore
pg_restore -d test_restore backup.dump
```

### Regular Testing

- **Monthly**: Test restore procedure
- **Quarterly**: Full disaster recovery drill
- **Annually**: Review and update recovery procedures

## Best Practices

1. **Regular Backups**: Ensure daily backups are enabled
2. **Offsite Storage**: Keep backups in multiple locations
3. **Documentation**: Maintain up-to-date recovery procedures
4. **Testing**: Regularly test restore procedures
5. **Monitoring**: Monitor backup success/failure
6. **Retention**: Follow retention policies appropriate for your needs

## Monitoring

Set up alerts for:
- Backup failures
- Backup size anomalies
- Recovery time objectives (RTO)
- Recovery point objectives (RPO)

## Contact

For backup and recovery assistance:
- Supabase Support: support@supabase.com
- Emergency: Contact your system administrator
