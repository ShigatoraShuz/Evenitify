# Eventify Frontend Incremental Development Plan

## Project Context
Eventify is a B2B Organizer Vendor Procurement application. Organizers create or select a Large Event, define vendor requirements, discover Vendors, submit booking requests, and track each booking inside one event portfolio. Vendors use a separate B2B dashboard that distinguishes Organizer/Large Event bookings from normal personal customer bookings.

The frontend must feel like one unified product from the public landing page to the authenticated dashboards. All screens must use the same Eventify design system, spacing rules, typography, card styles, button variants, status badges, form patterns, and responsive behavior.

## Frontend Stack

| Area | Standard |
|---|---|
| Framework | React + TypeScript |
| Architecture | MVVM with feature folders |
| Styling | Tailwind CSS with shared design tokens |
| Routing | React Router or route registry through `src/routes/index.tsx` |
| Forms | React Hook Form + Zod or equivalent validation layer |
| Data Fetching | Service layer through ViewModels; no direct API calls in Views |
| State Scope | Local ViewModel state first, shared store only when state crosses features |
| Auth | Supabase Auth session consumed through `authService` and route guards |
| UI Language | Clean B2B SaaS design, event-first hierarchy, soft cards, strong CTAs, consistent role separation |

---

## Uniform Eventify Design System

### Design Goal
Create a professional, minimalist, and creative B2B procurement interface that does not feel generic. Every page must visually support the same product story:

> Organizers plan large events, define vendor requirements, discover vendors, send B2B booking requests, and track procurement status in one event portfolio.

### Core Design Principles

| Principle | Rule |
|---|---|
| Event-first | Organizer pages must always anchor the user around the selected Large Event. |
| Role clarity | Organizer, Vendor, and Admin experiences must have clear labels, navigation, and dashboard states. |
| Minimal text | Use short headings, concise helper text, and scannable cards. |
| One visual grammar | Use the same buttons, cards, badges, tables, modals, spacing, and form patterns across all phases. |
| Professional B2B look | Avoid playful or consumer-style booking visuals. Use structured layouts and clean data hierarchy. |
| Responsive by default | Build mobile-first, then enhance for tablet and desktop. |
| Accessible by default | Every form, dialog, menu, and CTA must be keyboard-accessible and properly labeled. |

### Visual Identity

| Token | Standard |
|---|---|
| Brand name | Eventify |
| Primary color | Deep indigo or dark blue for trust and B2B professionalism |
| Accent color | Soft cyan, teal, or violet accent used sparingly for CTAs and active states |
| Background | Light neutral background with subtle section contrast |
| Text | Dark slate for headings, muted slate for descriptions |
| Cards | White or near-white cards with soft border, large radius, subtle shadow |
| Borders | Thin neutral borders; use border contrast instead of heavy shadows |
| Radius | Consistent rounded corners: small for inputs, medium for cards, large for hero/CTA panels |
| Typography | Clear sans-serif, strong headings, readable body text |
| Icons | Use one icon style consistently; prefer Lucide-style line icons if already installed |

### Suggested Tailwind Token Direction

Use this as the product-level styling reference. Do not hardcode random colors per page.

```txt
Brand background: bg-slate-50 / bg-white
Primary text: text-slate-950
Secondary text: text-slate-600
Muted text: text-slate-500
Primary CTA: bg-indigo-600 hover:bg-indigo-700 text-white
Secondary CTA: bg-white border border-slate-200 text-slate-900 hover:bg-slate-50
Accent: text-cyan-600 / bg-cyan-50 / border-cyan-100
Success: text-emerald-700 bg-emerald-50 border-emerald-100
Warning: text-amber-700 bg-amber-50 border-amber-100
Danger: text-rose-700 bg-rose-50 border-rose-100
Info: text-blue-700 bg-blue-50 border-blue-100
Neutral chip: text-slate-700 bg-slate-100 border-slate-200
Card: bg-white border border-slate-200 shadow-sm rounded-2xl
Page shell: min-h-screen bg-slate-50
Section spacing: py-16 md:py-24 for marketing, p-4 md:p-6 lg:p-8 for dashboards
```

