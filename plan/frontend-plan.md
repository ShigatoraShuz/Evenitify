# Eventify Frontend Incremental Development Plan

## Project Context
Eventify is a B2B Organizer Vendor Procurement application. Organizers create or select a Large Event, define vendor requirements, discover Vendors, submit booking requests, and track each booking inside one event portfolio. Vendors use a separate B2B dashboard that distinguishes Organizer/Large Event bookings from normal personal customer bookings.

## Frontend Stack

| Area | Standard |
|---|---|
| Framework | React + TypeScript |
| Architecture | MVVM with feature folders |
| Styling | Tailwind CSS or CSS modules with design tokens |
| Routing | React Router or route registry through `src/routes/index.tsx` |
| Forms | React Hook Form + Zod or equivalent validation layer |
| Data Fetching | Service layer through ViewModels; no direct API calls in Views |
| State Scope | Local ViewModel state first, shared store only when state crosses features |
| Auth | Supabase Auth session consumed through `authService` and route guards |

## Target Frontend Directory

```txt
src/
├── features/
│   ├── vendor-procurement/
│   │   ├── components/
│   │   ├── models/
│   │   ├── viewmodels/
│   │   └── views/
│   ├── organizer-dashboard/
│   │   ├── components/
│   │   ├── models/
│   │   ├── viewmodels/
│   │   └── views/
│   ├── vendor-b2b-dashboard/
│   │   ├── components/
│   │   ├── models/
│   │   ├── viewmodels/
│   │   └── views/
│   └── contract-booking/
│       ├── components/
│       ├── models/
│       ├── viewmodels/
│       └── views/
├── services/
├── shared/
├── utils/
├── routes/
└── docs/
```

---

## Phase 1: Frontend Foundation and MVVM Scaffolding

### Objective
Create the frontend shell, routing structure, design foundation, and MVVM directory boundaries before implementing business features.

### Implementation Tasks

| Task | Action |
|---|---|
| App setup | Initialize React + TypeScript project and configure aliases such as `@/features`, `@/services`, and `@/shared`. |
| Route registry | Create `src/routes/index.tsx` with lazy-loaded views for Organizer, Vendor, Admin, Auth, and fallback pages. |
| Feature folders | Create `vendor-procurement`, `organizer-dashboard`, `vendor-b2b-dashboard`, and `contract-booking`. |
| Shared UI | Create `DashboardShell`, `Button`, `Input`, `Select`, `Modal`, `StatusBadge`, `EmptyState`, and `PageHeader`. |
| Theme | Define typography, spacing, border radius, status colors, and neutral B2B visual language. |
| API client shell | Create `services/apiClient.ts`, but only wire base URL, headers, and error handling. |

### Deliverables

- Working frontend route shell.
- Empty but functional MVVM feature folders.
- Shared layout system.
- Design tokens and consistent page spacing.

### Acceptance Criteria

- App builds successfully.
- Views do not contain API calls.
- Feature folders follow `components`, `models`, `viewmodels`, and `views` structure.
- Route registry can load placeholder pages.

---

## Phase 2: Authentication, Session State, and Role Routing

### Objective
Implement Supabase Auth session handling and role-based navigation for Organizer, Vendor, and Admin/Operations.

### Implementation Tasks

| Area | Action |
|---|---|
| Auth service | Implement `authService.ts` for login, register, logout, getSession, and refreshSession. |
| Session ViewModel | Create `useAuthSession.ts` to track loading state, session, user role, and redirect rules. |
| Auth views | Build Login, Register, Forgot Password, and Role Selection screens. |
| Route guards | Implement `OrganizerRoute`, `VendorRoute`, and `AdminRoute` wrappers. |
| Navbar state | Show role-specific navigation after login. |

### API Dependencies

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- Supabase Auth session token

### Deliverables

- Role-aware authentication flow.
- Protected route guards.
- Session-aware dashboard redirects.

### Acceptance Criteria

- Unauthenticated users cannot access dashboards.
- Organizer users route to Organizer dashboard.
- Vendor users route to Vendor B2B dashboard.
- Admin users route to Admin/Operations dashboard.

---

## Phase 3: Organizer Dashboard and Large Event Setup

### Objective
Allow Organizers to create or select a Large Event before starting vendor procurement.

### Implementation Tasks

| MVVM Layer | Action |
|---|---|
| Model | Define `LargeEvent`, `LargeEventForm`, `EventStatus`, and default form values. |
| Service | Implement `eventService.getOrganizerEvents`, `eventService.createEvent`, and `eventService.getEventPortfolio`. |
| ViewModel | Build `useOrganizerDashboard` for event loading, selection, creation, validation, and status summary. |
| View | Build `OrganizerDashboardView` with event list, create event card, event status summary, and procurement entry CTA. |
| Components | Create `LargeEventCard`, `CreateEventModal`, `EventStatusSummary`, and `EventPortfolioPreview`. |

