# Architecture Overview

## System Architecture

The Water Pump Dashboard is built using Next.js 15 with the App Router, Supabase for backend services, and TypeScript for type safety.

## Project Structure

```
water-pump-dashboard/
├── app/                    # Next.js App Router pages and API routes
│   ├── (dashboard)/        # Dashboard routes
│   └── api/                # API routes
├── components/             # React components
├── lib/                    # Shared libraries and utilities
│   ├── api/               # API client code
│   ├── errors/            # Error handling
│   ├── logging/           # Logging utilities
│   ├── security/          # Security utilities
│   ├── services/          # Business logic services
│   ├── repositories/      # Data access layer
│   ├── validations/       # Zod validation schemas
│   └── config/            # Configuration
├── supabase/              # Database migrations and schema
├── tests/                 # Test files
└── docs/                  # Documentation

```

## Key Components

### API Layer
- **Routes**: Next.js API routes in `app/api/`
- **Middleware**: Authentication, validation, rate limiting
- **Error Handling**: Centralized error handling with custom error classes

### Service Layer
- **Services**: Business logic in `lib/services/`
- **Repositories**: Data access in `lib/repositories/`
- **Separation**: Clear separation between business logic and data access

### Validation
- **Zod Schemas**: Input validation in `lib/validations/`
- **Sanitization**: XSS prevention in `lib/security/sanitize.ts`
- **Type Safety**: TypeScript + Zod for runtime validation

### Security
- **Authentication**: Supabase Auth with RLS policies
- **Rate Limiting**: Per-user rate limiting on API routes
- **Security Headers**: CSP, HSTS, and other security headers
- **Input Sanitization**: DOMPurify for XSS prevention

### Database
- **Supabase**: PostgreSQL with Row Level Security
- **Migrations**: Versioned migrations in `supabase/migrations/`
- **RLS Policies**: Ownership-based access control

## Data Flow

1. **Client Request** → API Route
2. **Authentication** → Auth middleware validates user
3. **Validation** → Request validated with Zod schemas
4. **Rate Limiting** → Rate limit checked
5. **Service Layer** → Business logic executed
6. **Repository** → Data access via Supabase
7. **Response** → Formatted response with error handling

## Security Model

- **Authentication**: Supabase Auth (JWT tokens)
- **Authorization**: RLS policies at database level
- **Input Validation**: Zod schemas + sanitization
- **Rate Limiting**: Per-user limits on API routes
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.

## Testing Strategy

- **Unit Tests**: Vitest for utility functions and schemas
- **Integration Tests**: API route testing
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright for critical flows

## Deployment

- **CI/CD**: GitHub Actions for automated testing and deployment
- **Environment**: Environment variable validation
- **Monitoring**: Structured logging with Sentry integration (optional)
