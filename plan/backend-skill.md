# Eventify Backend Skill Documentation

## Role
Backend Engineer

## Description
The Backend Engineer is responsible for secure, scalable server-side logic, API design, middleware, validation, error handling, and seamless integration with Supabase Auth, Supabase Database, Supabase Storage, and Supabase Edge Functions.

## Primary Mission
Build a reliable Express API that powers Eventify's Organizer Vendor Procurement workflow while enforcing role-based access, validating all B2B booking rules, and keeping the database lifecycle auditable.

---

## Backend Architecture Principles

| Principle | Requirement |
|---|---|
| Thin controllers | Controllers only parse request context, call services, and return responses. |
| Service-owned business logic | Services enforce Organizer/Vendor/Admin rules and booking lifecycle transitions. |
| Repository-owned data access | Repositories are the only feature files that read/write Supabase tables. |
| Central validation | Validators reject invalid request payloads before controller logic. |
| Middleware security | Auth, role checks, rate limits, and errors are handled by shared middleware. |
| No direct frontend database access for sensitive workflows | Booking and contract actions must go through the API. |
| RLS-aware backend | Backend must respect Supabase RLS and use service role only for controlled admin/server operations. |

---

## Strict Backend Directory Structure

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

## Directory Purpose

| Directory/File | Purpose |
|---|---|
| `config/env.js` | Loads and validates environment variables. |
| `config/supabase.js` | Exports Supabase clients and central connection settings. |
| `shared/middleware/auth.middleware.js` | Verifies Supabase JWT and attaches authenticated user to request. |
| `shared/middleware/role.middleware.js` | Restricts routes to Organizer, Vendor, or Admin. |
| `shared/middleware/error.middleware.js` | Converts thrown errors into consistent JSON responses. |
| `shared/middleware/validate.middleware.js` | Runs schema validation before controllers. |
| `shared/utils/appError.js` | Defines application error class with status code and error code. |
| `shared/utils/asyncHandler.js` | Wraps async route handlers to avoid repetitive try/catch. |
| `shared/utils/logger.js` | Standardizes structured logs. |
| `*.routes.js` | Defines endpoint paths and attaches middleware. |
| `*.controller.js` | Receives HTTP request, calls service, returns HTTP response. |
| `*.service.js` | Owns business logic, authorization checks, status transitions, and orchestration. |
| `*.repository.js` | Encapsulates Supabase database reads/writes. |
| `*.validator.js` | Defines request body, params, and query validation schemas. |
| `app.js` | Registers middleware and routes. |
| `server.js` | Starts the HTTP server. |

---

## Backend Layer Rules

### Routes

Routes define URL paths and middleware order.

```js
router.post(
  '/procurement-requests',
  authenticate,
  requireRole('organizer'),
  validate(createProcurementRequestSchema),
  createProcurementRequest
)
```

Routes must not contain business logic or database calls.

### Controllers

Controllers must be thin.

```js
export const createProcurementRequest = asyncHandler(async (req, res) => {
  const result = await vendorProcurementService.createRequest({
    actor: req.user,
    payload: req.body
  })

  return sendCreated(res, result)
})
```

Controllers must not perform direct Supabase queries.

### Services

Services own business rules.

```js
async function createRequest({ actor, payload }) {
  const organizer = await organizerRepository.findByUserId(actor.id)
  if (!organizer) throw new AppError('Organizer profile not found', 404)

  const event = await eventRepository.findOwnedEvent(payload.eventId, organizer.id)
  if (!event) throw new AppError('Large Event not found or not owned by Organizer', 404)

  const requirement = await requirementRepository.findByEvent(payload.requirementId, event.id)
  if (!requirement) throw new AppError('Requirement does not belong to selected Large Event', 400)

  return bookingRepository.createB2BBooking({
    eventId: event.id,
    requirementId: requirement.id,
    vendorId: payload.vendorId,
    organizerId: organizer.id,
    notes: payload.notes,
    requestedBudget: payload.requestedBudget
  })
}
```

Services must validate ownership and allowed state transitions.

### Repositories

Repositories perform database operations only.

```js
async function createB2BBooking(input) {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      event_id: input.eventId,
      requirement_id: input.requirementId,
      vendor_id: input.vendorId,
      organizer_id: input.organizerId,
      booking_type: 'B2B',
      status: 'pending',
      notes: input.notes,
      requested_budget: input.requestedBudget
    })
    .select('*')
    .single()

  if (error) throw mapSupabaseError(error)
  return data
}
```

