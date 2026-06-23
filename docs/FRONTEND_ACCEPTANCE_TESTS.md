# Frontend Acceptance Tests

Use `VITE_USE_MOCKS=true` or `VITE_API_MODE=mock` for frontend-only acceptance testing.

## Organizer Full Procurement Journey

1. Open `/`.
2. Select `Organizer demo`.
3. Expect `/organizer` to load with Organizer dashboard metrics and command panel.
4. Select an event or choose `Continue Procurement`.
5. Add a requirement with valid quantity and budget range.
6. Search vendors.
7. Confirm vendor match score and insights appear.
8. Select a vendor and submit a booking request.
9. Expect confirmation state and link to portfolio.
10. Open `/organizer/portfolio?eventId=evt-001`.
11. Expect requirements, bookings, contracts, documents, and activity tabs to render.

## Vendor B2B Booking Journey

1. Select `Vendor demo`.
2. Expect `/vendor` to load with B2B queue command panel.
3. Open a pending booking.
4. Accept, reject, or request changes.
5. Expect the booking list to refresh and the status badge to update.
6. Open contract details when available.
7. Sign as vendor when contract state allows it.
8. Open `/vendor/profile` and update service availability/profile details.

## Admin Operations Journey

1. Select `Admin demo`.
2. Expect `/admin` to load with operations command panel, risk flags, and action queue.
3. Open Vendors.
4. Verify or reject a pending vendor with an optional reason.
5. Open Bookings.
6. Override a booking status with a required reason.
7. Expect audit/activity timeline on the summary screen.

## Contract Signing Journey

1. Open Organizer portfolio for an event with accepted bookings.
2. Expand a booking with a contract.
3. Send or sign the contract when the role is authorized.
4. Switch to Vendor demo.
5. Open the matching B2B booking.
6. View contract and sign as vendor when available.

## Notification Journey

1. Open `/notifications` after a demo login.
2. Expect grouped notifications.
3. Mark a single notification as read.
4. Mark all as read.
5. Expect unread count and read state to update without page reload.

## Profile And Settings Journey

1. Organizer: open `/organizer/profile`, edit fields, save, and expect success state.
2. Vendor: open `/vendor/profile`, validate required fields, save, and expect success state.
3. Admin: open `/admin/settings`, edit settings, save, and expect success state.
4. Try leaving a changed profile page and expect unsaved-change browser protection where implemented.

## Responsive Layout Checks

1. Check dashboard routes at mobile width.
2. Sidebar should collapse behind the mobile menu.
3. Cards should stack in one column.
4. Tables should remain horizontally scrollable instead of breaking layout.
5. Primary actions should remain visible and tappable.

## Unauthorized Route Checks

1. Log out.
2. Open `/organizer`, `/vendor`, and `/admin`.
3. Expect redirect to `/login`.
4. Log in as Vendor and open `/admin`.
5. Expect Unauthorized page.

## Not Found Route Checks

1. Open `/does-not-exist`.
2. Expect the Not Found page without a framework error overlay.

## Automated Checks

Run:

```bash
cd frontend
npm.cmd run build
npm.cmd run lint
npm.cmd test
```

Expected result:

- Build passes.
- Tests pass.
- Lint has no errors. Existing hook dependency warnings are tracked until a broader hook dependency cleanup.
