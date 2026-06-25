# OpenCode Refactoring & Latency Cleanup

## Overview
Comprehensive cleanup of the Eventify codebase: fix critical bugs, add chat feature, remove dead code, compact long lines, and verify build.

---

## Phase A: Critical Bug Fixes (4 files)

### A1. `vendor-comparison.model.ts`
- **Issue:** `import type { VendorSearchResult }` on line 43, after module code — violates ES module syntax, breaks compilation
- **Fix:** Move import to top of file (line 3)

### A2. `vendorService.ts`
- **Issue:** `VendorProfile` type uses snake_case (`business_name`, `service_area`) but backend returns camelCase (`businessName`, `serviceArea`)
- **Fix:** Update type to match backend actual response

### A3. `profileService.ts`
- **Issue:** `VendorProfile` type expects fields backend never returns (`id`, `website`, `address`, `createdAt`, `updatedAt`); misses backend fields (`verificationStatus`, `isVerified`, `rating`, `services`)
- **Fix:** Align type with backend reality

### A4. `LoginViewWrapper.tsx`
- **Issue:** Uses `user.role` (singular) instead of `getUserRoles(user)` for post-login navigation
- **Fix:** Use `getUserRoles(user)` to properly detect role from `roles` array

---

## Phase B: Chat Feature - Vendor↔Organizer (4 files)

### B1. `communicationService.ts`
- **Issue:** Missing `createBookingMessage` method — backend has `POST /bookings/:bookingId/messages`
- **Fix:** Add method calling the existing backend endpoint

### B2. `useVendorB2BDashboard.ts` (viewmodel)
- **Issue:** No send message callback exposed to the view
- **Fix:** Add `sendBookingMessage(text)` that calls the new service method and refreshes messages

### B3. `VendorBookingsView.tsx`
- **Issue:** `<BookingMessageThread>` receives no `onSendMessage` prop, so `MessageComposer` (send UI) is hidden
- **Fix:** Pass `onSendMessage={onSendBookingMessage}` to enable message sending

### B4. `VendorBookingsViewWrapper.tsx`
- **Issue:** Must wire the `onSendBookingMessage` callback from viewmodel to view
- **Fix:** Pass through the prop

---

## Phase C: Dead Code Removal (7 files)

| File | Remove |
|------|--------|
| `organizerDashboardService.ts` | 8 unused methods (keep only `getDashboardData`) |
| `bookingService.ts` | 4 unused methods (`getBooking`, `getEventBookings`, `updateBookingStatus`, `awardVendor`) |
| `eventBriefService.ts` | 3 dead methods (`create`, `update`, `delete` - target non-existent endpoints) |
| `vendorService.ts` | 4 dead methods (`getProfile`, `updateProfile`, `updateRequirement`, `updateService`) |
| `vendorMarketplaceService.ts` | `getById` |
| `documentService.ts` | `listByOwner` (duplicate of `listDocuments`) |
| `VendorMarketplaceViewWrapper.tsx` | Dead `handleSelectExistingEvent` block (unused variable, identical branches) |

---

## Phase D: Minor Fixes (3 files)

| File | Fix |
|------|-----|
| `bookingService.ts` | Add proper generic types to `viewVendorRequest`, `submitQuote` (currently return `unknown`) |
| `ChooseRoleViewWrapper.tsx` | Add error handling for failed `chooseRoles()` call |
| `vite-env.d.ts` | Remove stale `VITE_USE_MOCKS` type definition |

---

## Phase E: Compact Long Lines

Reformat 20 files with className strings and text descriptions exceeding 200 characters. Use:
- Class arrays with `.join(' ')` for long Tailwind class strings (safe for v3 static extraction)
- String concatenation for long description text
- Multi-line formatting for complex CSS gradient values

Files targeted (by longest line):
1. `components/ui/eventify-landing-page.tsx` (365)
2. `shared/components/OrganizerUI.tsx` (355)
3. `shared/components/Input.tsx` (349)
4. `features/.../vendor-marketplace/components/VendorCard.tsx` (306)
5. `shared/components/DashboardShell.tsx` (303)
6. `shared/components/Button.tsx` (295)
7. `features/.../vendor-status/components/VendorRequestCard.tsx` (294)
8. `features/onboarding/views/OnboardingView.tsx` (275)
9. `features/notifications/components/NotificationDropdown.tsx` (273)
10. `shared/components/DocumentComponents.tsx` (269)
11. `features/.../vendor-marketplace/viewmodels/useVendorMarketplaceViewModel.ts` (260)
12. `shared/components/Select.tsx` (260)
13. `features/vendor-procurement/views/VendorProcurementView.tsx` (258)
14. `features/user-settings/views/VendorProfileView.tsx` (254)
15. `components/ui/hero-3.tsx` (242)
16. `features/.../vendor-marketplace/components/VendorMarketplaceFilters.tsx` (238)
17. `features/.../vendor-b2b-dashboard/components/ServicePackageForm.tsx` (229)
18. `shared/components/RealtimeIndicator.tsx` (224)
19. `features/.../vendor-marketplace/components/SelectEventBriefModal.tsx` (223)
20. `shared/components/Toast.tsx` (222)

---

## Phase F: Verification

- Run `npm run build` (`tsc -b && vite build`) — must pass zero errors
- Run `npm test` — existing tests must pass

---

## File Change Summary

| Phase | Files | Type |
|-------|-------|------|
| A | 4 | Bug fixes |
| B | 4 | Chat feature |
| C | 7 | Dead code removal |
| D | 3 | Minor fixes |
| E | ~20 | Line compaction |
| F | 0 | Verification |
| **Total** | **~38** | |
