# Eventify Frontend API Contracts

## Overview

This document maps all expected backend endpoints against frontend service methods. Each entry shows:
- HTTP method and path
- Frontend service method
- Request and response types
- Current implementation status

---

## Contract Registry

All API contracts are also defined programmatically in `src/services/apiContracts.ts`.

| Method | Path | Service Method | Status |
|---|---|---|---|
| POST | /auth/register | authService.register | mock |
| POST | /auth/login | authService.login | mock |
| GET | /auth/me | authService.getMe | mock |
| POST | /auth/sync-profile | authService.syncProfile | mock |
| POST | /auth/refresh | authService.refreshSession | **missing** |
| POST | /auth/logout | authService.logout | **missing** |
| GET | /onboarding/status | onboardingService.getStatus | mock |
| POST | /onboarding/complete | onboardingService.completeOrganizerProfile / completeVendorProfile | mock |
| GET | /organizer/profile | profileService.getOrganizerProfile | mock |
| PATCH | /organizer/profile | profileService.updateOrganizerProfile | mock |
| GET | /vendor/profile | vendorService.getProfile / profileService.getVendorProfile | mock |
| PATCH | /vendor/profile | vendorService.updateProfile / profileService.updateVendorProfile | mock |
| GET | /admin/settings | profileService.getAdminSettings | mock |
| PATCH | /admin/settings | profileService.updateAdminSettings | mock |
| GET | /events | eventService.listEvents | mock |
| POST | /events | eventService.createEvent | mock |
| GET | /events/:eventId | eventService.getEvent | mock |
| PATCH | /events/:eventId | eventService.updateEvent | mock |
| GET | /events/dashboard/summary | eventService.getDashboardSummary | mock |
| GET | /events/:eventId/portfolio | eventService.getEventPortfolio | mock |
| GET | /events/:eventId/requirements | vendorService.listRequirements | mock |
| POST | /events/:eventId/requirements | vendorService.createRequirement | mock |
| PATCH | /requirements/:requirementId | vendorService.updateRequirement | mock |
| DELETE | /requirements/:requirementId | vendorService.deleteRequirement | mock |
| GET | /vendors | vendorService.searchVendors | mock |
| GET | /vendors/:vendorId | vendorService.getVendorProfile | mock |
| GET | /vendor/services | vendorService.listServices | mock |
| POST | /vendor/services | vendorService.createService | mock |
| PATCH | /vendor/services/:serviceId | vendorService.updateService | mock |
| POST | /procurement-requests | bookingService.createBookingRequest | mock |
| GET | /procurement-requests/:bookingId | bookingService.getBooking | mock |
| GET | /events/:eventId/bookings | bookingService.getEventBookings | mock |
| GET | /vendor/bookings | bookingService.listVendorB2BBookings | mock |
| GET | /vendor/bookings/:bookingId | bookingService.getVendorBookingDetail | mock |
| PATCH | /vendor/bookings/:bookingId/status | bookingService.updateBookingStatus | mock |
| POST | /contracts/:bookingId | contractService.createContract | mock |
| GET | /contracts/:bookingId | contractService.getContractByBooking | mock |
| PATCH | /contracts/:contractId/status | contractService.updateContractStatus | mock |
| PATCH | /contracts/:contractId/sign-organizer | contractService.signContractOrganizer | mock |
| PATCH | /contracts/:contractId/sign-vendor | contractService.signContractVendor | mock |
| GET | /notifications | notificationService.listNotifications | mock |
| GET | /notifications/unread-count | notificationService.getUnreadCount | mock |
| PATCH | /notifications/:notificationId/read | notificationService.markAsRead | mock |
| PATCH | /notifications/read-all | notificationService.markAllAsRead | mock |
| GET | /admin/dashboard/summary | adminService.getDashboardSummary | mock |
| GET | /admin/users | adminService.getUsers | mock |
| GET | /admin/events | adminService.getEvents | mock |
| GET | /admin/bookings | adminService.getBookings | mock |
| GET | /admin/vendors | adminService.getVendors | mock |
| PATCH | /admin/vendors/:vendorId/verification | adminService.updateVendorVerification | mock |
| PATCH | /admin/bookings/:bookingId/override-status | adminService.overrideBookingStatus | mock |
| GET | /reports/:role | reportService placeholder / useReports | partial |
| POST | /reports/:role/export | future report export endpoint | partial |
| GET | /documents | documentService.listDocuments | partial |
| POST | /documents/mock-upload | documentService.mockUpload | partial |
| GET | /audit/activity | auditService.listActivities | partial |
| GET | /realtime/snapshot | realtimeService.getSnapshot | partial |

---

## Response Shape

All API responses follow the standard shape defined in `src/services/types.ts`:

```typescript
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: ApiError
  meta?: Record<string, unknown>
}

interface ApiError {
  code: string
  message: string
  details?: unknown
}
```

Paginated responses follow `PaginatedResponse<T>`:

```typescript
interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

---

## Switching from Mock to Real API

Use frontend-safe variables only:

| Variable | Purpose |
|---|---|
| `VITE_API_MODE=mock` | Use typed mock adapter responses. Best for demos and static previews. |
| `VITE_API_MODE=local` | Call a local backend, defaulting to `http://localhost:4000/api` when `VITE_API_BASE_URL` is empty. |
| `VITE_API_MODE=production` | Call `VITE_API_BASE_URL` or `/api` in production hosting. |
| `VITE_USE_MOCKS=true` | Backward-compatible mock mode switch. `VITE_API_MODE` takes precedence. |
| `VITE_API_BASE_URL` | Backend API base URL. |

All real API responses are expected to use the normalized `ApiResponse<T>` shape. The frontend service methods unwrap `data` through `apiClient.ts` and throw normalized error messages.
