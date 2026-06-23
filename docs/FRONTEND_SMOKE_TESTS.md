# Eventify Frontend Smoke Tests

## Overview

Smoke tests verify that the frontend renders without critical errors. There are two categories:

1. **Automated tests** — Vitest + Testing Library in `src/__tests__/`
2. **Manual smoke checks** — Documented test cases for visual/functional verification

---

## Automated Tests

### Prerequisites

```bash
cd frontend
npm install
```

### Running Tests

```bash
# Run once
npm test

# Watch mode
npm run test:watch
```

### Test Files

| File | What It Tests |
|---|---|
| `src/__tests__/App.test.tsx` | App renders without crashing |
| `src/__tests__/RouteGuards.test.tsx` | Route guards render without crashing for organizer/vendor/admin roles |
| `src/__tests__/Services.test.tsx` | All service methods are properly exported |

### Adding Tests

Follow the patterns in existing test files. Use `describe`/`it`/`expect` from `vitest` and `render` from `@testing-library/react`.

---

## Manual Smoke Test Checklist

### 1. App Rendering
- [ ] Landing page loads at `/` without errors
- [ ] Login page loads at `/login`
- [ ] Register page loads at `/register`
- [ ] 404 page shows for unknown routes

### 2. Route Guards
- [ ] Unauthenticated users redirected to `/login`
- [ ] Organizer role can access `/organizer`, `/organizer/procurement`, `/organizer/portfolio`, `/organizer/compare`, `/organizer/profile`
- [ ] Vendor role can access `/vendor`, `/vendor/profile`
- [ ] Admin role can access `/admin`, `/admin/settings`
- [ ] Vendor cannot access organizer routes
- [ ] Organizer cannot access vendor routes
- [ ] Admin can access both organizer and admin routes

### 3. Dashboard Shell
- [ ] Sidebar shows correct items for each role
- [ ] Notification dropdown shows in header
- [ ] Profile menu shows with correct links
- [ ] Sign Out works and redirects to login
- [ ] Mobile sidebar toggle works

### 4. Organizer Dashboard
- [ ] Events list loads
- [ ] Create event modal works
- [ ] Event status summary displays
- [ ] Selecting an event shows portfolio

### 5. Vendor B2B Dashboard
- [ ] B2B booking queue loads
- [ ] Status tabs filter correctly
- [ ] Accept/reject/request changes buttons work
- [ ] Contract signing flow works

### 6. Admin Dashboard
- [ ] Summary statistics display
- [ ] Users, events, bookings, vendors tabs work
- [ ] Vendor verification action works
- [ ] Booking status override works

### 7. Vendor Discovery
- [ ] Vendor search with filters works
- [ ] Vendor cards display correctly
- [ ] Vendor profile modal/panel loads

### 8. Contract Workflow
- [ ] Contract creation from booking works
- [ ] Organizer signing works
- [ ] Vendor signing works
- [ ] Contract timeline displays

### 9. Notification Center
- [ ] Notification list loads
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Notification grouping (Today/This Week/Earlier) works

### 10. Profile & Settings
- [ ] Organizer profile loads and saves
- [ ] Vendor profile loads and saves
- [ ] Admin settings loads and saves
- [ ] Unsaved changes warning works

### 11. Error States
- [ ] Error boundary catches render errors
- [ ] Crash screen shows with retry option
- [ ] Toast notifications appear for actions
- [ ] Error messages are user-friendly

### 12. Loading States
- [ ] Skeleton loaders show during data fetch
- [ ] Buttons show loading spinner during submission
- [ ] Empty states show when no data

### 13. Responsive Design
- [ ] Desktop layout (1280px+) works
- [ ] Tablet layout (768px) works
- [ ] Mobile layout (375px) works
- [ ] No horizontal scrolling on any page

### 14. Accessibility
- [ ] All pages have semantic headings
- [ ] Forms have associated labels
- [ ] Modals trap focus and close with Escape
- [ ] Color is never the only indicator of status
- [ ] Skip to content link is available
