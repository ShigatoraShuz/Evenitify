# Frontend Demo Guide

Use mock mode for a frontend-only Eventify presentation.

```bash
cd frontend
npm run dev
```

Set `VITE_API_MODE=mock` or `VITE_USE_MOCKS=true` when deploying or running a standalone demo.

## Demo Role Switching

The landing page and dashboard shell expose a development/demo-only role switcher when mock mode is enabled.

- Organizer: opens the Organizer dashboard and procurement journey.
- Vendor: opens the Vendor B2B queue and availability tools.
- Admin: opens the Admin/Operations dashboard and analytics.

## Organizer Demo Path

1. Start as Organizer.
2. Open an active event from the Organizer dashboard.
3. Add or review requirements in Vendor Procurement.
4. Search vendors and inspect match score plus availability preview.
5. Submit a booking request.
6. Open Event Portfolio.
7. Review Timeline, Budget, Bookings, Contracts, Documents, and Activity tabs.
8. Expand a booking to view the disabled message-thread placeholder and contract state.

## Vendor Demo Path

1. Start as Vendor.
2. Review B2B booking requests.
3. Use the availability calendar, quick availability status update, and blocked-date list.
4. Open a booking detail.
5. Accept, decline, or request changes where available.
6. Review contract and message-thread placeholders.

## Admin Demo Path

1. Start as Admin.
2. Review operations metrics and analytics distributions.
3. Inspect action queues and risk flags.
4. Open Vendors to approve or reject a vendor.
5. Open Bookings to override status with a reason.
6. Review audit/activity timeline.

## Global Tools

- Use `Search` in the dashboard header for mock global search and quick actions.
- Use `Help` in the dashboard header for role-specific guidance.

