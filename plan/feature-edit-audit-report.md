# EVENTIFY — COMPLETE AUDIT REPORT

## A. Overall Status

**PARTIALLY COMPLETE**

The application has a solid foundation with many features implemented, but has significant gaps in Vendor B2B Dashboard separation (Feature 2) and database schema alignment (Feature 3). Feature 1 is largely complete.

---

## B. Feature Compliance Table

### Feature 1: Organizer-Specific Procurement UI

| Requirement | Current Status | Evidence | Problem Found | Required Change | Priority |
|---|---|---|---|---|---|
| Create a Large Event | ✅ Complete | `EventSetupBuilder.tsx` (7-step wizard), `POST /events` | Uses "Create Event" / "Build event" labels; no explicit "Large Event" branding | Rename to "Create Large Event" for clarity | Low |
| Add event details (name, date, venue, location, budget, guests) | ✅ Complete | `EventSetupBuilder` Step 3 + `large_events` table columns | None | None | N/A |
| Add required services (catering, AV, lighting, security, etc.) | ✅ Complete | `EventSetupBuilder` Step 5 + `event_requirements` table + `POST /events/:eventId/requirements` | None | None | N/A |
| Search or browse vendors | ✅ Complete | `VendorProcurementView` Step 2 + `GET /vendors` with filters | None | None | N/A |
| Select vendors | ✅ Complete | Vendor selection in Step 2 of procurement | None | None | N/A |
| Create + send Vendor Request / RFQ | ✅ Complete | `VendorProcurementView` Step 1 (requirements = RFQ) + Step 3 (booking request) | No explicit "RFQ" terminology; requirements function as RFQs but lack a formal RFQ entity | Add RFQ label/badge to clarify intent | Low |
| Review vendor quotes | ✅ Complete | Match scores, service prices, availability shown on vendor cards | No formal "quote" object; prices read from `vendor_services.base_price` | Acceptable for current scope | Low |
| Award a vendor | ✅ Complete | Step 3 submits booking request → booking created | None | None | N/A |
| View booking + contract inside Event Portfolio | ✅ Complete | `EventPortfolioView` with 9 tabs, inline contracts, signing flow | None | None | N/A |
| Every RFQ tied to `event_id` | ✅ Complete | `event_requirements.event_id` FK → `large_events.id`, `bookings.event_id` FK | Uses `requirement_id` instead of `request_id` | Acceptable variation | Low |
| Organizer flow not feel like generic marketplace | ✅ Complete | Entire procurement wizard is event-centric, not vendor-catalog-centric | None | None | N/A |

### Feature 2: Vendor B2B Dashboard

