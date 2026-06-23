# Eventify Backend Incremental Development Plan

## Project Context
Eventify uses a Node.js Express backend to coordinate secure server-side logic, API validation, Supabase Auth verification, Supabase Database access, booking lifecycle rules, notifications, and selected Supabase Edge Functions for serverless jobs.

## Backend Stack

| Area | Standard |
|---|---|
| Runtime | Node.js LTS |
| Framework | Express.js |
| Database/Auth | Supabase PostgreSQL + Supabase Auth |
| Serverless Support | Supabase Edge Functions for async or event-triggered workflows |
| Validation | Zod, Joi, Yup, or express-validator |
| Security | JWT verification, role middleware, RLS-aware data access, rate limiting |
| Testing | Jest/Vitest + Supertest |
| Documentation | OpenAPI-compatible route documentation |

## Target Backend Directory

```txt
src/
├── config/
│   ├── env.js
│   └── supabase.js
├── shared/
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── error.middleware.js
│   │   ├── rate-limit.middleware.js
│   │   └── validate.middleware.js
│   └── utils/
│       ├── appError.js
│       ├── asyncHandler.js
│       ├── logger.js
│       └── response.js
├── auth/
│   ├── auth.routes.js
│   ├── auth.controller.js
│   ├── auth.service.js
│   ├── auth.repository.js
│   └── auth.validator.js
├── organizer-events/
│   ├── organizer-events.routes.js
│   ├── organizer-events.controller.js
│   ├── organizer-events.service.js
│   ├── organizer-events.repository.js
│   └── organizer-events.validator.js
├── vendor-procurement/
│   ├── vendor-procurement.routes.js
│   ├── vendor-procurement.controller.js
│   ├── vendor-procurement.service.js
│   ├── vendor-procurement.repository.js
│   └── vendor-procurement.validator.js
├── vendor-b2b-dashboard/
│   ├── vendor-b2b-dashboard.routes.js
│   ├── vendor-b2b-dashboard.controller.js
│   ├── vendor-b2b-dashboard.service.js
│   ├── vendor-b2b-dashboard.repository.js
│   └── vendor-b2b-dashboard.validator.js
├── contract-booking/
│   ├── contract-booking.routes.js
│   ├── contract-booking.controller.js
│   ├── contract-booking.service.js
│   ├── contract-booking.repository.js
│   └── contract-booking.validator.js
├── notifications/
│   ├── notifications.routes.js
│   ├── notifications.controller.js
│   ├── notifications.service.js
│   ├── notifications.repository.js
│   └── notifications.validator.js
├── admin/
│   ├── admin.routes.js
│   ├── admin.controller.js
│   ├── admin.service.js
│   ├── admin.repository.js
│   └── admin.validator.js
├── app.js
└── server.js
```

---

## Phase 1: Backend Foundation and Express Scaffold

### Objective
Create a secure, testable Express foundation with clean module boundaries and Supabase connectivity.

### Implementation Tasks

| Task | Action |
|---|---|
| Express app | Create `app.js` with JSON parser, CORS, request logging, route mounting, and error middleware. |
| Server bootstrap | Create `server.js` that loads environment variables and starts the server. |
| Supabase client | Create `config/supabase.js` with anon client and service-role admin client. |
| Environment validation | Validate required env vars at boot: Supabase URL, anon key, service role key, JWT secret or JWKS config, client origin. |
| Shared utilities | Add `AppError`, `asyncHandler`, response helper, and logger. |
| Health endpoint | Add `GET /health` returning API status, version, and timestamp. |

### Deliverables

- Running Express server.
- Supabase client wrapper.
- Standard error response shape.
- Health check endpoint.

### Acceptance Criteria

- `npm run dev` starts the API.
- Missing environment variables fail fast.
- All thrown errors return a consistent JSON response.

---

## Phase 2: Authentication, JWT Verification, and Role Middleware

### Objective
Verify Supabase Auth sessions and enforce role-based access across Organizer, Vendor, and Admin routes.

### Implementation Tasks

| Area | Action |
|---|---|
| Auth middleware | Read `Authorization: Bearer <token>` and verify it with Supabase Auth. |
| Request context | Attach `req.user = { id, email, role }`. |
| Role middleware | Implement `requireRole('organizer')`, `requireRole('vendor')`, and `requireRole('admin')`. |
| Profile bootstrap | Create user profile after registration or first login if missing. |
| Auth endpoints | Add `GET /auth/me`, `POST /auth/sync-profile`, and optional `PATCH /auth/role` for controlled role assignment. |

### Deliverables

- Secure auth middleware.
- Role-gated route protection.
- Current user endpoint.

### Acceptance Criteria

- Invalid token returns `401`.
- Wrong role returns `403`.
- Valid Organizer, Vendor, and Admin users receive correct route access.

---

