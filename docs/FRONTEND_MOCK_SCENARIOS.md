# Frontend Mock Scenarios

Phase 7 introduces typed scenario data for frontend-only demos.

## Scenario IDs

- `new_organizer_no_events`
- `organizer_active_procurement`
- `organizer_completed_event`
- `vendor_pending_b2b_requests`
- `vendor_active_contracts`
- `admin_pending_operations`

The active scenario is stored in `localStorage` as `eventify_mock_scenario`.

## Files

- `frontend/src/services/mock/mockData.ts`: base mock records.
- `frontend/src/services/mock/mockScenarios.ts`: scenario composition and scenario selection.
- `frontend/src/services/mock/mockAdapter.ts`: endpoint fallback that reads active scenarios.

Mock records stay in service mock files only. Views and components do not own scenario data.
