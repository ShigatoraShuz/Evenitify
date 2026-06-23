# Frontend Phase 7 Checklist

Phase 7 scope is frontend-only. Backend and Supabase database changes are intentionally deferred.

## Baseline Audit

- Build: passed with `npm.cmd run build`.
- Tests: passed with `npm.cmd test` (11 tests).
- Lint: passed with 11 existing hook dependency warnings and 0 errors.
- Route registry: public, auth, organizer, vendor, admin, notification, report, unauthorized, and not-found routes remain registered.
- MVVM: service calls are still routed through ViewModels or wrappers; no backend or Supabase implementation changes were made.

## Main Journeys To Complete

- Organizer: auth/demo entry, onboarding, event, requirements, vendor search, comparison, shortlist, booking request, portfolio, contract signing, notifications.
- Vendor: auth/demo entry, onboarding, service management, B2B request review, status response, contract signing, availability update.
- Admin: auth/demo entry, dashboard review, vendor verification, booking inspection, status override, audit timeline.

## Audit Findings

- Demo role switching exists implicitly through mock login email choices, but needs an explicit development/demo control.
- Mock scenario data is usable but not scenario-addressable yet.
- Major ViewModels use similar `loading`, `submitting`, and `error` fields, but do not expose a shared phase/status vocabulary.
- Some workflow validation exists, but several forms need clearer blocked-action explanations and validation summaries.
- Report, document, realtime, and audit placeholders exist and should be documented in API contracts as future backend endpoints.
- Role dashboards are functional, but final presentation polish should emphasize primary actions, recent activity, and next-best-action hierarchy.

## Phase 7 Step Tracking

- [x] 1. Baseline audit and checklist.
- [ ] 2. End-to-end demo journey completion.
- [ ] 3. ViewModel state machine consolidation.
- [ ] 4. Demo data realism and mock scenario system.
- [ ] 5. API mode switching final readiness.
- [ ] 6. Forms and workflow validation hardening.
- [ ] 7. Role dashboard final polish.
- [ ] 8. Acceptance test documentation and smoke checklist.
- [ ] 9. Deployment preview readiness.
- [ ] 10. Final QA, documentation, build verification, and push.
