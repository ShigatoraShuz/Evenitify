# Eventify Frontend Integration Readiness Checklist

## Overview

This document audits every frontend service method against:
- Expected backend endpoint (method + path)
- Current implementation status (mock-only, hybrid, apiClient-ready)
- Whether mock data is hardcoded in Views/Components

---

## Service-by-Service Audit

### authService (`src/services/authService.ts`)

| Method | Endpoint | Status | Notes |
|---|---|---|---|
| `register` | `POST /auth/register` | Mock-only | Mock adapter returns static session |
| `login` | `POST /auth/login` | Mock-only | Mock adapter determines role by email |
| `getMe` | `GET /auth/me` | Mock-only | Reads from localStorage `auth_user_cache` |
| `syncProfile` | `POST /auth/sync-profile` | Mock-only | Returns static user |
| `refreshSession` | `POST /auth/refresh` | **Missing** | Not implemented - needs addition |
| `logout` | `POST /auth/logout` | **Missing** | Not implemented - needs addition |

### eventService (`src/services/eventService.ts`)

| Method | Endpoint | Status | Notes |
|---|---|---|---|
| `listEvents` | `GET /events` | Mock-only | |
| `getEvent` | `GET /events/:eventId` | Mock-only | |
| `getEventPortfolio` | `GET /events/:eventId/portfolio` | Mock-only | |
| `getDashboardSummary` | `GET /events/dashboard/summary` | Mock-only | |
| `createEvent` | `POST /events` | Mock-only | |
| `updateEvent` | `PATCH /events/:eventId` | Mock-only | |

### vendorService (`src/services/vendorService.ts`)

| Method | Endpoint | Status | Notes |
|---|---|---|---|
| `searchVendors` | `GET /vendors?category=&location=...` | Mock-only | |
| `getVendorProfile` | `GET /vendors/:vendorId` | Mock-only | |
| `listRequirements` | `GET /events/:eventId/requirements` | Mock-only | Belongs in eventService |
| `createRequirement` | `POST /events/:eventId/requirements` | Mock-only | Belongs in eventService |
| `updateRequirement` | `PATCH /requirements/:requirementId` | Mock-only | Belongs in eventService |
| `deleteRequirement` | `DELETE /requirements/:requirementId` | Mock-only | Belongs in eventService |
| `getProfile` | `GET /vendor/profile` | Mock-only | |
| `updateProfile` | `PATCH /vendor/profile` | Mock-only | |
| `listServices` | `GET /vendor/services` | Mock-only | |
| `createService` | `POST /vendor/services` | Mock-only | |
| `updateService` | `PATCH /vendor/services/:serviceId` | Mock-only | |

### bookingService (`src/services/bookingService.ts`)

| Method | Endpoint | Status | Notes |
|---|---|---|---|
| `createBookingRequest` | `POST /procurement-requests` | Mock-only | |
| `getBooking` | `GET /procurement-requests/:bookingId` | Mock-only | |
| `getEventBookings` | `GET /events/:eventId/bookings` | Mock-only | |
| `listVendorB2BBookings` | `GET /vendor/bookings?status=` | Mock-only | |
| `getVendorBookingDetail` | `GET /vendor/bookings/:bookingId` | Mock-only | |
| `updateBookingStatus` | `PATCH /vendor/bookings/:bookingId/status` | Mock-only | |

### contractService (`src/services/contractService.ts`)

| Method | Endpoint | Status | Notes |
|---|---|---|---|
| `createContract` | `POST /contracts/:bookingId` | Mock-only | |
| `getContractByBooking` | `GET /contracts/:bookingId` | Mock-only | |
| `updateContractStatus` | `PATCH /contracts/:contractId/status` | Mock-only | |
| `signContractOrganizer` | `PATCH /contracts/:contractId/sign-organizer` | Mock-only | |
| `signContractVendor` | `PATCH /contracts/:contractId/sign-vendor` | Mock-only | |