## Phase 3: Organizer Profiles and Large Event APIs

### Objective
Expose APIs for Organizer profile management and Large Event creation/selection.

### Endpoints

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/organizer/profile` | Organizer | Fetch Organizer profile. |
| PATCH | `/organizer/profile` | Organizer | Update Organizer profile. |
| GET | `/events` | Organizer | List Organizer Large Events. |
| POST | `/events` | Organizer | Create Large Event. |
| GET | `/events/:eventId` | Organizer/Admin | Fetch event portfolio summary. |
| PATCH | `/events/:eventId` | Organizer | Update Large Event details. |

### Business Rules

- Organizer can only read and update their own events.
- Event date must be valid and cannot be in the past unless Admin overrides.
- Event budget and expected guests must be positive values.
- Event status starts as `draft` or `planning`.

### Acceptance Criteria

- Created events are linked to the Organizer profile.
- Organizer cannot access another Organizer's Large Event.
- Event portfolio response is ready for frontend dashboard consumption.

---

## Phase 4: Event Requirement APIs

### Objective
Support category-based event procurement requirements.

### Endpoints

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/events/:eventId/requirements` | Organizer/Admin | List requirements for event. |
| POST | `/events/:eventId/requirements` | Organizer | Create requirement. |
| PATCH | `/requirements/:requirementId` | Organizer | Update requirement. |
| DELETE | `/requirements/:requirementId` | Organizer | Remove draft requirement. |

### Business Rules

- Requirement must belong to an event owned by the Organizer.
- Category must be one of the supported procurement categories.
- Quantity must be greater than zero.
- `min_budget` must be less than or equal to `max_budget`.
- Requirement cannot be deleted after an accepted booking unless Admin resolves it.

### Acceptance Criteria

- Requirements are always tied to a valid `eventId`.
- Invalid budget ranges are rejected.
- Frontend receives requirement list grouped by category.

---

## Phase 5: Vendor Profile, Vendor Services, and Discovery APIs

### Objective
Create searchable Vendor service listings and return matching vendors for Organizer procurement.

### Endpoints

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/vendors` | Organizer/Admin | Search Vendors by filter. |
| GET | `/vendors/:vendorId` | Organizer/Vendor/Admin | Fetch Vendor profile and services. |
| GET | `/vendor/profile` | Vendor | Fetch own Vendor profile. |
| PATCH | `/vendor/profile` | Vendor | Update own Vendor business information. |
| GET | `/vendor/services` | Vendor | List own services. |
| POST | `/vendor/services` | Vendor | Create service listing. |
| PATCH | `/vendor/services/:serviceId` | Vendor | Update service listing. |

### Search Filters

| Filter | Description |
|---|---|
| `category` | Matches requirement category. |
| `location` | Matches service area. |
| `minBudget` / `maxBudget` | Finds services within budget range. |
| `rating` | Minimum Vendor rating. |
| `availability` | Available, limited, unavailable. |
| `verificationStatus` | Verified or pending verification. |

### Acceptance Criteria

- Vendor results do not expose sensitive account fields.
- Vendor users can only update their own Vendor profile and services.
- Search results are ordered by verification, availability, rating, and price fit.

---

## Phase 6: Organizer B2B Booking Request API

### Objective
Create B2B booking requests that link Organizer event portfolio, requirement, Vendor, status, and future contract record.

### Endpoints

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/procurement-requests` | Organizer | Create B2B booking request. |
| GET | `/procurement-requests/:bookingId` | Organizer/Vendor/Admin | Fetch booking details. |
| GET | `/events/:eventId/bookings` | Organizer/Admin | List bookings under event portfolio. |

### Required Booking Fields

| Field | Rule |
|---|---|
| `eventId` | Must exist and belong to Organizer. |
| `requirementId` | Must belong to `eventId`. |
| `vendorId` | Must exist and be active. |
| `organizerId` | Derived from authenticated user, not trusted from request body. |
| `bookingType` | Must be `B2B` for this flow. |
| `status` | Starts as `pending`. |

### Business Rules

- A booking cannot be created without a valid Large Event ID.
- Duplicate pending requests to the same Vendor for the same requirement should be blocked or explicitly allowed only with a reason.
- Booking creation must also create a status history row.
- Booking creation should trigger a Vendor notification.

### Acceptance Criteria

- Booking correctly links event, requirement, Organizer, and Vendor.
- Vendor receives a notification.
- Organizer sees pending booking inside event portfolio.

---

## Phase 7: Vendor B2B Dashboard and Booking Decision API

### Objective
Allow Vendors to review B2B booking requests and respond with accepted, declined, or changes requested.

