# Frontend ViewModel State

Phase 7 standardizes ViewModel state vocabulary without changing existing screen behavior.

## Shared Status Values

- `idle`
- `loading`
- `success`
- `empty`
- `error`
- `submitting`
- `refreshing`

## Shared Helpers

- `buildViewModelStateMeta`
- `useMutationState`

## Applied ViewModels

- `useOrganizerDashboard`
- `useVendorProcurement`
- `useEventPortfolio`
- `useVendorB2BDashboard`
- `useAdminDashboard`
- `useNotifications`
- `useVendorProfile`
- `useOnboarding`

Views can keep using existing fields such as `loading`, `submitting`, and `error`, while new/polished surfaces can consume `status`, `isEmpty`, `isRefreshing`, and related booleans.