### Layout Standards

| Area | Layout Rule |
|---|---|
| Public landing | Full-width marketing layout. Do not use `DashboardShell`. |
| Auth pages | Centered split layout or card layout using the same brand colors as landing. |
| Authenticated dashboards | Use `DashboardShell` with consistent sidebar/topbar, page header, content grid, and status panels. |
| Organizer dashboard | Event-first layout with selected event context always visible. |
| Vendor dashboard | B2B queue-first layout with labels such as `Organizer Booking`, `Large Event`, and `B2B Procurement`. |
| Admin dashboard | Operations layout with tables, filters, verification states, and audit-friendly cards. |
| Forms | Use consistent labels, helper text, validation messages, and submit/loading states. |
| Empty states | Always include title, short description, and one clear CTA. |
| Loading states | Use skeleton cards matching the final layout, not generic spinners. |

### Shared Component Design Rules

| Component | Uniform Rule |
|---|---|
| `Button` | Use consistent sizes: `sm`, `md`, `lg`; variants: `primary`, `secondary`, `ghost`, `danger`. |
| `Input` | Same height, label spacing, border, focus ring, and error text across all forms. |
| `Select` | Same styling as inputs; avoid custom one-off dropdown visuals. |
| `Modal` | Same header, body, footer, close button, overlay, focus trap, and responsive width. |
| `StatusBadge` | One status-to-color map for events, requirements, bookings, contracts, and verification. |
| `PageHeader` | Consistent title, subtitle, optional eyebrow, and CTA placement. |
| `DashboardShell` | Consistent authenticated navigation, role label, account controls, and content max width. |
| `EmptyState` | Same icon container, title, description, and CTA pattern. |
| `DataCard` | Same card padding, border, radius, heading size, metadata row, and action area. |
| `Stepper` | Same active/completed/pending visuals across procurement, booking, and onboarding flows. |

### Status Badge Map

| Status | Visual Intent |
|---|---|
| Draft | Neutral |
| Planning | Info |
| Pending | Warning |
| Accepted | Success |
| Changes Requested | Warning |
| Rejected | Danger |
| Contract Sent | Info |
| Confirmed | Success |
| Completed | Success |
| Cancelled | Neutral/Danger depending on context |
| Verified | Success |
| Pending Verification | Warning |

---

## Target Frontend Directory

```txt
src/
├── features/
│   ├── landing/
│   │   ├── components/
│   │   ├── models/
│   │   ├── viewmodels/
│   │   └── views/
│   ├── auth/
│   │   ├── components/
│   │   ├── models/
│   │   ├── viewmodels/
│   │   └── views/
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
│   ├── contract-booking/
│   │   ├── components/
│   │   ├── models/
│   │   ├── viewmodels/
│   │   └── views/
│   ├── notifications/
│   │   ├── components/
│   │   ├── models/
│   │   ├── viewmodels/
│   │   └── views/
│   ├── profile-settings/
│   │   ├── components/
│   │   ├── models/
│   │   ├── viewmodels/
│   │   └── views/
│   └── admin-operations/
│       ├── components/
│       ├── models/
│       ├── viewmodels/
│       └── views/
├── services/
├── shared/
│   ├── components/
│   ├── constants/
│   ├── layout/
│   ├── styles/
│   └── types/
├── utils/
├── routes/
└── docs/
```

---

## Phase 1: Frontend Foundation, MVVM Scaffolding, and Design Tokens

### Objective
Create the frontend shell, routing structure, design foundation, shared UI primitives, and MVVM directory boundaries before implementing business features.

### Implementation Tasks

