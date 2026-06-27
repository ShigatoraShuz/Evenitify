# Update Log

## 2026-06-27

- What changed: Added the redesign architecture and visual direction docs for the authenticated frontend surfaces.
- Where it changed: `docs/architecture.md`, `docs/design-redesign.md`, `docs/update.md`.
- Why it changed: The repository needed a concrete design and implementation contract before the visual refactor starts.
- What was verified: Reviewed the router, shared shell, shared UI primitives, and the main organizer, vendor, and admin feature surfaces.

- What changed: Reworked the authenticated shell header and the shared page header, summary card, and data table surfaces; fixed broken dashboard utility classes.
- Where it changed: `frontend/src/shared/components/DashboardShell.tsx`, `frontend/src/shared/components/PageHeader.tsx`, `frontend/src/shared/components/SummaryCard.tsx`, `frontend/src/shared/components/DataTable.tsx`, `frontend/src/features/notifications/components/NotificationDropdown.tsx`, `frontend/src/features/organizer-dashboard/views/OrganizerDashboardView.tsx`, `frontend/src/features/contract-booking/views/EventPortfolioView.tsx`, `frontend/src/features/vendor-procurement/views/VendorProcurementView.tsx`.
- Why it changed: These shared surfaces define most authenticated screens, so updating them first establishes the new Eventify visual language and removes invalid Tailwind utilities that would otherwise block a clean build.
- What was verified: Searched the frontend for leftover invalid spacing and border utilities; the target token sweep returned no remaining matches.

- What changed: Reworked the organizer/vendor shared card layer to make organizer dashboards, vendor marketplaces, and request tracking feel more deliberate and premium.
- Where it changed: `frontend/src/shared/components/OrganizerUI.tsx`, `frontend/src/features/organizer/vendor-marketplace/components/VendorCard.tsx`, `frontend/src/features/organizer/vendor-status/components/VendorRequestCard.tsx`, `frontend/src/features/organizer/vendor-status/components/VendorStatusSummaryCards.tsx`.
- Why it changed: These shared organizer/vendor building blocks are reused across multiple authenticated routes, so updating them amplifies the redesign without changing route structure or business logic.
- What was verified: Ran the frontend build successfully after the card-layer rewrite.
