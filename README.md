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
│       │   ├── contract-booking/
│       │   ├── landing/
│       │   ├── notifications/
│       │   ├── organizer-dashboard/
│       │   ├── vendor-b2b-dashboard/
│       │   └── vendor-procurement/
│       ├── services/        # API client + service classes
│       ├── shared/          # Reusable components
│       └── routes/          # Route registry with guards
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

6. Start frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. Open http://localhost:5173

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

## Build

```bash
cd frontend
npm run build   # TypeScript check + Vite production build
```