### Endpoints

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/vendor/bookings?type=B2B` | Vendor | List Vendor B2B requests. |
| GET | `/vendor/bookings/:bookingId` | Vendor | View booking details. |
| PATCH | `/vendor/bookings/:bookingId/status` | Vendor | Accept, decline, or request changes. |

### Valid Status Transitions

| From | To | Actor |
|---|---|---|
| `pending` | `accepted` | Vendor |
| `pending` | `rejected` | Vendor |
| `pending` | `changes_requested` | Vendor |
| `changes_requested` | `pending` | Organizer |
| `accepted` | `contract_sent` | Vendor/Admin |
| `contract_sent` | `confirmed` | Organizer/Admin |
| `confirmed` | `completed` | Organizer/Admin |
| Any active state | `cancelled` | Organizer/Admin with reason |

### Acceptance Criteria

- Vendor can only respond to bookings assigned to that Vendor.
- Status transition is validated.
- Status history and Organizer notification are created for every decision.

---

## Phase 8: Contract Linking, Storage, and Contract Status API

### Objective
Attach contract records and optional document URLs/files to accepted bookings.

### Endpoints

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/bookings/:bookingId/contracts` | Vendor/Admin | Create contract record or contract URL. |
| GET | `/bookings/:bookingId/contracts` | Organizer/Vendor/Admin | Fetch contract. |
| PATCH | `/contracts/:contractId/status` | Organizer/Vendor/Admin | Update contract status. |

### Supabase Storage Rules

- Create a private `contracts` bucket.
- File path format: `contracts/{bookingId}/{timestamp}-{safeFileName}`.
- Only authorized Organizer, Vendor, and Admin can access signed URLs.
- Never expose permanent public contract links.

### Acceptance Criteria

- Contract cannot be created for unrelated booking.
- Accepted booking can transition to `contract_sent`.
- Signed contract access is role-protected.

---

## Phase 9: Notifications and Supabase Edge Functions

### Objective
Provide reliable notifications and serverless workflows for status updates, reminders, and scheduled checks.

### Backend Responsibilities

| Feature | Express API | Supabase Edge Function |
|---|---|---|
| Booking created | Creates notification row during transaction-like operation. | Optional email/push notification. |
| Booking status changed | Creates status history and notification row. | Sends email to Organizer or Vendor. |
| Contract pending reminder | API exposes notification status. | Scheduled function checks pending contracts. |
| Event deadline reminder | API reads portfolio status. | Scheduled function sends reminder before event date. |

### Suggested Edge Functions

```txt
supabase/functions/
├── send-booking-notification/
├── send-contract-reminder/
├── send-event-deadline-reminder/
└── sync-notification-delivery-status/
```

### Acceptance Criteria

- Notifications are stored even if email delivery fails.
- Failed Edge Function delivery is retried or logged.
- Notification endpoint supports unread count and mark-as-read.

---

## Phase 10: Admin/Operations Backend

### Objective
Give Admin/Operations secure APIs for monitoring bookings, verifying Vendors, resolving disputes, and auditing system status.

### Endpoints

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/admin/users` | Admin | List users by role and status. |
| GET | `/admin/bookings` | Admin | Search all bookings. |
| PATCH | `/admin/vendors/:vendorId/verification` | Admin | Update Vendor verification status. |
| PATCH | `/admin/bookings/:bookingId/override-status` | Admin | Resolve booking status with audit note. |
| GET | `/admin/audit-log` | Admin | Review critical changes. |

### Acceptance Criteria

- Admin route requires Admin role.
- Every override writes an audit trail.
- Admin APIs never bypass validation silently.

---

## Phase 11: Testing, Observability, and Security Hardening

### Objective
Prove backend correctness and protect production operations.

### Implementation Tasks

| Area | Action |
|---|---|
| Unit tests | Test services and validators. |
| Integration tests | Test routes with mocked Supabase or test database. |
| Security tests | Verify unauthorized access, wrong role, invalid IDs, duplicate booking, and invalid status transitions. |
| Logging | Add request ID, user ID, route, status, and error code. |
| Rate limiting | Protect auth, booking creation, and vendor search endpoints. |
| Validation | Reject unknown fields and sanitize strings. |

### Acceptance Criteria

- Main route tests pass.
- No route leaks service role key operations to client.
- Errors do not expose stack traces in production.

---

## Final Phase: Backend Deployment and Optimization

### Objective
Deploy the API and ensure stable production runtime.

### Implementation Tasks

| Area | Action |
|---|---|
| Deployment | Deploy to Render, Railway, Fly.io, Supabase Functions, or similar platform. |
| Environment | Separate development, staging, and production env vars. |
| API docs | Publish route documentation and example request/response bodies. |
| Performance | Add pagination, query limits, indexes, caching where safe, and response compression. |
| Monitoring | Add uptime checks, error alerts, and API latency tracking. |

### Final Acceptance Criteria

- API works against production Supabase.
- Auth and role middleware protect every private route.
- Booking lifecycle is fully traceable through status history and notifications.
