# API Integration Guide

This dashboard integrates with irrigation pump control systems. The API layer is designed to be flexible and adaptable to different API formats.

## Supported Systems

### 1. Virtual SCADA
Virtual SCADA is a SCADA (Supervisory Control and Data Acquisition) system for monitoring and controlling irrigation systems.

**Integration Notes:**
- Virtual SCADA typically provides REST API endpoints
- May use different authentication methods (API keys, tokens, basic auth)
- Field names may vary (e.g., `Pressure` vs `pressure`, `PSI` vs `psi`)

### 2. Hunter's Centralus & Hydrawise
Hunter's cloud-based irrigation controller platform with API access for remote monitoring and control.

**Integration Notes:**
- Hydrawise uses OAuth 2.0 for authentication
- API endpoints follow REST conventions
- May require zone IDs or controller IDs for operations
- Field naming may differ from standard format

## Configuration

### Step 1: Get API Credentials

**For Virtual SCADA:**
1. Contact your Virtual SCADA administrator for API endpoint and credentials
2. Obtain API key or authentication token
3. Note the base API URL

**For Hydrawise/Centralus:**
1. Log into Hydrawise account
2. Navigate to API settings
3. Generate API key or OAuth credentials
4. Note the API base URL (typically `https://api.hydrawise.com/api/v1`)

### Step 2: Configure in Dashboard

1. Navigate to **Settings** in the dashboard
2. Enter your API endpoint URL
3. Enter your API key or token
4. Set poll interval (recommended: 30-60 seconds for irrigation systems)
5. Save configuration

## API Endpoint Mapping

The dashboard expects these endpoints, but you may need to customize the mapping based on your system:

### Status Endpoint
```
GET {api_endpoint}/status
```

**Expected Response Fields:**
- `pressure` (PSI) - Water pressure
- `flow_rate` (GPM) - Flow rate in gallons per minute
- `temperature` (°F) - Pump temperature
- `status` - Pump status (running, stopped, error, etc.)
- `power_consumption` (W) - Power usage

**Customization:**
If your API uses different field names, edit `lib/api/pumpApi.ts` in the `pollPumpApi` function to map your fields:

```typescript
const mappedData = {
  pressure: data.pressure ?? data.Pressure ?? data.psi ?? null,
  flow_rate: data.flow_rate ?? data.FlowRate ?? data.gpm ?? null,
  // ... add your system's field names here
};
```

### Control Endpoint
```
POST {api_endpoint}/control
```

**Request Body:**
```json
{
  "command": "start" | "stop" | "set_pressure",
  "value": "optional_value"
}
```

**Customization:**
Adjust the request format in `sendPumpCommand` function based on your API requirements.

## System-Specific Customizations

### Virtual SCADA
- May require different authentication headers
- Could use different endpoint paths
- May return data in different format (XML, different JSON structure)

### Hydrawise
- Requires zone/controller IDs for some operations
- May use different command structure
- OAuth token refresh may be needed

## Testing the Integration

1. Configure API endpoint and credentials in Settings
2. Check the browser console for API call logs
3. Verify data appears in the Dashboard
4. Test control commands (start/stop pump)
5. Monitor alerts to ensure thresholds are working

## Troubleshooting

**No data appearing:**
- Check API endpoint URL is correct
- Verify API key/token is valid
- Check browser console for errors
- Ensure API endpoint is accessible from your network

**Control commands not working:**
- Verify your API supports remote control
- Check command format matches your API requirements
- Review API documentation for required parameters

**Authentication errors:**
- Verify API key/token hasn't expired
- Check authentication method matches your system
- For Hydrawise, may need OAuth token refresh

## Next Steps

Once basic integration is working:
1. Customize field mappings for your specific API format
2. Add system-specific features (zone control for Hydrawise, etc.)
3. Configure alert thresholds appropriate for irrigation systems
4. Set up automated polling (server-side cron job) for continuous monitoring
