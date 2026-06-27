# Eventify Frontend Architecture

## Current Shape

Eventify is a React + Vite + TypeScript app with a route-first shell and feature folders that keep views, viewmodels, models, and feature-specific components separated.

Core flow:

- `frontend/src/main.tsx` boots the app.
- `frontend/src/App.tsx` wraps routing and error handling.
- `frontend/src/routes/index.tsx` owns lazy loading, auth gating, redirects, and page transitions.
- `frontend/src/routes/routeConstants.ts` defines route metadata and sidebar navigation by role.
- `frontend/src/shared` contains the reusable shell, UI primitives, layout helpers, hooks, constants, and shared types.
- `frontend/src/features/*` contains role and domain surfaces, with wrappers keeping views thin and viewmodels owning state and orchestration.

## Redesign Boundary

This redesign keeps:

- the same routes
- the same service modules
- the same feature folder boundaries
- the same viewmodel ownership of business logic

This redesign changes:

- presentation, spacing, hierarchy, surfaces, and motion
- the shared authenticated shell
- shared cards, tables, forms, modals, drawers, empty states, badges, and loading states
- the authenticated role surfaces for organizer, vendor, and admin workflows

Landing, sign in, and create account remain outside the redesign scope.

## Architecture Decisions

### 1. Shell-first redesign

The authenticated experience should feel like one product, not a collection of unrelated dashboards. The shell is the anchor:

- deep, atmospheric background
- sticky top command bar
- role-aware sidebar
- strong content frame
- consistent notification, search, and help entry points

### 2. Shared design system layer

Shared components should carry the new visual language so feature screens stay thin.

Primary targets:

- `frontend/src/shared/components/DashboardShell.tsx`
- `frontend/src/shared/components/OrganizerUI.tsx`
- `frontend/src/shared/components/PageHeader.tsx`
- `frontend/src/shared/components/StatusBadge.tsx`
- `frontend/src/shared/components/SummaryCard.tsx`
- `frontend/src/shared/components/DataTable.tsx`
- `frontend/src/shared/components/Modal.tsx`
- `frontend/src/shared/components/ConfirmDialog.tsx`
- `frontend/src/shared/components/EmptyState.tsx`
- `frontend/src/shared/components/LoadingStates.tsx`
- `frontend/src/shared/components/CommandPalette.tsx`
- `frontend/src/shared/components/RealtimeIndicator.tsx`
- `frontend/src/shared/components/Toast.tsx`
- `frontend/src/shared/components/PlaceholderMedia.tsx`
- `frontend/src/shared/components/NotFoundPage.tsx`
- `frontend/src/shared/components/UnauthorizedPage.tsx`
- `frontend/src/shared/components/CrashScreen.tsx`

### 3. Feature views stay thin

Feature screens should keep orchestration in viewmodels and data services.
The redesign should mostly update:

- layout composition
- card grouping
- empty/loading states
- action placement
- density and hierarchy

The goal is to avoid moving logic into view components.

### 4. Role-specific language

Each authenticated role should have its own visual emphasis while sharing the same shell:

- Organizer: planning studio and procurement command center
- Vendor: booking inbox and service operations desk
- Admin: oversight cockpit and exception triage

## Affected Files

### Global and shell

- `frontend/src/index.css`
- `frontend/src/App.css`
- `frontend/tailwind.config.js`
- `frontend/src/shared/components/DashboardShell.tsx`
- `frontend/src/shared/components/ToastContext.tsx`
- `frontend/src/shared/components/Toast.tsx`
- `frontend/src/shared/components/CommandPalette.tsx`
- `frontend/src/shared/components/Modal.tsx`
- `frontend/src/shared/components/ConfirmDialog.tsx`
- `frontend/src/shared/components/LoadingStates.tsx`
- `frontend/src/shared/components/EmptyState.tsx`
- `frontend/src/shared/components/NotFoundPage.tsx`
- `frontend/src/shared/components/UnauthorizedPage.tsx`
- `frontend/src/shared/components/CrashScreen.tsx`

### Shared dashboard primitives

- `frontend/src/shared/components/OrganizerUI.tsx`
- `frontend/src/shared/components/PageHeader.tsx`
- `frontend/src/shared/components/SummaryCard.tsx`
- `frontend/src/shared/components/StatusBadge.tsx`
- `frontend/src/shared/components/DataCard.tsx`
- `frontend/src/shared/components/DataTable.tsx`
- `frontend/src/shared/components/RealtimeIndicator.tsx`
- `frontend/src/shared/components/ReportBlocks.tsx`
- `frontend/src/shared/components/AnalyticsComponents.tsx`
- `frontend/src/shared/components/OperationsPanels.tsx`
- `frontend/src/shared/components/PlaceholderMedia.tsx`

### Role and feature surfaces

- `frontend/src/features/organizer-dashboard/views/OrganizerDashboardView.tsx`
- `frontend/src/features/organizer/plan-event/views/OrganizerPlanEventView.tsx`
- `frontend/src/features/organizer/vendor-marketplace/views/VendorMarketplaceView.tsx`
- `frontend/src/features/organizer/vendor-status/views/OrganizerVendorStatusView.tsx`
- `frontend/src/features/vendor-b2b-dashboard/views/VendorB2BDashboardView.tsx`
- `frontend/src/features/vendor-b2b-dashboard/views/VendorServicesView.tsx`
- `frontend/src/features/vendor-b2b-dashboard/views/VendorBookingsView.tsx`
- `frontend/src/features/vendor-b2b-dashboard/views/VendorEventsView.tsx`
- `frontend/src/features/vendor-b2b-dashboard/views/VendorAvailabilityView.tsx`
- `frontend/src/features/admin-operations/views/AdminDashboardView.tsx`
- `frontend/src/features/notifications/views/NotificationsView.tsx`
- `frontend/src/features/reports/views/ReportsView.tsx`
- `frontend/src/features/user-settings/views/OrganizerProfileView.tsx`
- `frontend/src/features/user-settings/views/VendorProfileView.tsx`
- `frontend/src/features/user-settings/views/AdminSettingsView.tsx`
- `frontend/src/features/contract-booking/views/EventPortfolioView.tsx`
- `frontend/src/features/vendor-comparison/views/VendorComparisonView.tsx`
- `frontend/src/features/onboarding/views/OnboardingView.tsx`

### Feature component layers

- `frontend/src/features/organizer/plan-event/components/*`
- `frontend/src/features/organizer/vendor-marketplace/components/*`
- `frontend/src/features/organizer/vendor-status/components/*`
- `frontend/src/features/vendor-b2b-dashboard/components/*`
- `frontend/src/features/contract-booking/components/*`
- `frontend/src/features/notifications/components/*`

## Implementation Order

1. Update the authenticated shell and the shared visual primitives.
2. Rework organizer, vendor, and admin role screens to use the new surfaces.
3. Tighten empty states, loading states, dialogs, and tables.
4. Verify the app builds and the major authenticated routes still render.

