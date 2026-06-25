# Frontend Routes

Routes are centralized in `frontend/src/routes/index.tsx`.

| Route | Guard | Role(s) | View |
|---|---|---|---|
| `/` | Public | `-` | Landing |
| `/login` | Public | `-` | Login |
| `/register` | Public | `-` | Register |
| `/choose-role` | Authenticated | `-` | Choose Role |
| `/onboarding` | Authenticated | `organizer`, `vendor` | Onboarding |
| `/notifications` | Authenticated | `organizer`, `vendor`, `admin` | Notifications |
| `/organizer` | Protected | `organizer`, `admin` | Organizer Dashboard |
| `/organizer/plan-event` | Protected | `organizer`, `admin` | Organizer Plan Event |
| `/organizer/vendor-marketplace` | Protected | `organizer`, `admin` | Vendor Marketplace |
| `/organizer/vendor-status` | Protected | `organizer`, `admin` | Organizer Vendor Status |
| `/organizer/portfolio` | Protected | `organizer`, `admin` | Event Portfolio |
| `/organizer/compare` | Protected | `organizer`, `admin` | Vendor Comparison |
| `/organizer/reports` | Protected | `organizer`, `admin` | Organizer Reports |
| `/organizer/profile` | Protected | `organizer`, `admin` | Organizer Profile |
| `/vendor` | Protected | `vendor` | Vendor Dashboard |
| `/vendor/services` | Protected | `vendor` | Vendor Services |
| `/vendor/bookings` | Protected | `vendor` | Vendor Bookings |
| `/vendor/availability` | Protected | `vendor` | Vendor Availability |
| `/vendor/profile` | Protected | `vendor` | Vendor Profile |
| `/vendor/reports` | Protected | `vendor` | Vendor Reports |
| `/admin` | Protected | `admin` | Admin Dashboard |
| `/admin/reports` | Protected | `admin` | Admin Reports |
| `/admin/settings` | Protected | `admin` | Admin Settings |
| `/404` | Public | `-` | Not Found |
| `*` | Public | `-` | Not Found fallback |

Role guards redirect unauthenticated users to `/login`, incomplete profiles to `/onboarding`, and unauthorized users to the unauthorized page.

## Global Navbar (MVVM)

The sidebar navbar uses strict MVVM architecture with localStorage persistence.

| Layer | File | Responsibility |
|---|---|---|
| Model | `frontend/src/shared/models/navbar.model.ts` | Pure TS interfaces (`NavbarState`) and constants (`NAVBAR_STORAGE_KEY`) |
| ViewModel | `frontend/src/shared/viewmodels/useNavbarViewModel.ts` | React hook managing `isOpen` state with `localStorage` persistence. Exposes `isOpen`, `toggle`, `open`, `close` |
| View | `frontend/src/shared/components/DashboardShell.tsx` | Consumes `useNavbarViewModel()` for sidebar visibility. Hamburger / X toggle in header |

**Behavior**: Sidebar state persists across route changes and page refreshes. Only the explicit hamburger/X toggle button changes the state.