### UX Requirements

- Large Event procurement must look distinct from personal booking.
- Use a clear event-first flow: **Choose Event → Define Needs → Find Vendors → Book**.
- Display event progress using compact status chips.

### Deliverables

- Organizer dashboard.
- Create/select Large Event flow.
- Frontend validation for event name, date, venue, budget, and expected guests.

### Acceptance Criteria

- Organizer cannot proceed to procurement without a selected `eventId`.
- Event cards show title, date, venue, budget, and overall procurement status.
- Create Event form handles loading, errors, and success states.

---

## Phase 4: Event Requirements and Procurement Workspace

### Objective
Allow Organizers to define required vendor categories and procurement needs per Large Event.

### Implementation Tasks

| MVVM Layer | Action |
|---|---|
| Model | Define `EventRequirement`, `RequirementCategory`, `RequirementStatus`, and `RequirementForm`. |
| Service | Implement `eventService.createRequirement`, `eventService.updateRequirement`, and `eventService.deleteRequirement`. |
| ViewModel | Build `useVendorProcurement` to manage selected event, requirements, filters, stepper state, and validation. |
| View | Build `VendorProcurementView` with procurement stepper, requirement cards, and vendor search panel. |
| Components | Create `ProcurementStepper`, `RequirementCard`, `RequirementForm`, and `RequirementCategoryGrid`. |

### Required Categories

| Category | Example Requirement Fields |
|---|---|
| Catering | headcount, meal type, service time, budget range |
| Lights and Sounds | equipment type, duration, venue setup |
| Venue | capacity, location, indoor/outdoor, date |
| Photo/Video | package type, hours, deliverables |
| Staff | number of staff, role type, duration |
| Transport | vehicle type, passenger count, route |

### Deliverables

- Requirement creation and editing.
- Stepper-driven procurement workspace.
- Event requirement cards grouped by category.

### Acceptance Criteria

- Each requirement is linked to a Large Event.
- Requirement cards show category, quantity, budget range, status, and booking count.
- User receives inline validation when quantity or budget is invalid.

---

## Phase 5: Vendor Discovery, Filtering, and Vendor Profile Review

### Objective
Provide a vendor search and comparison experience based on category, location, budget, rating, and availability.

### Implementation Tasks

| Area | Action |
|---|---|
| Vendor service | Implement `vendorService.searchVendors` and `vendorService.getVendorProfile`. |
| Filter ViewModel | Add reactive filter state for category, city, min/max budget, rating, and availability. |
| Search UI | Build `VendorFilterPanel`, `VendorSearchResults`, and `VendorComparisonDrawer`. |
| Profile UI | Build Vendor Profile page or modal with services, pricing, rating, availability, and verification status. |
| Loading UX | Add skeleton cards, empty states, and retry actions. |

### UX Requirements

- Keep filters compact and easy to scan.
- Vendor cards must show service category, base price, rating, location/service area, and availability status.
- Highlight if a vendor matches the selected requirement budget.

### Deliverables

- Vendor discovery page inside the procurement workflow.
- Vendor profile review screen.
- Filter state stored in ViewModel, not in View.

### Acceptance Criteria

- Search results update when filters change.
- No direct API calls exist inside components or views.
- User can select a vendor and continue to booking only when an event and requirement are selected.

---

## Phase 6: Organizer B2B Booking Request Flow

### Objective
Allow Organizers to submit a Vendor booking request linked to `eventId`, `requirementId`, `vendorId`, and `organizerId`.

### Implementation Tasks

| MVVM Layer | Action |
|---|---|
| Model | Define `BookingRequest`, `BookingStatus`, `BookingType`, and `BookingForm`. |
| Service | Implement `bookingService.createBookingRequest`. |
| ViewModel | Add booking form state, validation, submission state, and success/error handling. |
| View | Build booking confirmation view with event details, vendor details, requirement details, notes, and budget. |
| Components | Create `BookingRequestForm`, `BookingSummaryPanel`, `BookingValidationAlert`, and `SubmitBookingButton`. |

### Validation Rules

- `eventId` is required.
- `requirementId` is required.
- `vendorId` is required.
- Booking type must be `B2B` for Organizer/Large Event procurement.
- Requested date must not conflict with event date rules.
- Budget must fit requirement min/max range or require justification notes.

### Deliverables

- Complete B2B booking request flow.
- Pending booking confirmation state.
- Organizer notification after request submission.

### Acceptance Criteria

- Booking request cannot be submitted without a valid Large Event ID.
- Successful booking displays pending status and redirects to Event Portfolio.
- Errors are readable and actionable.

---

## Phase 7: Vendor B2B Dashboard

