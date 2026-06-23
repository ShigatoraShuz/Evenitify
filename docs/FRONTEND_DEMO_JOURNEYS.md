# Frontend Demo Journeys

Phase 7 adds explicit demo role switching for frontend-only presentations.

## Availability

Demo switching is available only when `VITE_USE_MOCKS=true`.

## Entry Points

- Landing page demo panel.
- Authenticated dashboard demo panel.

## Demo Roles

| Role | Demo Route | Scenario |
|---|---|---|
| Organizer | `/organizer` | `organizer_active_procurement` |
| Vendor | `/vendor` | `vendor_pending_b2b_requests` |
| Admin | `/admin` | `admin_pending_operations` |

## Expected Journey Coverage

Organizer:

1. Launch Organizer demo.
2. Review active event dashboard.
3. Open procurement for a Large Event.
4. Add requirements and search vendors.
5. Compare vendors and shortlist.
6. Submit booking request.
7. Track portfolio, contract, documents, audit activity, and notifications.

Vendor:

1. Launch Vendor demo.
2. Review B2B booking queue.
3. Inspect booking detail.
4. Accept, reject, or request changes.
5. Review contract and sign when ready.
6. Manage service listings in profile.

Admin:

1. Launch Admin demo.
2. Review operations dashboard.
3. Inspect pending actions and risk flags.
4. Verify vendors.
5. Override booking status with reason.
6. Review recent admin audit activity.

All demo state is stored in browser `localStorage`; no backend or Supabase writes occur.
