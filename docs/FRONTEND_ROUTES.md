# Frontend Routes

Routes are centralized in `frontend/src/routes/routeConstants.ts` and rendered in `frontend/src/routes/index.tsx`.

## Public

- `/`
- `/login`
- `/register`

## Authenticated

- `/onboarding`
- `/notifications`

## Organizer

- `/organizer`
- `/organizer/plan-event`
- `/organizer/vendor-marketplace`
- `/organizer/vendor-status`
- `/organizer/portfolio`
- `/organizer/compare`
- `/organizer/reports`
- `/organizer/profile`

## Vendor

- `/vendor`
- `/vendor/reports`
- `/vendor/profile`

## Admin

- `/admin`
- `/admin/reports`
- `/admin/settings`

Role guards redirect unauthenticated users to `/login`, incomplete profiles to `/onboarding`, and unauthorized users to the unauthorized page.

## Global Navbar (MVVM)

The sidebar navbar uses strict MVVM architecture with localStorage persistence.

| Layer | File | Responsibility |
|-------|------|----------------|
| Model | `src/shared/models/navbar.model.ts` | Pure TS interfaces (`NavbarState`) and constants (`NAVBAR_STORAGE_KEY`) |
| ViewModel | `src/shared/viewmodels/useNavbarViewModel.ts` | React hook managing `isOpen` state with `localStorage` persistence. Exposes `isOpen`, `toggle`, `open`, `close` |
| View | `src/shared/components/DashboardShell.tsx` | Consumes `useNavbarViewModel()` for sidebar visibility. Hamburger (☰) / X toggle in header |

**Behavior**: Sidebar state persists across route changes and page refreshes. Only the explicit hamburger/X toggle button changes the state.