Repositories must not know about Express `req` or `res`.

---

## Supabase Integration Standards

### Client Types

| Client | Use Case | Rule |
|---|---|---|
| User-scoped Supabase client | Operations that should respect user JWT and RLS. | Preferred for normal user actions. |
| Service-role Supabase client | Controlled server operations, admin tasks, triggers, and secure file URL generation. | Never expose to frontend. Use only in backend. |

### Security Rules

- Never return service role key to frontend.
- Never trust `organizerId`, `vendorId`, or `role` from request body.
- Derive actor identity from JWT.
- Validate ownership in service layer even if RLS exists.
- Keep RLS enabled as defense-in-depth.

---

## API Response Standard

### Success Response

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "req_123"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_INVALID_EVENT",
    "message": "Booking request must be linked to a valid Large Event."
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

---

## Core Endpoint Standards

| Feature | Endpoint | Role | Notes |
|---|---|---|---|
| Auth profile | `GET /auth/me` | Authenticated | Returns user profile and role. |
| Events | `POST /events` | Organizer | Creates Large Event. |
| Requirements | `POST /events/:eventId/requirements` | Organizer | Adds procurement need. |
| Vendor search | `GET /vendors` | Organizer/Admin | Supports category, location, budget, rating, availability. |
| Booking request | `POST /procurement-requests` | Organizer | Creates B2B booking. |
| Vendor queue | `GET /vendor/bookings?type=B2B` | Vendor | Shows Organizer/Large Event requests. |
| Status response | `PATCH /vendor/bookings/:bookingId/status` | Vendor | Accept, reject, request changes. |
| Portfolio | `GET /events/:eventId` | Organizer/Admin | Includes requirements, bookings, contracts, statuses. |
| Contract | `POST /bookings/:bookingId/contracts` | Vendor/Admin | Links contract record. |
| Notifications | `GET /notifications` | Authenticated | Returns user notifications. |

---

## Booking Lifecycle Enforcement

### Required Status Transition Map

```txt
pending
├── accepted
│   └── contract_sent
│       └── confirmed
│           └── completed
├── rejected
└── changes_requested
    └── pending

Any active state may become cancelled only with proper actor permission and reason.
```

### Rules

- Organizer creates `pending` requests.
- Vendor can accept, reject, or request changes.
- Contract can only be created after acceptance.
- Organizer or Admin confirms contract state according to business rules.
- Every status change writes to `booking_status_history`.
- Every meaningful status change creates a notification.

---

## Middleware Requirements

| Middleware | Required Behavior |
|---|---|
| `authenticate` | Validates bearer token and attaches `req.user`. |
| `requireRole` | Blocks users without required role. |
| `validate` | Validates body, params, and query before controller. |
| `rateLimit` | Protects auth, search, booking creation, and status updates. |
| `errorMiddleware` | Normalizes all thrown errors. |
| `requestLogger` | Logs method, path, request ID, status, latency, and actor ID when available. |

---

## Validation Standards

Every endpoint must validate:

- Params such as `eventId`, `bookingId`, and `vendorId` are UUIDs.
- Required body fields exist.
- Enum fields use allowed values.
- Query filters are bounded and paginated.
- Strings are trimmed and length-limited.
- Numeric values are non-negative and within reasonable limits.

---

## Testing Responsibilities

| Test Type | Scope |
|---|---|
| Unit tests | Services, validators, status transition rules. |
| Repository tests | Supabase query mapping and error mapping. |
| Route tests | Auth, roles, validation, response shape. |
| Security tests | Wrong role, missing token, invalid ownership, cross-tenant access. |
| Lifecycle tests | Create booking, accept, contract sent, confirmed, completed. |

---

## Backend Definition of Done

A backend feature is complete only when:

- Route, controller, service, repository, and validator are implemented.
- Auth and role middleware are attached.
- Input validation rejects invalid payloads.
- Ownership and status rules are enforced in the service layer.
- Repository handles Supabase errors safely.
- Success and error responses match standard format.
- Status-changing actions create audit/history records.
- Tests or documented test cases are included.
- No service role secret is exposed.
