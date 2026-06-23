# Frontend Realtime-Ready UI

The frontend now exposes a typed realtime placeholder through `realtimeService` and `useRealtimeSnapshot`.

## Surfaces

- Organizer dashboard
- Event portfolio and contract tabs
- Vendor B2B dashboard
- Admin dashboard
- Notification center
- Report pages

## Behavior

- Shows connected/offline status.
- Shows the last refresh timestamp.
- Supports manual refresh.
- Uses mock snapshots only; no websocket or Supabase realtime connection is created in Phase 6.
