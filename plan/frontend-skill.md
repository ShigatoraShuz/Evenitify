# Eventify Frontend Skill

## Skill Purpose
Use this skill when implementing, refactoring, or reviewing the Eventify frontend. The goal is to keep the application consistent, professional, MVVM-compliant, and visually uniform across the landing page, authentication flow, Organizer dashboard, Vendor B2B dashboard, procurement workspace, booking flow, portfolio tracking, notifications, profiles, settings, and Admin/Operations screens.

Eventify is not a generic booking app. It is a B2B Organizer Vendor Procurement system for large-scale events.

---

## Required Frontend Standards

| Area | Standard |
|---|---|
| Framework | React + TypeScript |
| Build Tool | Vite |
| Architecture | Strict MVVM with feature folders |
| Styling | Tailwind CSS using shared Eventify design tokens |
| Routing | React Router or route registry through `src/routes/index.tsx` |
| Forms | React Hook Form + Zod or equivalent validation layer |
| Data Access | Services called through ViewModels only |
| Auth | Supabase Auth consumed through `authService` and route guards |
| Components | Shared UI primitives first; feature components only when truly feature-specific |

---

## Eventify Design Identity

### Product Feel
Eventify must feel like a clean, modern, B2B SaaS procurement platform. It should be minimalist, professional, and structured, but still visually distinct.

### Visual Direction

| Element | Rule |
|---|---|
| Background | Use light neutral surfaces: `bg-slate-50`, `bg-white`, or subtle section contrast. |
| Headings | Use dark slate text with strong hierarchy. |
| Body text | Use muted slate text and concise descriptions. |
| Cards | Use white cards, soft border, rounded corners, and subtle shadow. |
| Buttons | Use shared variants only. Do not create one-off button styles. |
| Badges | Use one status badge map for all statuses. |
| Forms | Use consistent labels, helper text, validation, and spacing. |
| Icons | Use a single line-icon style consistently. |
| Layout | Use spacious sections, clear page headers, and predictable card grids. |

### Suggested Tailwind Classes

```txt
Page shell: min-h-screen bg-slate-50 text-slate-950
Card: rounded-2xl border border-slate-200 bg-white shadow-sm
Muted card: rounded-2xl border border-slate-200 bg-slate-50
Primary button: bg-indigo-600 text-white hover:bg-indigo-700
Secondary button: border border-slate-200 bg-white text-slate-900 hover:bg-slate-50
Ghost button: text-slate-600 hover:bg-slate-100 hover:text-slate-950
Input: rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500
Error text: text-sm text-rose-600
Helper text: text-sm text-slate-500
Page title: text-2xl md:text-3xl font-semibold tracking-tight text-slate-950
Section title: text-xl md:text-2xl font-semibold tracking-tight text-slate-950
Body text: text-sm md:text-base text-slate-600
```

---

## Strict MVVM Rules

### Model Layer
Models contain only pure TypeScript data definitions and constants.

Allowed:

- interfaces
- types
- enums
- constants
- default values
- static option lists
- status maps

Not allowed:

- React hooks
- API calls
- navigation calls
- localStorage access
- Supabase calls
- browser side effects
- JSX

### ViewModel Layer
ViewModels own behavior and state.

Allowed:

- `useState`, `useEffect`, `useMemo`, `useCallback`
- validation orchestration
- service calls
- loading/error/success state
- routing handlers
- UI state such as modal open/close and active tab
- mapping API data to view-ready data

Not allowed:

- long JSX layout
- duplicated model types
- direct DOM manipulation unless absolutely necessary
- styling decisions that belong in shared components

### View Layer
Views assemble sections and pass props.

Allowed:

- layout composition
- rendering data from ViewModel
- passing handlers to components
- semantic HTML sections

Not allowed:

- direct API calls
- Supabase calls
- business logic
- validation logic
- complex mapping logic
- one-off hardcoded design systems

### Component Layer
Components are reusable presentational building blocks.

Allowed:

- display props
- local visual-only state when necessary
- small UI interactions such as toggling a menu passed from ViewModel

Not allowed:

- service calls
- business workflows
- role permission logic
- app-level route decisions

---

## Required Folder Pattern

Every feature must follow this structure:

```txt
src/features/<feature-name>/
├── components/
├── models/
├── viewmodels/
└── views/
```

Shared reusable components go here:

```txt
src/shared/components/
src/shared/layout/
src/shared/constants/
src/shared/styles/
src/shared/types/
```

Services go here:

```txt
src/services/
```

Routes go here:

```txt
src/routes/index.tsx
```

---

## Shared UI Component Rules

Use shared UI primitives before creating feature-specific components.

