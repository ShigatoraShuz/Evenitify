# Frontend Phase 8 Checklist

Phase 8 upgrades the Eventify frontend prototype with advanced planning, budget, availability, communication, analytics, search, guidance, and demo polish. Backend and Supabase changes remain out of scope.

## Baseline Verification

- Production frontend build passes with `npm.cmd run build`.
- Role routes remain registered for Organizer, Vendor, Admin/Operations, reports, profile/settings, notifications, unauthorized, and not-found states.
- Major routes are lazy-loaded through the React Router v7 registry.
- Role guards remain in place for Organizer, Vendor, and Admin/Operations surfaces.
- Current service pattern remains typed frontend service calls with mock fallback.
- Existing Phase 7 mock role switching remains frontend-only and must stay clearly marked as demo/development mode.

## MVVM Guardrails

- Views should only compose layout and bind ViewModel props/handlers.
- ViewModels should own loading, refresh, mutation, validation, service orchestration, and derived values.
- Models should remain type/constant/default-value only.
- Mock data should stay in `src/services/mock/*` or service-level mock placeholders.
- New Phase 8 UI components should be prop-driven and reusable.

## Phase 8 Work Queue

- Event planning timeline and calendar UI.
- Organizer budget center and procurement cost visibility.
- Vendor availability scheduler placeholders for Organizer and Vendor.
- Booking conversation/message-thread placeholders.
- Admin/Operations analytics panels.
- Global search and quick action command UI.
- Role-specific guidance and first-time empty journey states.
- Presentation polish and deployable mock-mode demo readiness.
- Phase 8 documentation, build verification, and push.

## Completion Status

- Completed: baseline verification.
- Completed: event planning timeline and calendar UI.
- Completed: Organizer budget center.
- Completed: Vendor availability scheduler.
- Completed: communication placeholders.
- Completed: Admin operational analytics UI.
- Completed: global search and command UI.
- Completed: role guidance and guided empty state UI.
- Completed: presentation/demo polish.
- Pending until final handoff: final build, lint, tests, commit, and push.

## Verification Commands

Run before final Phase 8 handoff:

```bash
cd frontend
npm run build
npm run lint
npm test
```
