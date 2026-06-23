# Frontend Routes

Routes are centralized in `frontend/src/routes/routeConstants.ts` and rendered in `frontend/src/routes/index.tsx`.

## Public

- `/`
- `/login`
- `/register`

## Authenticated

- `/onboarding`
- `/notifications`

## Organizer

- `/organizer`
- `/organizer/procurement`
- `/organizer/portfolio`
- `/organizer/compare`
- `/organizer/reports`
- `/organizer/profile`

## Vendor

- `/vendor`
- `/vendor/reports`
- `/vendor/profile`

## Admin

- `/admin`
- `/admin/reports`
- `/admin/settings`

Role guards redirect unauthenticated users to `/login`, incomplete profiles to `/onboarding`, and unauthorized users to the unauthorized page.
