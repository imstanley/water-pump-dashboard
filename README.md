# Irrigation Pump Dashboard

A Next.js + Supabase dashboard for monitoring and controlling irrigation pump systems via API. Built for integration with **Virtual SCADA** and **Hunter's Centralus & Hydrawise** systems. Features real-time monitoring, historical data analysis, alert management, and remote pump control.

## Features

- **Real-time Monitoring**: Live metrics with Supabase Realtime subscriptions
- **Historical Data**: View and analyze pump readings over time with interactive charts
- **Alert System**: Automatic alerts based on configurable thresholds
- **Pump Controls**: Remote start/stop and configuration via API
- **Authentication**: Secure Supabase Auth with protected routes
- **Mobile Responsive**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Authentication
- **Styling**: Tailwind CSS + custom UI components
- **Charts**: Recharts
- **TypeScript**: Strict mode enabled

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account and project

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Set up Supabase database:
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - In the SQL Editor, run the contents of `supabase/schema.sql`
   - This will create all necessary tables, indexes, RLS policies, and Realtime subscriptions

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
water-pump-dashboard/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── dashboard/       # Main dashboard
│   │   ├── history/         # Historical data
│   │   ├── alerts/          # Alerts management
│   │   ├── settings/        # Configuration
│   │   └── layout.tsx       # Dashboard layout
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page redirect
├── components/              # React components
│   ├── ui/                  # Base UI components
│   ├── dashboard/           # Dashboard components
│   ├── history/             # History components
│   ├── alerts/              # Alert components
│   └── settings/            # Settings components
├── hooks/                   # Custom React hooks
│   ├── usePumpMetrics.ts    # Real-time metrics
│   ├── usePumpHistory.ts    # Historical data
│   └── usePumpAlerts.ts     # Alerts management
├── lib/                     # Utility libraries
│   ├── supabase/            # Supabase clients
│   └── api/                 # Pump API integration
├── types/                   # TypeScript types
│   └── pump.ts              # Pump-related types
└── supabase/                # Database schema
    └── schema.sql           # SQL schema file
```

## Configuration

### API Configuration

1. Navigate to Settings in the dashboard
2. Enter your water pump API endpoint URL
3. Enter your API key (if required)
4. Set the poll interval (how often to check for new readings)
5. Save the configuration

### Alert Thresholds

In Settings, configure alert thresholds:
- **Minimum/Maximum Pressure**: Alert when pressure goes outside these bounds
- **Minimum/Maximum Flow Rate**: Alert when flow rate goes outside these bounds
- **Maximum Temperature**: Alert when temperature exceeds this value

## API Integration

The dashboard integrates with:
- **Virtual SCADA** - SCADA system for irrigation monitoring
- **Hunter's Centralus & Hydrawise** - Cloud-based irrigation controller platform

### Supported Systems

The API integration layer is flexible and can be adapted to work with either system's API format. Configure your specific API endpoint and authentication method in Settings.

### Expected API Endpoints

#### Get Pump Status
```
GET {api_endpoint}/status
```

Expected response format:
```json
{
  "pressure": 45.5,
  "flow_rate": 25.3,
  "temperature": 75.2,
  "status": "running",
  "power_consumption": 1200.0
}
```

**Note:** Actual response format may vary by system (Virtual SCADA vs Hydrawise). The API layer can be customized to map different field names.

#### Send Control Command
```
POST {api_endpoint}/control
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "command": "start" | "stop" | "set_pressure",
  "value": "optional_value"
}
```

### System-Specific Configuration

- **Virtual SCADA**: Configure your SCADA system API endpoint and credentials
- **Hydrawise/Centralus**: Use Hunter's API endpoint with your account credentials

See the API integration code in `lib/api/pumpApi.ts` for details on customizing the request/response mapping for your specific system.

## Database Schema

The application uses four main tables:

- **pump_readings**: Time-series metrics from the pump
- **pump_alerts**: Alert/notification records
- **pump_config**: API configuration and alert thresholds
- **pump_controls**: Command execution history

See `supabase/schema.sql` for the complete schema with indexes and RLS policies.

## Real-time Updates

The dashboard uses Supabase Realtime subscriptions to automatically update:
- Dashboard metrics when new readings arrive
- Alert list when new alerts are created
- Charts with live data

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables

Set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional, for server-side operations)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

Proprietary - All rights reserved