| Component | Requirement |
|---|---|
| `Button` | Must support `primary`, `secondary`, `ghost`, and `danger` variants. |
| `Input` | Must support label, helper text, error text, disabled, and loading states. |
| `Select` | Must visually match `Input`. |
| `Modal` | Must have consistent overlay, panel radius, header, body, footer, and close behavior. |
| `StatusBadge` | Must use a central status-to-color map. |
| `PageHeader` | Must provide consistent title, subtitle, optional eyebrow, and action slot. |
| `DashboardShell` | Must wrap authenticated Organizer, Vendor, Admin, and settings pages. |
| `PublicShell` | Must wrap landing/auth public pages when useful, but landing may use custom full-width sections. |
| `DataCard` | Must standardize cards for events, requirements, vendors, bookings, and contracts. |
| `EmptyState` | Must provide title, short description, optional icon, and optional CTA. |
| `LoadingSkeleton` | Must match the final page layout. |
| `ErrorBanner` | Must show clear, actionable errors. |
| `Stepper` | Must be reused for procurement, booking, and onboarding flows. |

Do not duplicate these styles inside feature files.

---

## Landing Page Rules

The landing page is the public marketing entry for Eventify.

### Required Files

```txt
src/features/landing/models/landing.models.ts
src/features/landing/viewmodels/useLandingViewModel.ts
src/features/landing/views/LandingView.tsx
src/features/landing/views/LandingViewWrapper.tsx
src/features/landing/components/LandingNavbar.tsx
src/features/landing/components/LandingHero.tsx
src/features/landing/components/LandingWorkflow.tsx
src/features/landing/components/LandingFeatureGrid.tsx
src/features/landing/components/LandingRoleCards.tsx
src/features/landing/components/LandingCTASection.tsx
src/features/landing/components/LandingFooter.tsx
```

### Required Sections

| Section | Rule |
|---|---|
| Navbar | Sticky public nav with Eventify branding, links, Login, Register, and mobile hamburger. |
| Hero | Explain large event vendor procurement clearly. |
| Workflow | Show Create Event → Add Requirements → Discover Vendors → Send Booking Request → Track Portfolio. |
| Feature Grid | Preview procurement workspace, vendor discovery, booking request flow, vendor dashboard, portfolio tracking, and contract visibility. |
| Role Cards | Show Organizer, Vendor, and Admin/Operations entry points. |
| CTA Section | Add trust stats and final Organizer/Vendor CTAs. |
| Footer | Dark footer with Eventify branding and simple links. |

### Landing Design Rules

- Do not use `DashboardShell`.
- Use full-width marketing sections.
- Use generous spacing and strong headline hierarchy.
- Keep descriptions short.
- Use the same brand colors and components as the rest of the app.
- CTAs route to `/register` for unauthenticated users.
- Authenticated users should route to their proper dashboard when existing auth logic is available.

---

## Auth Screen Rules

Auth pages must feel connected to the landing page.

| Screen | Rule |
|---|---|
| Login | Use centered card or split layout with concise copy and Eventify branding. |
| Register | Include role selection or role-specific CTA path. |
| Forgot Password | Use same card/form pattern as login. |
| Role Selection | Use the same role-card style as landing. |

Auth screens must use shared form controls, shared buttons, consistent error messages, and no direct Supabase calls in Views.

---

## Dashboard Rules

Authenticated pages must use `DashboardShell` unless there is a documented reason not to.

### DashboardShell Must Include

- role-aware navigation
- Eventify branding
- active route state
- account/profile area
- responsive mobile navigation
- consistent content container

### Page Header Pattern

Every authenticated page should start with `PageHeader`.

Required header structure:

```txt
Eyebrow or role label
Main page title
Short helper subtitle
Optional primary action button
```

---

## Organizer UI Rules

Organizer screens must always communicate the event-first workflow.

| Area | Rule |
|---|---|
| Dashboard | Show large event cards and procurement progress. |
| Event setup | Use clear create/select event flow. |
| Procurement | Keep selected event visible. |
| Requirements | Group by category and show status, budget, quantity, and booking count. |
| Vendor search | Highlight vendor match to selected requirement. |
| Booking | Always show event, requirement, vendor, budget, and status summary. |
| Portfolio | Show requirement fulfillment, bookings, contracts, and timeline. |

---

## Vendor UI Rules

Vendor pages must clearly distinguish B2B Organizer bookings from personal customer bookings.

| Area | Rule |
|---|---|
| Dashboard | Use B2B queue-first layout. |
| Labels | Use `Organizer Booking`, `Large Event`, and `B2B Procurement`. |
| Request cards | Show event name, date, venue, expected guests, category, budget, and notes. |
| Actions | Accept, decline, and request changes must be visually clear. |
| Services | Use consistent service cards and editable form sections. |
| Verification | Use shared verification badges and status descriptions. |

---

## Admin UI Rules

Admin/Operations screens must feel operational and audit-friendly.

| Area | Rule |
|---|---|
| Users | Use tables with filters and role/status badges. |
| Vendors | Show verification status and action controls. |
| Bookings | Use searchable booking oversight table. |
| Issues | Use clear priority/status tags. |
| Audit | Keep layouts dense but readable. |

Admin screens should not introduce a separate design style. They must use the same shell, cards, filters, tables, and badges.