### Objective
Build a Vendor dashboard that visually separates Organizer/Large Event booking requests from personal customer bookings.

### Implementation Tasks

| Area | Action |
|---|---|
| Vendor dashboard ViewModel | Build `useVendorB2BDashboard` for B2B queue loading, status updates, filters, and response actions. |
| B2B queue | Add tabs for Pending, Accepted, Proposed Changes, Rejected, Confirmed, Completed. |
| Visual separation | Use labels such as `Organizer Booking`, `Large Event`, and `B2B Procurement`. |
| Request detail | Show event name, date, venue, expected guests, requirement category, budget, and organizer notes. |
| Response flow | Vendor can accept, decline, or request changes. |

### Deliverables

- Vendor B2B dashboard.
- Booking request detail drawer.
- Accept, decline, and request-change actions.

### Acceptance Criteria

- Vendor can distinguish B2B bookings from personal customer bookings immediately.
- Updating a booking status updates UI state without full page reload.
- Status change failures roll back optimistic UI state.

---

## Phase 8: Contract Linking and Event Portfolio Tracking

### Objective
Show the full booking lifecycle inside the Organizer event portfolio and connect accepted bookings to contract records.

### Implementation Tasks

| Area | Action |
|---|---|
| Contract service | Implement `contractService.getContract`, `contractService.createContractLink`, and `contractService.updateContractStatus`. |
| Portfolio ViewModel | Extend `useOrganizerDashboard` or create `useEventPortfolio` for requirements, bookings, contracts, status history, and progress. |
| Timeline UI | Build `BookingTimeline`, `ContractStatusCard`, and `RequirementFulfillmentTracker`. |
| Status chips | Standardize statuses: Pending, Accepted, Contract Sent, Confirmed, Completed, Cancelled, Rejected, Changes Requested. |

### Deliverables

- Event portfolio page.
- Contract status panel.
- Booking lifecycle timeline.

### Acceptance Criteria

- Organizer can see all Vendors tied to a Large Event.
- Each booking shows current status and latest status history.
- Contract links are visible only to authorized Organizer, Vendor, and Admin users.

---

## Phase 9: Notifications, Profile Management, and Admin Operations UI

### Objective
Add supporting screens that make the system operational for real users and internal staff.

### Implementation Tasks

| Feature | Action |
|---|---|
| Notifications | Build notification center with unread count, status update messages, and mark-as-read actions. |
| Organizer profile | Add organization name, contact number, business address, and profile completion indicator. |
| Vendor profile | Add business name, service area, verification status, services, pricing, and availability management. |
| Admin dashboard | Add user management, vendor verification, booking oversight, and issue review screens. |
| Settings | Add account settings, password reset, notification preferences, and role-specific defaults. |

### Deliverables

- Notification center.
- Organizer and Vendor profile management pages.
- Admin/Operations screens.

### Acceptance Criteria

- Notifications update when booking statuses change.
- Vendor services can be created and edited by Vendor users.
- Admin can review bookings and verification state.

---

## Phase 10: QA, Accessibility, Error Recovery, and Responsive Polish

### Objective
Harden the frontend and make the experience production-ready.

### Implementation Tasks

| Area | Action |
|---|---|
| Accessibility | Add keyboard navigation, focus states, form labels, ARIA for dialogs, and contrast checks. |
| Responsiveness | Optimize layouts for mobile, tablet, laptop, and desktop. |
| Error handling | Standardize error banners, toast messages, empty states, retry flows, and expired session handling. |
| Testing | Add unit tests for ViewModels and integration tests for main flows. |
| Performance | Add route-level lazy loading, memoized derived values, and minimized re-rendering. |

### Deliverables

- Tested and polished core flows.
- Consistent error states.
- Responsive layouts.

### Acceptance Criteria

- Organizer can complete event creation to booking request without broken UI states.
- Vendor can review and respond to request on mobile and desktop.
- No page contains direct database access or direct API calls inside View files.

---

## Final Phase: Deployment, Monitoring, and Optimization

### Objective
Deploy the frontend and establish ongoing quality, performance, and maintenance practices.

### Implementation Tasks

| Area | Action |
|---|---|
| Build optimization | Configure code splitting, bundle analysis, environment variables, and production build scripts. |
| Deployment | Deploy to Vercel, Netlify, or equivalent static hosting. |
| Monitoring | Add frontend error monitoring and analytics for key user journeys. |
| Documentation | Maintain `docs/ROUTES.md`, feature README files, and UI component usage notes. |
| Release checklist | Verify auth, route guards, booking lifecycle, Vendor dashboard, RLS-backed access, and responsive design. |

### Final Acceptance Criteria

- Production build passes.
- Environment variables are documented.
- Core B2B procurement flow works end-to-end against deployed backend and Supabase.
- All routes are documented and protected according to role.
