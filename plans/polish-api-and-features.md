# Polish API & Features

## Audit Summary
- **~37 of ~40 features** have working API data flow (service → viewmodel → view)
- **4 error-handling gaps** found in viewmodels
- **0 missing API endpoints** — all frontend calls map to existing backend routes
- **0 type mismatches** — Phase A fixes already applied

---

## Critical Fixes (4 items)

### 1. `useVendorMarketplaceViewModel.ts` — `submitRequest()`
- **File:** `frontend/src/features/organizer/vendor-marketplace/viewmodels/useVendorMarketplaceViewModel.ts`
- **Line:** ~627
- **Issue:** `vendorRequestService.sendBookingRequest()` called without try/catch
- **Impact:** If API fails → unhandled promise rejection, user gets no feedback
- **Fix:** Wrap call in try/catch, set error state on failure

### 2. `useEventPortfolio.ts` — `uploadDocument()`
- **File:** `frontend/src/features/contract-booking/viewmodels/useEventPortfolio.ts`
- **Line:** ~109
- **Issue:** `documentService.uploadDocument()` called without try/catch
- **Impact:** If upload fails → unhandled rejection, document list never refreshes
- **Fix:** Wrap call in try/catch, set error state on failure

### 3. `usePlanEventViewModel.ts` — `loadDraft()` silent error swallow
- **File:** `frontend/src/features/organizer/plan-event/viewmodels/usePlanEventViewModel.ts`
- **Line:** ~333
- **Issue:** `.catch(() => {})` silently swallows all draft load errors
- **Impact:** User never knows if draft load failed
- **Fix:** Remove empty catch or log error / surface to user

### 4. `useVendorMarketplaceViewModel.ts` — `sendGeneralInquiry()` silent error
- **File:** `frontend/src/features/organizer/vendor-marketplace/viewmodels/useVendorMarketplaceViewModel.ts`
- **Line:** ~667
- **Issue:** try/catch catches but does nothing with API errors
- **Impact:** User gets no feedback if inquiry fails
- **Fix:** Surface error to user (toast or state)

---

## Nice-to-Have Improvements (3 items)

### 5. Add `buildViewModelStateMeta` to 3 viewmodels
- `useOrganizerProfile.ts`
- `useAdminSettings.ts`
- `useVendorComparison.ts`
- Adds consistent `isLoading`, `isError`, `isSuccess`, `isEmpty`, `status` properties

### 6. Standardize error handling pattern in `usePlanEventViewModel.ts`
- Currently mixes `try/catch` with `.then()/.catch()` — pick one pattern

### 7. Route duplication warning (no code change)
- `/organizer/vendor-requests` registered in both `phase8.routes.js` and `marketplace-compat.routes.js`
- Monitor for behavioral conflicts

---

## Files to Modify

| File | Type | Priority |
|------|------|----------|
| `useVendorMarketplaceViewModel.ts` | Error fix | **High** |
| `useEventPortfolio.ts` | Error fix | **High** |
| `usePlanEventViewModel.ts` | Error fix | **Medium** |
| `useOrganizerProfile.ts` | Consistency | Low |
| `useAdminSettings.ts` | Consistency | Low |
| `useVendorComparison.ts` | Consistency | Low |

---

## Verification
- `npm run build` — must pass zero errors
- `npm test` — existing tests must pass (12/12)