### notificationService (`src/services/notificationService.ts`)

| Method | Endpoint | Status | Notes |
|---|---|---|---|
| `listNotifications` | `GET /notifications?page=&limit=` | Mock-only | |
| `getUnreadCount` | `GET /notifications/unread-count` | Mock-only | |
| `markAsRead` | `PATCH /notifications/:notificationId/read` | Mock-only | |
| `markAllAsRead` | `PATCH /notifications/read-all` | Mock-only | |

### adminService (`src/services/adminService.ts`)

| Method | Endpoint | Status | Notes |
|---|---|---|---|
| `getDashboardSummary` | `GET /admin/dashboard/summary` | Mock-only | |
| `getUsers` | `GET /admin/users` | Mock-only | Pagination params sent but not used by mock |
| `getEvents` | `GET /admin/events` | Mock-only | |
| `getBookings` | `GET /admin/bookings` | Mock-only | |
| `getVendors` | `GET /admin/vendors` | Mock-only | |
| `updateVendorVerification` | `PATCH /admin/vendors/:vendorId/verification` | Mock-only | |
| `overrideBookingStatus` | `PATCH /admin/bookings/:bookingId/override-status` | Mock-only | |

### profileService (`src/services/profileService.ts`) — ⚠️ NOT API-READY

| Method | Endpoint | Status | Notes |
|---|---|---|---|
| `getOrganizerProfile` | **No endpoint** | localStorage-only | Bypasses apiClient entirely |
| `updateOrganizerProfile` | **No endpoint** | localStorage-only | Bypasses apiClient entirely |
| `getVendorProfile` | **No endpoint** | localStorage-only | Bypasses apiClient entirely |
| `updateVendorProfile` | **No endpoint** | localStorage-only | Bypasses apiClient entirely |
| `getAdminSettings` | **No endpoint** | localStorage-only | Bypasses apiClient entirely |
| `updateAdminSettings` | **No endpoint** | localStorage-only | Bypasses apiClient entirely |

### onboardingService (`src/services/onboardingService.ts`) — ⚠️ NOT API-READY

| Method | Endpoint | Status | Notes |
|---|---|---|---|
| `getStatus` | **No endpoint** | localStorage-only | Bypasses apiClient entirely |
| `completeOrganizerProfile` | **No endpoint** | localStorage-only | Bypasses apiClient entirely |
| `completeVendorProfile` | **No endpoint** | localStorage-only | Bypasses apiClient entirely |

---

## Mock Data in Views/Components

| File | Line(s) | Issue |
|---|---|---|
| `src/shared/components/DashboardShell.tsx` | 13-21, 23-27 | `getUserRole()` reads `auth_user_cache` from localStorage directly instead of using `useAuthSession` ViewModel |
| `src/shared/components/DashboardShell.tsx` | 24-26 | `logout()` manipulates localStorage directly instead of calling `authService.logout()` |

**No hardcoded mock data arrays found in Views or Components.** All mock data lives in `src/services/mock/mockData.ts` and is served through the mock adapter.

---

## Backend Endpoints Still Expected

### Auth Endpoints
| Method | Path | Expected In |
|---|---|---|
| POST | `/auth/register` | Phase 5+ backend |
| POST | `/auth/login` | Phase 5+ backend |
| GET | `/auth/me` | Phase 5+ backend |
| POST | `/auth/sync-profile` | Phase 5+ backend |
| POST | `/auth/refresh` | **Missing from service** |
| POST | `/auth/logout` | **Missing from service** |

### Profile Endpoints
| Method | Path | Expected In |
|---|---|---|
| GET | `/organizer/profile` | Needs addition to profileService |
| PATCH | `/organizer/profile` | Needs addition to profileService |
| GET | `/vendor/profile` | Already in vendorService |
| PATCH | `/vendor/profile` | Already in vendorService |
| GET | `/admin/settings` | Needs addition to adminService |
| PATCH | `/admin/settings` | Needs addition to adminService |
| GET | `/onboarding/status` | Needs addition |
| POST | `/onboarding/complete` | Needs addition |

