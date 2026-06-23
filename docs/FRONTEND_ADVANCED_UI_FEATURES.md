# Frontend Advanced UI Features

## Timeline and Calendar

- `planningService.getEventPlanningTimeline(portfolio)` provides mock planning milestones.
- Organizer portfolio renders event date, booking deadlines, contract due dates, requirement due dates, and vendor action milestones.
- Future backend endpoint: `GET /events/:eventId/planning-timeline`.

## Budget Center

- `budgetService.getBudgetSummary(portfolio)` derives total budget, allocated vendor budget, estimated spend, accepted spend, pending spend, remaining budget, and over-budget state.
- Organizer portfolio renders category breakdowns for Catering, Lights, Sounds, Venue, Photo/Video, Staff, and Transport.
- Future backend endpoint: `GET /events/:eventId/budget-center`.

## Vendor Availability

- `availabilityService` provides mock availability calendars, blocked dates, and quick vendor status updates.
- Organizer procurement previews vendor availability before booking.
- Vendor dashboard shows a service availability calendar and quick status update controls.
- Future endpoints:
  - `GET /vendors/:vendorId/availability?eventId=:eventId`
  - `GET /vendor/availability`
  - `PATCH /vendor/availability/status`

## Communication Placeholders

- `communicationService.listBookingMessages(bookingId)` returns typed mock booking messages.
- Supported message types are `organizer_message`, `vendor_message`, `admin_note`, and `system_update`.
- Composer is intentionally disabled until backend messaging exists.
- Future endpoint: `GET /bookings/:bookingId/messages`.

## Operational Analytics

- `analyticsService.getOperationalAnalytics(summary)` derives Admin/Operations metrics from the existing dashboard summary.
- Panels include booking status distribution, vendor verification distribution, contract status, event timeline stage, operations insights, and trend placeholder.
- Future endpoint: `GET /admin/analytics/operations`.

## Global Search and Commands

- `commandService.search(query)` searches mock frontend data across events, vendors, bookings, contracts, and notifications.
- Role-scoped quick actions route users to common workflows.
- Future endpoint: `GET /search/global?q=:query`.

## Role Guidance

- `helpService.getRoleHelp(role)` provides Organizer, Vendor, and Admin guidance content.
- The dashboard shell exposes role guidance through a Help drawer.

