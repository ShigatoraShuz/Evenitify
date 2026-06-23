# Eventify - B2B Event Vendor Procurement Platform

A full-stack platform connecting event organizers with verified vendors for large-scale events.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 3, React Router v7, Framer Motion
- **Backend**: Node.js, Express 5, Zod validation, Supabase SDK
- **Database**: PostgreSQL (via Supabase) with RLS, triggers, views, functions
- **Architecture**: MVVM frontend (models → viewmodels → views), layered backend (controller → service → repository)

## Features

### Core (Phase 1)
- Auth (register/login with JWT)
- Role-based routing (organizer, vendor, admin)
- Organizer: Create/manage large events and requirements
- Vendor: Create/manage service catalog
- Vendor discovery and search
- Booking request workflow (pending → accepted/rejected/changes_requested)
- Booking status history tracking

### Phase 2
- **Admin dashboard**: User/event/vendor/booking management, verification overrides
- **Contract workflow**: Digital contracts with organizer/vendor signing, status transitions, timeline views
- **Notification center**: In-app notifications with read/unread, priority levels, action URLs, dropdown in header
- **Enhanced dashboards**: Summary cards, booking counts, upcoming events, activity timeline
- **Vendor search**: Business name, location, availability filters; sort by rating/name
- **UX hardening**: Confirm dialogs for destructive actions, validation improvements

### Phase 3
- **Frontend audit**: MVVM boundary fixes, deduplication, shared component migration, Toast infrastructure
- **Onboarding flow**: Role-based first-time setup (organizer/vendor/admin), route guards, profile completion check
- **Event portfolio tabs**: Overview/Requirements/Vendors/Bookings/Contracts/Activity tabs with budget utilization, progress bars
- **Vendor comparison**: Side-by-side comparison table, shortlist drawer, service/rating/price comparison
- **Procurement stepper**: Enhanced step indicators, draft save/resume to sessionStorage, validation summaries, blocking state
- **Contract polish**: Expandable terms preview, disabled button tooltips, role-specific action visibility
- **Notification groups**: Today/This Week/Earlier time-based grouping
- **Profile & settings**: Role-specific profile pages (organizer/vendor/admin), edit forms, unsaved changes warning
- **Accessibility**: Modal focus trapping, aria-labels on icon-only buttons, memoized contract timeline

### Phase 4
- **Role-based views**: Separated role dashboard layouts (organizer, vendor, admin)
- **Event dashboard**: Summary stats, booking counts, upcoming events, activity timeline
- **Vendor services**: List/create/edit service catalog
- **B2B booking queue**: Status tabs (pending/accepted/rejected/changes_requested), accept/reject/request changes
- **Admin operations**: User/event/vendor/booking management, vendor verification, booking status override
- **Contract workflow**: Digital contracts with organizer/vendor signing, status transitions, timeline
- **Notification center**: In-app notifications with read/unread, priority levels, dropdown in header

### Phase 5
- **Integration readiness audit**: 9 service files audited against backend endpoints
- **API contract normalization**: Shared types (ApiError, PaginatedResponse, ServiceResult, RequestStatus), full endpoint map
- **Environment configuration**: Typed env accessors, mock mode toggle, VITE prefix validation
- **Auth session management**: AuthState enum, refresh/logout methods, role-based session guards
- **Error boundary**: Global error boundary with crash screen and retry
- **Data state consistency**: Duplicate submission prevention, localStorage services migrated to apiClient
- **Testing infrastructure**: Vitest + Testing Library setup, 7 smoke tests
- **Performance**: Unused asset removal, useMemo optimizations, lazy route verification
- **Accessibility**: Semantic HTML, aria attributes, skip-to-content link
- **Documentation**: API contracts, environment setup, smoke test procedures, phase summary

## Project Structure