| Task | Action |
|---|---|
| App setup | Initialize React + TypeScript project and configure aliases such as `@/features`, `@/services`, and `@/shared`. |
| Route registry | Create `src/routes/index.tsx` with lazy-loaded views for Landing, Organizer, Vendor, Admin, Auth, and fallback pages. |
| Feature folders | Create `landing`, `auth`, `vendor-procurement`, `organizer-dashboard`, `vendor-b2b-dashboard`, `contract-booking`, `notifications`, `profile-settings`, and `admin-operations`. |
| Shared UI | Create `DashboardShell`, `PublicShell`, `Button`, `Input`, `Select`, `Modal`, `StatusBadge`, `EmptyState`, `PageHeader`, `DataCard`, `Stepper`, `LoadingSkeleton`, and `ErrorBanner`. |
| Theme tokens | Define typography, spacing, border radius, status colors, role colors, card styles, and neutral B2B visual language. |
| Status mapping | Create a single shared status-to-variant map used by events, requirements, bookings, contracts, and verification states. |
| API client shell | Create `services/apiClient.ts`, but only wire base URL, headers, and error handling. |
| Documentation | Create or update `docs/DESIGN_SYSTEM.md` and `docs/ROUTES.md`. |

### Deliverables

- Working frontend route shell.
- Empty but functional MVVM feature folders.
- Shared layout system.
- Design tokens and consistent page spacing.
- Shared UI primitives used by all later phases.
- Design system documentation.

### Acceptance Criteria

- App builds successfully.
- Views do not contain API calls.
- Feature folders follow `components`, `models`, `viewmodels`, and `views` structure.
- Route registry can load placeholder pages.
- Shared components use consistent Tailwind styles.
- No feature creates duplicate one-off buttons, cards, badges, or form controls.

---

## Phase 1.5: Public Landing Page and Marketing Entry

### Objective
Build the public-facing Eventify landing page that introduces the application, explains the Organizer Vendor Procurement workflow, and guides users toward registration or login before entering role-based dashboards.

The landing page must be accessible without authentication and must follow the strict MVVM frontend architecture.

### Implementation Tasks

| Step | File | Action |
|---|---|---|
| 1 | `src/features/landing/models/landing.models.ts` | Create interfaces and default landing page data. |
| 2 | `src/features/landing/viewmodels/useLandingViewModel.ts` | Create content mapping, mobile navigation state, and CTA navigation handlers. |
| 3 | `src/features/landing/components/LandingNavbar.tsx` | Create sticky public nav, links, login/register actions, and mobile hamburger. |
| 4 | `src/features/landing/components/LandingHero.tsx` | Create headline, subtitle, primary CTA, secondary CTA, and visual procurement summary. |
| 5 | `src/features/landing/components/LandingWorkflow.tsx` | Create numbered step cards for How It Works. |
| 6 | `src/features/landing/components/LandingFeatureGrid.tsx` | Create feature highlight cards. |
| 7 | `src/features/landing/components/LandingRoleCards.tsx` | Create Organizer, Vendor, and Admin role cards. |
| 8 | `src/features/landing/components/LandingCTASection.tsx` | Create trust stats and dual CTA section. |
| 9 | `src/features/landing/components/LandingFooter.tsx` | Create dark footer with links and branding. |
| 10 | `src/features/landing/views/LandingView.tsx` | Create presentational view that assembles all landing components. |
| 11 | `src/features/landing/views/LandingViewWrapper.tsx` | Create wrapper that connects `useLandingViewModel` to `LandingView`. |
| 12 | `src/routes/index.tsx` | Add lazy import and `/` route before catch-all route. |

### Landing Page Content Requirements

| Section | Purpose |
|---|---|
| Hero Section | Clearly explain that Eventify helps Organizers procure Vendors for large-scale events. |
| Primary CTA | Encourage Organizers to start finding Vendors. |
| Secondary CTA | Encourage Vendors to join as service providers. |
| How It Works | Show the flow: Create Event → Add Requirements → Discover Vendors → Send Booking Request → Track Portfolio. |
| Feature Highlights | Preview Organizer procurement, Vendor B2B dashboard, booking requests, and event portfolio tracking. |
| Role Cards | Separate entry points for Organizer, Vendor, and Admin/Operations users. |
| Trust Section | Highlight structured bookings, event-linked procurement, vendor visibility, and status tracking. |
| Footer | Include basic app links, support placeholder, and Eventify branding. |

### UX Requirements