---

## Forms and Validation Rules

All forms must use the same structure.

```txt
Label
Input/select/textarea
Optional helper text
Validation error text
```

Validation errors must be specific and actionable.

Do not use generic messages like:

```txt
Invalid input
Something went wrong
```

Use messages like:

```txt
Event date is required.
Maximum budget must be greater than minimum budget.
Select a vendor before submitting a booking request.
```

---

## Loading, Empty, Error, and Success States

| State | Required Pattern |
|---|---|
| Loading | Use skeletons that match the final layout. |
| Empty | Use `EmptyState` with one clear CTA. |
| Error | Use `ErrorBanner` or toast with retry action when possible. |
| Success | Use success toast, inline confirmation, or redirect with state. |
| Disabled | Buttons must clearly show disabled/loading states. |

---

## Responsive Rules

Build mobile-first.

| Breakpoint | Rule |
|---|---|
| Mobile | Single-column layouts, collapsible nav, full-width CTAs. |
| Tablet | Two-column cards when space allows. |
| Desktop | Multi-column dashboards, sidebars, filters, and drawers. |
| Large desktop | Use max-width containers; avoid overly stretched content. |

No page should require horizontal scrolling except wide data tables, and tables must have responsive wrappers.

---

## Accessibility Rules

Every implementation must include:

- visible focus states
- semantic headings
- form labels
- keyboard-accessible menus and dialogs
- ARIA attributes for dialogs and disclosure menus when needed
- sufficient text contrast
- descriptive button text
- no color-only status communication

---

## Routing Rules

- Route definitions belong in `src/routes/index.tsx`.
- Use lazy-loaded views when possible.
- `/` must load the landing page publicly.
- Auth routes must be public.
- Organizer routes must use Organizer guard.
- Vendor routes must use Vendor guard.
- Admin routes must use Admin guard.
- Catch-all route must come last.

---

## API and Service Rules

Views and components must never call APIs directly.

Correct flow:

```txt
View → ViewModel → Service → API Client → Backend/Supabase
```

Wrong flow:

```txt
View → API Client
Component → Supabase
View → fetch()
```

Services must return typed data and consistent error shapes.

---

## Tailwind Rules

Allowed:

- Tailwind utilities
- shared class constants when repeated
- small component-level class composition
- design tokens documented in shared constants

Avoid:

- random per-page color choices
- one-off card styles
- inconsistent spacing
- repeated long class strings when a shared component exists
- inline styles unless absolutely required

---

## Naming Rules

| Type | Pattern |
|---|---|
| Component | `PascalCase.tsx` |
| View | `<Feature>View.tsx` |
| View wrapper | `<Feature>ViewWrapper.tsx` |
| ViewModel | `use<Feature>ViewModel.ts` or `use<Feature>.ts` |
| Model | `<feature>.models.ts` |
| Service | `<feature>Service.ts` |
| Constants | `<feature>.constants.ts` or shared constants file |

Use named exports only unless the project already has a documented exception.

---

## Page Build Checklist

Before finishing any page, verify:

- The page follows MVVM.
- The View has no API call.
- The View has no Supabase call.
- The ViewModel owns state, validation, effects, and handlers.
- The Model owns types and constants only.
- Shared UI components are used before custom styles.
- The page uses the Eventify color, spacing, card, button, and badge system.
- Loading, empty, error, and success states exist.
- Mobile layout works.
- Focus states and labels are present.
- The route is documented.
- `npm run build` passes.

---

## Design Uniformity Review Checklist

Use this checklist at the end of every phase.

| Check | Pass Condition |
|---|---|
| Shared buttons | No custom CTA style exists when shared `Button` can be used. |
| Shared cards | Cards have consistent border, radius, shadow, padding, and header layout. |
| Shared badges | Status badges use the centralized status map. |
| Shared forms | Inputs, selects, labels, errors, and helper text match everywhere. |
| Shared shell | Authenticated pages use `DashboardShell`. |
| Landing consistency | Landing uses the same brand tokens but keeps a marketing layout. |
| Role clarity | Organizer, Vendor, and Admin labels are clear. |
| Mobile quality | Layout stacks cleanly and nav is usable. |
| Accessibility | Keyboard and screen-reader basics are covered. |
| No one-off styles | Any custom style has a documented reason. |

---

## Commit Rule

Each completed phase must be verified and committed before moving to the next phase.

Recommended format:

```bash
git add .
git commit -m "frontend/<short-phase-description>"
```

Examples:

```bash
git commit -m "frontend/add-design-system-foundation"
git commit -m "frontend/add-public-landing-page"
git commit -m "frontend/add-auth-role-routing"
git commit -m "frontend/add-organizer-dashboard"
```

---

## Final Reminder

Eventify must look like one product. Do not let each phase create a different visual style. Landing, auth, dashboards, procurement, booking, portfolio, notifications, profile, settings, and admin screens must all share the same design language, component system, and interaction patterns.
