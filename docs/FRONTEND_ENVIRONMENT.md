# Eventify Frontend Environment Configuration

## Overview

Environment variables control mock mode, API base URL, and Supabase connectivity. All frontend-safe variables use the `VITE_` prefix and are accessible through `src/config/env.ts`.

---

## Setup

Copy `.env.example` to `.env` in the `frontend/` directory:

```bash
cp frontend/.env.example frontend/.env
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_USE_MOCKS` | `true` | Set to `true` to use mock data; `false` for real backend |
| `VITE_API_BASE_URL` | `/api` | Backend API base URL (only used when mock mode is off) |
| `VITE_SUPABASE_URL` | `` | Supabase project URL (for future auth integration) |
| `VITE_SUPABASE_ANON_KEY` | `` | Supabase anon key (frontend-safe only) |
| `VITE_APP_NAME` | `Eventify` | Application display name |
| `VITE_APP_VERSION` | `1.0.0` | Application version |

## Mock Mode

When `VITE_USE_MOCKS=true` (default):
- All API calls are intercepted by `src/services/mock/mockAdapter.ts`
- Mock data lives in `src/services/mock/mockData.ts`
- Network delay of ~200ms is simulated
- No backend server is needed

## API Mode

When `VITE_USE_MOCKS=false`:
- API calls go to `VITE_API_BASE_URL`
- The Vite dev server proxies `/api` requests to the backend (configured in `vite.config.ts`)

## Config Module

The `src/config/env.ts` module provides typed access to all environment variables:

```typescript
import { env } from '../config/env'

env.useMocks       // boolean
env.apiBaseUrl     // string
env.supabaseUrl    // string
env.supabaseAnonKey // string
```

## Important Notes

- The `.env` file is in `.gitignore` and must NOT be committed
- Only `VITE_` prefixed variables are exposed to the client bundle
- Never store Supabase service role keys in frontend `.env` files
- The `env.ts` module provides safe fallback values when variables are missing