```
eventify/
├── backend/
│   └── src/
│       ├── admin-operations/   # Admin user/event/vendor/booking management
│       ├── auth/              # Authentication & registration
│       ├── contract-booking/  # Booking + contract workflow
│       ├── notifications/     # Notification CRUD
│       ├── organizer-events/  # Event CRUD, portfolio, dashboard summary
│       ├── vendor-b2b-dashboard/  # Vendor profile/services/bookings
│       ├── vendor-procurement/    # Requirements, vendor search
│       ├── config/           # Supabase, Express app config
│       └── shared/           # Middleware, utilities, response helpers
├── frontend/
│   └── src/
│       ├── features/
│       │   ├── admin-operations/
│       │   ├── auth/
│   │   ├── contract-booking/
│   │   ├── landing/
│   │   ├── notifications/
│   │   ├── onboarding/
│   │   ├── organizer-dashboard/
│   │   ├── user-settings/
│   │   ├── vendor-b2b-dashboard/
│   │   ├── vendor-comparison/
│   │   └── vendor-procurement/
│       ├── config/          # Environment & API config (env.ts, apiConfig.ts)
│       ├── services/        # API client + service classes + mock adapter
│       ├── shared/          # Reusable components, hooks, utils
│       ├── routes/          # Route registry with guards
│       └── __tests__/       # Smoke tests (Vitest + Testing Library)
└── database/
    └── migrations/          # Incremental SQL migrations
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase project)

### Setup

1. Clone the repo:
   ```bash
   git clone <repo-url>
   cd eventify
   ```

2. Run database migrations:
   - Apply files in `database/migrations/` order (0001 through 0011)

3. Seed test data (optional):
   ```bash
   psql -d your_database -f database/seed.sql
   ```

4. Configure backend:
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env with your Supabase URL, anon key, and JWT secret
   ```

5. Start backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

6. Configure frontend environment:
   ```bash
   cp frontend/.env.example frontend/.env
   # VITE_USE_MOCKS=true uses mock data; set to false for real backend
   ```

7. Start frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

8. Open http://localhost:5173

### Testing

```bash
cd frontend
npm test          # Run smoke tests (7 tests)
npm run test:watch  # Watch mode
```

### Lint

```bash
cd frontend
npm run lint      # ESLint check
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/register | Register user |
| POST | /auth/login | Login |
| GET | /events | List organizer events |
| POST | /events | Create event |
| GET | /events/:id/portfolio | Event portfolio (requirements + bookings) |
| GET | /events/dashboard/summary | Organizer dashboard summary |
| GET | /events/:id/requirements | List event requirements |
| POST | /events/:id/requirements | Create requirement |
| PATCH | /requirements/:id | Update requirement |
| DELETE | /requirements/:id | Delete requirement |
| GET | /vendors | Search vendors |
| GET | /vendors/:id | Vendor profile with services |
| POST | /bookings | Create booking request |
| GET | /vendor/bookings | List vendor B2B bookings |
| PATCH | /vendor/bookings/:id/status | Update booking status |
| GET | /contracts/booking/:id | Get contract by booking |
| POST | /contracts | Create contract |
| PATCH | /contracts/:id/sign-organizer | Sign as organizer |
| PATCH | /contracts/:id/sign-vendor | Sign as vendor |
| GET | /notifications | List notifications |
| PATCH | /notifications/:id/read | Mark notification read |
| POST | /notifications/read-all | Mark all as read |
| GET | /admin/dashboard/summary | Admin dashboard summary |
| GET | /admin/users | List users |
| GET | /admin/events | List events |
| GET | /admin/bookings | List bookings |
| GET | /admin/vendors | List vendors |
| PATCH | /admin/vendors/:id/verification | Update vendor verification |
| PUT | /admin/bookings/:id/status | Override booking status |

## Frontend Routes

| Route | Access | Description |
|-------|--------|-------------|
| / | Public | Landing page |
| /login | Public | Login |
| /register | Public | Registration |
| /onboarding | Auth | Role-based profile setup |
| /organizer | Organizer, Admin | Organizer dashboard |
| /organizer/procurement | Organizer, Admin | Vendor procurement workflow |
| /organizer/portfolio | Organizer, Admin | Event portfolio (tabs) |
| /organizer/compare | Organizer, Admin | Vendor comparison |
| /organizer/profile | Organizer, Admin | Organizer profile settings |
| /vendor | Vendor | Vendor B2B dashboard |
| /vendor/profile | Vendor | Vendor profile settings |
| /admin | Admin | Admin operations dashboard |
| /admin/settings | Admin | Admin settings |
| /notifications | Auth | Notification center |

## Build

```bash
cd frontend
npm run build   # TypeScript check + Vite production build
```