| Requirement | Current Status | Evidence | Problem Found | Required Change | Priority |
|---|---|---|---|---|---|
| Incoming Requests | ✅ Complete | "All bookings" section with 7 status tabs | None | None | N/A |
| Large Event Requests tab/filter | ⚠️ Partial | "Large event opportunities" section (threshold: >=500 guests or >=$25k budget) | It's a filtered section, not a tab; threshold-based, not type-based | Add explicit "Large Event" filter tab alongside status tabs | High |
| Personal Event Requests tab/filter | ❌ Missing | No UI for personal events; `booking_type` enum has `PERSONAL` but a CHECK constraint forces `booking_type = 'B2B'` | Complete absence of personal event concept | Create separate "Standard / Personal" category + remove/relax CHECK constraint | High |
| Request Detail page | ❌ Missing | Detail is inline only in the dashboard | No standalone detail page for URL sharing/deep-linking | This is architecture choice; can remain inline | Low |
| Submit Quote flow | ❌ Missing | Vendors can only `accept/reject/request_changes`; no pricing negotiation | No formal quote submission with pricing by vendor | Add vendor-side quote/price submission before acceptance | High |
| Quote status tracking | ❌ Missing | No `quotes` table; booking status tracks the lifecycle | Missing quote-specific status flow | Add `quotes` table or extend booking model | High |
| Contract review/signing flow | ✅ Complete | ContractTimeline + "Sign as vendor" button | None | None | N/A |
| Request card shows event name | ✅ Complete | `BookingChip` components show all fields | None | None | N/A |
| Request card shows organizer name | ✅ Complete | `card.organizer` field shown | None | None | N/A |
| Request card shows service needed | ✅ Complete | `card.category` shown | None | None | N/A |
| Request card shows budget range | ✅ Complete | Budget chip shows `$` value | None | None | N/A |
| Request card shows event date | ✅ Complete | Date chip shown | None | None | N/A |
| Request card shows request deadline | ❌ Missing | No `deadline` field on bookings or requirements | Missing data model | Add `response_deadline` column to bookings table | High |
| Request card shows request type | ❌ Missing | No "Large Event" vs "Personal Event" badge/label | No type differentiation at all | Badge showing "Organizer / Large Event" or "Personal / Standard" | High |
| Large Event visually distinct from Personal Event | ❌ Missing | No distinction exists | No styling/badge difference | Implement distinct badges, colored tabs, and icons per type | High |
| Clear labels, badges, tabs, or filters | ⚠️ Partial | Status tabs exist; type distinction missing | Missing type tabs | Add type tabs (All / Large Event / Personal) | High |
| Vendor knows B2B vs personal instantly | ❌ Missing | All requests appear as B2B | No personal context | Add type indicator on every request card | High |

### Feature 3: Contract & Booking Linking

| Requirement | Current Status | Evidence | Problem Found | Required Change | Priority |
|---|---|---|---|---|---|
| Mark quote as awarded | ⚠️ Partial | Booking status tracks acceptance | No `quotes` table; no separate "award" step | Create quote awarding flow or add "awarded" status | High |
| Create booking automatically | ✅ Complete | `POST /procurement-requests` creates booking with status `pending` | None | None | N/A |
| Link booking to `event_id` | ✅ Complete | `bookings.event_id` FK | None | None | N/A |
| Link booking to `request_id` | ❌ Missing | No `request_id` column; uses `requirement_id` instead | No `procurement_requests` table | Add `procurement_requests` table or accept `requirement_id` | Medium |
| Link booking to `quote_id` | ❌ Missing | `quotes` table does not exist | No quote concept at all | Create `quotes` table | High |
| Link booking to `vendor_id` | ✅ Complete | `bookings.vendor_id` FK → `vendor_profiles.id` | None | None | N/A |
| Create/link contract to booking | ✅ Complete | `contracts.booking_id` FK (UNIQUE) | None | None | N/A |
| Show booking + contract in Event Portfolio | ✅ Complete | Bookings tab + Contracts tab | None | None | N/A |
| Database relationship chain: Event → Requirement → Procurement Request → Quote → Booking → Contract → Portfolio | ❌ Broken | Missing: `procurement_requests`, `request_vendors`, `quotes` tables. Chain is: Event → Requirement → Booking → Contract | 3 missing tables, different relationship model | Add missing tables or document alternative chain | High |

---

## C. Missing or Incomplete Features

### Critical (Blocks core requirements)

1. **Vendor Dashboard lacks "Personal Event" separation** — No concept of personal/standard events exists. The `booking_type` enum has `PERSONAL` but a CHECK constraint `booking_type_for_event` forces `booking_type = 'B2B'` on all records. No vendor UI shows personal events.

2. **No `quotes` table or vendor quote submission flow** — Vendors cannot submit quotes with pricing. They can only accept/reject/request changes. The requirement specifically calls for a "Submit Quote flow" and "Quote status tracking."

3. **No `procurement_requests` / `request_vendors` tables** — The required chain `Event → Requirement → Procurement Request → Quote → Booking → Contract` is broken. Current chain is `Event → Requirement → Booking → Contract` with no explicit procurement request or quote entities.

4. **No request type badge/label** — Vendor requests cards do not show "Large Event" vs "Personal Event" badges.