- Landing page has its own layout and must not use `DashboardShell`.
- Use full-width sections, marketing typography, and generous spacing.
- Use the same brand colors, buttons, cards, border radius, and icon style as the authenticated app.
- Avoid too much text.
- Public users must immediately understand Organizer, Vendor, and Admin roles.
- Authenticated users visiting `/` should redirect to the correct dashboard through existing role redirect logic when available.
- CTAs route to `/register` for unauthenticated users or to the proper dashboard for authenticated users.

### Deliverables

- Public Eventify landing page.
- Landing page MVVM feature folder.
- Public route `/`.
- Public navbar and footer.
- CTA routing to authentication or role selection.
- Responsive landing layout.
- Landing page content models and ViewModel.

### Acceptance Criteria

| Requirement | Criteria |
|---|---|
| Public route works | `/` loads the landing page without requiring login. |
| MVVM compliance | Landing page follows `models`, `viewmodels`, `views`, and `components` structure. |
| No business logic in View | `LandingView.tsx` only renders data and functions from `useLandingViewModel`. |
| CTA navigation works | Organizer and Vendor CTAs route correctly to login, register, or role-based dashboards. |
| Responsive design | Landing page works properly on mobile, tablet, laptop, and desktop. |
| Consistent branding | Landing page uses Eventify visual identity and shared design tokens. |
| No API calls in View | Landing page does not call backend or Supabase directly inside View files. |
| Build passes | App builds successfully after adding the landing page. |

---

## Phase 2: Authentication, Session State, and Role Routing

### Objective
Implement Supabase Auth session handling and role-based navigation for Organizer, Vendor, and Admin/Operations using the same Eventify visual identity as the landing page.

### Implementation Tasks

| Area | Action |
|---|---|
| Auth service | Implement `authService.ts` for login, register, logout, getSession, and refreshSession. |
| Session ViewModel | Create `useAuthSession.ts` to track loading state, session, user role, and redirect rules. |
| Auth views | Build Login, Register, Forgot Password, and Role Selection screens. |
| Route guards | Implement `OrganizerRoute`, `VendorRoute`, and `AdminRoute` wrappers. |
| Navbar state | Show role-specific navigation after login. |
| Auth design | Use a consistent auth card/split layout with the same CTA, form, error, and role-card patterns as landing. |

### API Dependencies

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- Supabase Auth session token

### Deliverables

- Role-aware authentication flow.
- Protected route guards.
- Session-aware dashboard redirects.
- Uniform auth screen design.

### Acceptance Criteria

- Unauthenticated users cannot access dashboards.
- Organizer users route to Organizer dashboard.
- Vendor users route to Vendor B2B dashboard.
- Admin users route to Admin/Operations dashboard.
- Auth screens use shared `Button`, `Input`, `ErrorBanner`, `PageHeader`, and role-card patterns.

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
| Uniform UI | Use `DashboardShell`, `PageHeader`, `DataCard`, `StatusBadge`, `Modal`, and shared form controls. |

### UX Requirements

- Large Event procurement must look distinct from personal booking.
- Use a clear event-first flow: **Choose Event → Define Needs → Find Vendors → Book**.
- Display event progress using compact status chips.
- Keep the selected event context visible on procurement-related pages.

### Deliverables

- Organizer dashboard.
- Create/select Large Event flow.
- Frontend validation for event name, date, venue, budget, and expected guests.

### Acceptance Criteria

- Organizer cannot proceed to procurement without a selected `eventId`.
- Event cards show title, date, venue, budget, and overall procurement status.
- Create Event form handles loading, errors, and success states.
- Organizer screens match the Eventify dashboard layout and shared component system.

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
| Uniform UI | Use shared `Stepper`, `DataCard`, `StatusBadge`, form controls, error banners, and empty states. |

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
- Stepper and category cards use the same shared visual grammar as the rest of the app.

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
| Uniform UI | Use shared filter layout, vendor card pattern, drawer/modal styles, status badges, and skeleton cards. |

### UX Requirements

- Keep filters compact and easy to scan.
- Vendor cards must show service category, base price, rating, location/service area, and availability status.
- Highlight if a vendor matches the selected requirement budget.
- Vendor cards must use the same card structure and button placement across search, comparison, and profile review.