### Event Endpoints
| Method | Path | Expected In |
|---|---|---|
| GET | `/events` | eventService ✅ |
| POST | `/events` | eventService ✅ |
| GET | `/events/:eventId` | eventService ✅ |
| PATCH | `/events/:eventId` | eventService ✅ |
| GET | `/events/dashboard/summary` | eventService ✅ |
| GET | `/events/:eventId/portfolio` | eventService ✅ |
| GET | `/events/:eventId/requirements` | vendorService (consider moving to eventService) |
| POST | `/events/:eventId/requirements` | vendorService (consider moving to eventService) |
| PATCH | `/requirements/:requirementId` | vendorService (consider moving to eventService) |
| DELETE | `/requirements/:requirementId` | vendorService (consider moving to eventService) |

### Vendor Endpoints
| Method | Path | Expected In |
|---|---|---|
| GET | `/vendors` | vendorService ✅ |
| GET | `/vendors/:vendorId` | vendorService ✅ |
| GET | `/vendor/services` | vendorService ✅ |
| POST | `/vendor/services` | vendorService ✅ |
| PATCH | `/vendor/services/:serviceId` | vendorService ✅ |

### Booking Endpoints
| Method | Path | Expected In |
|---|---|---|
| POST | `/procurement-requests` | bookingService ✅ |
| GET | `/procurement-requests/:bookingId` | bookingService ✅ |
| GET | `/events/:eventId/bookings` | bookingService ✅ |
| GET | `/vendor/bookings` | bookingService ✅ |
| GET | `/vendor/bookings/:bookingId` | bookingService ✅ |
| PATCH | `/vendor/bookings/:bookingId/status` | bookingService ✅ |

### Contract Endpoints
| Method | Path | Expected In |
|---|---|---|
| POST | `/contracts/:bookingId` | contractService ✅ |
| GET | `/contracts/:bookingId` | contractService ✅ |
| PATCH | `/contracts/:contractId/status` | contractService ✅ |
| PATCH | `/contracts/:contractId/sign-organizer` | contractService ✅ |
| PATCH | `/contracts/:contractId/sign-vendor` | contractService ✅ |

### Notification Endpoints
| Method | Path | Expected In |
|---|---|---|
| GET | `/notifications` | notificationService ✅ |
| GET | `/notifications/unread-count` | notificationService ✅ |
| PATCH | `/notifications/:notificationId/read` | notificationService ✅ |
| PATCH | `/notifications/read-all` | notificationService ✅ |

### Admin Endpoints
| Method | Path | Expected In |
|---|---|---|
| GET | `/admin/dashboard/summary` | adminService ✅ |
| GET | `/admin/users` | adminService ✅ |
| GET | `/admin/events` | adminService ✅ |
| GET | `/admin/bookings` | adminService ✅ |
| GET | `/admin/vendors` | adminService ✅ |
| PATCH | `/admin/vendors/:vendorId/verification` | adminService ✅ |
| PATCH | `/admin/bookings/:bookingId/override-status` | adminService ✅ |

---

## Readiness Score

| Area | Score | Action Needed |
|---|---|---|
| Auth service | 4/6 methods | Add `refreshSession`, `logout` |
| Event service | 6/6 methods ✅ | |
| Vendor service | 11/11 methods ✅ | |
| Booking service | 6/6 methods ✅ | |
| Contract service | 5/5 methods ✅ | |
| Notification service | 4/4 methods ✅ | |
| Admin service | 7/7 methods ✅ | |
| Profile service | **0/6 methods** 🚫 | Full rewrite to apiClient pattern |
| Onboarding service | **0/3 methods** 🚫 | Full rewrite to apiClient pattern |

**Overall**: 43/54 service methods (80%) are `apiClient`-ready. 11 methods need migration.
