# Frontend Deployment Preview

Phase 7 keeps deployment preview frontend-only. Use mock mode for shareable demos until backend and Supabase environments are ready.

## Required Build Command

```bash
cd frontend
npm install
npm run build
```

Output directory:

```txt
frontend/dist
```

## Environment Variables

| Variable | Preview Value | Notes |
|---|---|---|
| `VITE_API_MODE` | `mock` | Recommended for frontend-only preview. |
| `VITE_USE_MOCKS` | `true` | Backward-compatible mock switch. |
| `VITE_API_BASE_URL` | empty or backend URL | Required only for local/production API modes. |
| `VITE_SUPABASE_URL` | empty until backend integration | Frontend-safe only. |
| `VITE_SUPABASE_ANON_KEY` | empty until Supabase integration | Never use service-role keys. |

## Vercel

Recommended setup:

- Project root: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment: `VITE_API_MODE=mock`

`frontend/vercel.json` rewrites all routes to `/` so React Router routes work on refresh.

## Netlify

Recommended setup:

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- Environment: `VITE_API_MODE=mock`

`frontend/public/_redirects` provides the SPA fallback.

## Static Hosting

Build locally and upload `frontend/dist`.

The host must serve `index.html` for unknown routes so paths like `/organizer/reports` and `/admin` refresh correctly.

## API Modes

- `mock`: frontend demo mode with typed mock scenarios.
- `local`: calls `VITE_API_BASE_URL` or `http://localhost:4000/api`.
- `production`: calls `VITE_API_BASE_URL` or `/api`.

No `.env`, `dist`, logs, uploads, secrets, or `node_modules` should be committed.