5. **No request deadline field** — Neither `bookings` nor `event_requirements` have a `response_deadline` / `request_deadline` column.

### Moderate

6. **No dedicated pages** for: booking detail, contract detail, vendor request detail, submit quote, category management, audit logs. These exist inline only.

7. **No `service_categories` table** — Categories are stored as a plain `text` column on `vendor_services`. No referential integrity for category values.

8. **`contracts` table missing direct `event_id`** and `vendor_id` foreign keys** — These are only reachable via `bookings` join, making querying less efficient.

### Low

9. Terminology: "Create Event" rather than "Create Large Event"; no "RFQ" labeling.

10. `category` values in `event_requirements` and `vendor_services` are free-text, not standardized.

---

## D. Required Code Changes

### Frontend Changes

| # | File | Change | Why | Risk |
|---|---|---|---|---|
| 1 | `VendorB2BDashboardView.tsx` | Add "Request Type" tabs row: **All** / **Large Event** / **Personal Event** before the status tabs; filter `requestCards` by type | Feature 2 requires clear type separation | Medium |
| 2 | `VendorB2BDashboardView.tsx` | Add request type badge (`"Large Event"` or `"Personal Event"`) on each request card using `booking_type` field | Vendor must instantly know if request is B2B or personal | Low |
| 3 | `VendorB2BDashboardView.tsx` | Add "Submit Quote" action for `pending` bookings with a form modal (price, notes, timeline) | Feature 2 requires quote submission flow | High |
| 4 | `vendor-b2b-dashboard.model.ts` | Add `requestType` field to `VendorB2BBooking` type; add `B2B_TABS` entry for type filtering | Support type-based filtering | Low |
| 5 | `useVendorB2BDashboard.ts` | Add `requestType` filter to `loadBookings` API call | Fetch filtered data from backend | Medium |
| 6 | `VendorProcurementView.tsx` | Add explicit "RFQ" label/badge to Step 1 requirements | Clarify intent of requirement creation | Low |
| 7 | `EventSetupBuilder.tsx` | Rename "Create Event" button to "Create Large Event" | Matching project terminology | Low |

### Backend Changes

| # | File | Change | Why | Risk |
|---|---|---|---|---|
| 8 | `vendor-b2b-dashboard.repository.js` | Add `booking_type` filter param to `listB2BBookings()`; change return data to include `booking_type` field | Support type filtering and display | Medium |
| 9 | `vendor-b2b-dashboard.service.js` | Add `submitQuote(actor, bookingId, payload)` method that creates a quote record | Formal vendor quote submission | High |
| 10 | `vendor-b2b-dashboard.controller.js` | Add `POST /vendor/bookings/:bookingId/quote` endpoint | API for vendor quote submission | High |
| 11 | `vendor-b2b-dashboard.routes.js` | Add route for quote submission | Wire up the new endpoint | Medium |
| 12 | `contract-booking.service.js` | After contract is signed, update booking `status` to `confirmed` (already done in `signContractVendor`) | Verify this works end-to-end | Low |
| 13 | All backend files | Remove or relax the `booking_type = 'B2B'` CHECK constraint in service-level validation | Allow PERSONAL bookings to be created | High |

---

## E. Database Fixes Needed

### Missing Tables

| Table | Fields Needed | Purpose | Priority |
|---|---|---|---|
| `procurement_requests` | `id`, `event_id` FK, `organizer_id` FK, `title`, `description`, `status`, `deadline`, `created_at`, `updated_at` | Formal RFQ entity for the organizer to bundle requirements | High |
| `request_vendors` | `id`, `request_id` FK, `vendor_id` FK, `status`, `invited_at`, `responded_at` | Junction between procurement requests and selected vendors | High |
| `quotes` | `id`, `request_id` FK, `vendor_id` FK, `event_requirement_id` FK, `price`, `notes`, `status`, `valid_until`, `created_at`, `updated_at` | Vendor's formal price quote for a requirement | High |
| `service_categories` | `id`, `name`, `description`, `icon` | Normalized service category lookup | Medium |