### Deliverables

- Vendor discovery page inside the procurement workflow.
- Vendor profile review screen.
- Filter state stored in ViewModel, not in View.

### Acceptance Criteria

- Search results update when filters change.
- No direct API calls exist inside components or views.
- User can select a vendor and continue to booking only when an event and requirement are selected.
- Vendor search, profile, and comparison UI feel visually connected to the Organizer dashboard.

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
| Uniform UI | Use a consistent summary panel, validation alert, form pattern, and final CTA layout. |

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
- Booking summary, validation, and confirmation screens match the Eventify component system.

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
| Uniform UI | Use shared dashboard shell, tabs, cards, detail drawer, status badges, and response action buttons. |

### Deliverables

- Vendor B2B dashboard.
- Booking request detail drawer.
- Accept, decline, and request-change actions.

### Acceptance Criteria

- Vendor can distinguish B2B bookings from personal customer bookings immediately.
- Updating a booking status updates UI state without full page reload.
- Status change failures roll back optimistic UI state.
- Vendor dashboard uses the same dashboard shell and card system as Organizer screens, while preserving role-specific labels.

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
| Uniform UI | Use one timeline pattern, one contract card pattern, and the shared status map. |

### Deliverables

- Event portfolio page.
- Contract status panel.
- Booking lifecycle timeline.

### Acceptance Criteria

- Organizer can see all Vendors tied to a Large Event.
- Each booking shows current status and latest status history.
- Contract links are visible only to authorized Organizer, Vendor, and Admin users.
- Timeline, contract, and requirement tracker visuals are consistent with earlier procurement pages.

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
| Uniform UI | Use shared settings layout, form sections, admin table styles, notification item pattern, and status badges. |

### Deliverables

- Notification center.
- Organizer and Vendor profile management pages.
- Admin/Operations screens.

### Acceptance Criteria

- Notifications update when booking statuses change.
- Vendor services can be created and edited by Vendor users.
- Admin can review bookings and verification state.
- Notifications, profiles, settings, and admin screens follow the same spacing, typography, cards, and forms.

---

## Phase 10: QA, Accessibility, Error Recovery, Responsive Polish, and Design Audit

### Objective
Harden the frontend and make the experience production-ready while ensuring every screen follows the Eventify design system.

### Implementation Tasks

| Area | Action |
|---|---|
| Accessibility | Add keyboard navigation, focus states, form labels, ARIA for dialogs, and contrast checks. |
| Responsiveness | Optimize layouts for mobile, tablet, laptop, and desktop. |
| Error handling | Standardize error banners, toast messages, empty states, retry flows, and expired session handling. |
| Testing | Add unit tests for ViewModels and integration tests for main flows. |
| Performance | Add route-level lazy loading, memoized derived values, and minimized re-rendering. |
| Design audit | Check all pages against `docs/DESIGN_SYSTEM.md` and remove duplicate one-off styling. |

### Deliverables

- Tested and polished core flows.
- Consistent error states.
- Responsive layouts.
- Final design uniformity pass.

### Acceptance Criteria

- Organizer can complete event creation to booking request without broken UI states.
- Vendor can review and respond to request on mobile and desktop.
- No page contains direct database access or direct API calls inside View files.
- All pages use shared components or documented feature-level extensions.
- No major visual mismatch exists between landing, auth, organizer, vendor, admin, and settings screens.

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
| Documentation | Maintain `docs/ROUTES.md`, `docs/DESIGN_SYSTEM.md`, feature README files, and UI component usage notes. |
| Release checklist | Verify auth, route guards, booking lifecycle, Vendor dashboard, RLS-backed access, responsive design, and visual consistency. |

### Final Acceptance Criteria

- Production build passes.
- Environment variables are documented.
- Core B2B procurement flow works end-to-end against deployed backend and Supabase.
- All routes are documented and protected according to role.
- Landing, auth, dashboards, procurement, booking, portfolio, notification, profile, settings, and admin pages follow one uniform Eventify design system.
