# Frontend Mock Mode Guide

Mock mode keeps the Phase 8 frontend usable without backend or Supabase services.

## Environment

Preferred:

```bash
VITE_API_MODE=mock
```

Legacy-compatible:

```bash
VITE_USE_MOCKS=true
```

## What Mock Mode Covers

- Organizer event and portfolio data.
- Vendor search, comparison, and booking requests.
- Vendor B2B booking queue.
- Admin users, events, bookings, vendors, and summary metrics.
- Phase 8 planning timelines, budget calculations, availability calendars, message placeholders, analytics, command search, and role guidance.

## What Mock Mode Does Not Do

- No real booking persistence beyond existing frontend mock behavior.
- No real message delivery.
- No WebSocket or realtime transport.
- No file uploads or Supabase Storage writes.
- No backend status enforcement beyond existing typed service placeholders.

## API Switching

Use `VITE_API_MODE=local` for a local backend and `VITE_API_MODE=production` for deployed API integration. All Phase 8 additions are frontend-safe and document future endpoint paths in their service files.

## Deployment

Mock mode is acceptable for Vercel, Netlify, or static-hosted demos. Do not include `.env`, service-role keys, uploaded files, `node_modules`, or `dist` in commits.