### Missing Columns

| Table | Column | Type | Priority |
|---|---|---|---|
| `bookings` | `response_deadline` | `timestamptz` nullable | High |
| `bookings` | `request_type` | derived from `booking_type` | High |
| `contracts` | `event_id` | FK → `large_events(id)` (denormalized for query performance) | Low |
| `contracts` | `vendor_id` | FK → `vendor_profiles(id)` (denormalized for query performance) | Low |

### Broken Constraints

| Constraint | File | Issue | Fix |
|---|---|---|---|
| `booking_type_for_event` CHECK | `0006_create_bookings_contracts_notifications.sql:13` | Forces `booking_type = 'B2B'` on ALL bookings, making `PERSONAL` enum value unusable | `ALTER TABLE public.bookings DROP CONSTRAINT booking_type_for_event;` |
| RLS policy: organizers can only create B2B bookings | `0008_enable_rls.sql:137` | Blocks creation of PERSONAL bookings by organizers | Update policy to allow both `booking_type` values |

---

## F. UI/UX Fixes Needed

### Vendor Dashboard (Highest Priority)

| # | Fix | Location |
|---|---|---|
| 1 | Add request type tab bar: **All** | **Large Event** | **Personal Event** | Above status tabs in `VendorB2BDashboardView.tsx` |
| 2 | Add colored badge to each request card: `🟦 Large Event` (blue) or `🟩 Personal Event` (green) | Each card in the request cards grid |
| 3 | Add "Submit Quote" button + modal (price, terms, valid until) for `pending` bookings | Selected booking action panel |
| 4 | Add `response_deadline` countdown indicator on pending request cards | Each pending request card |
| 5 | Move "Large event opportunities" to a dedicated tab rather than a separate section | Tab bar |

### Organizer Dashboard

| # | Fix | Location |
|---|---|---|
| 6 | Rename "Create Event" → "Create Large Event" | `EventSetupBuilder.tsx` submit button + header |
| 7 | Add "RFQ" label/badge to requirements in procurement Step 1 | `VendorProcurementView.tsx` Step 1 |

### Event Portfolio

| # | Fix | Location |
|---|---|---|
| 8 | Add `booking_type` badge to each booking card in the Bookings tab | `EventPortfolioView.tsx` Bookings tab |

---

## G. Final Recommendation

**The application does NOT fully satisfy the project requirements. Significant work is needed, particularly on:**

1. **FEATURE 2 (Vendor B2B Dashboard)** — The biggest gap. There is no "Personal Event" concept anywhere. The vendor dashboard treats all requests as B2B/organizer-based. The requirement specifically calls for a clear separation between "Organizer/Large Event requests" and "Personal Event/Standard Customer requests." This affects ~40% of the vendor-facing UI.

2. **FEATURE 3 (Database Chain)** — Three required tables are missing (`procurement_requests`, `request_vendors`, `quotes`). The booking-to-contract flow works, but without a proper RFQ → Quote → Award progression, the system skips key procurement steps.

3. **Quote Flow** — Vendors cannot submit quotes with their own pricing. This is a core B2B procurement feature.

**Estimated effort to fix:** 3-5 days for a single developer
- Database schema changes: 1 day
- Backend API changes: 1-2 days
- Frontend UI changes: 1-2 days

**What works well (no changes needed):**
- Event creation flow
- Event requirement/planning
- Vendor search and comparison
- Booking creation
- Contract lifecycle (create, send, sign)
- Event Portfolio view
- Admin operations (vendor verification, booking override)
- Notifications, messaging, audit
- Authentication and onboarding

**Recommendation:** Prioritize the database schema additions first (`procurement_requests`, `request_vendors`, `quotes`, `service_categories`), then the vendor quote submission flow, then the UI separation of Large Event vs Personal Event requests.
