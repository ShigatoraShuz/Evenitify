# Eventify Frontend Skill Documentation

## Role
Creative Frontend Engineer & UI/UX Designer

## Description
The Frontend Engineer is responsible for delivering a pixel-perfect, responsive, and engaging Eventify user experience while maintaining a strict React + TypeScript MVVM architecture. The role combines UI/UX design execution, component engineering, ViewModel-driven state management, accessible interfaces, and clean API consumption through service layers.

## Primary Mission
Build the Organizer procurement UI, Vendor B2B dashboard, contract tracking screens, and role-specific navigation in a way that is visually clear, maintainable, and ready for production.

---

## Required Architecture: MVVM

Eventify must follow **Model-View-ViewModel** with explicit directory boundaries.

### MVVM Responsibility Matrix

| Layer | Directory | Responsibility | Allowed | Not Allowed |
|---|---|---|---|---|
| Model | `models/` | Define feature data structure. | TypeScript interfaces, types, enums, constants, default values. | API calls, React hooks, JSX, runtime business logic. |
| ViewModel | `viewmodels/` | Manage state, effects, validation orchestration, derived values, and service calls. | Custom hooks, form handlers, loading/error state, transformations, API orchestration. | JSX, layout rendering, visual markup. |
| View | `views/` | Render page layout and bind to ViewModel. | JSX/TSX composition, passing ViewModel state/handlers to components. | API calls, heavy computation, direct business logic. |
| Components | `components/` | Render reusable UI pieces for one feature. | Presentational UI, props, small local visual state only when necessary. | Global data fetching, hidden business rules. |
| Services | `services/` | Communicate with backend APIs. | API client wrappers, endpoint functions, request/response normalization. | UI rendering and React lifecycle logic. |
| Shared | `shared/` | Store cross-feature UI and shared types. | Design system components, layout shells, generic badges/modals. | Feature-specific procurement rules. |
| Utils | `utils/` | Hold pure helper functions. | Formatting, string helpers, route helpers, pure calculations. | React state, API orchestration, JSX. |

---

## MVVM Data Flow

```txt
User Action
   ↓
View event handler binding
   ↓
ViewModel method
   ↓
Validation and state update
   ↓
Service call
   ↓
Backend API / Supabase-backed endpoint
   ↓
Service response normalization
   ↓
ViewModel updates state and derived values
   ↓
View re-renders UI from ViewModel output
```

### Example Binding Rule

The View may call the ViewModel hook and bind returned state and handlers:

```tsx
export function VendorProcurementView() {
  const vm = useVendorProcurement()

  return (
    <ProcurementShell
      selectedEvent={vm.selectedEvent}
      requirements={vm.requirements}
      vendors={vm.filteredVendors}
      loading={vm.loading}
      error={vm.error}
      onFilterChange={vm.updateFilters}
      onSubmitBooking={vm.submitBookingRequest}
    />
  )
}
```

The View must not call `fetch`, `axios`, `supabase`, or direct backend functions.

---

## Feature Directory Standard

```txt
src/features/vendor-procurement/
├── components/
│   ├── ProcurementStepper.tsx
│   ├── RequirementCard.tsx
│   ├── VendorBookingCard.tsx
│   ├── VendorFilterPanel.tsx
│   └── BookingSummaryPanel.tsx
├── models/
│   └── vendor-procurement.model.ts
├── viewmodels/
│   └── useVendorProcurement.ts
└── views/
    └── VendorProcurementView.tsx
```

### Naming Standards

| Item | Convention | Example |
|---|---|---|
| View file | PascalCase + `View` | `VendorProcurementView.tsx` |
| ViewModel hook | `use` + Feature Name | `useVendorProcurement.ts` |
| Model file | kebab-case + `.model.ts` | `vendor-procurement.model.ts` |
| Component | PascalCase | `VendorFilterPanel.tsx` |
| Service | camelCase + `Service` | `bookingService.ts` |
| Types | PascalCase | `BookingRequest`, `LargeEvent` |
| Enums | PascalCase | `BookingStatus`, `RequirementStatus` |

---

## Frontend Execution Standards

### 1. View Standards

Views must remain layout-focused and readable.

#### Allowed in Views

- Calling exactly one main ViewModel hook per page when possible.
- Passing ViewModel state and handlers to components.
- Rendering route-level page structure.
- Conditional rendering based on ViewModel state.

#### Not Allowed in Views

- `fetch`, `axios`, or direct Supabase calls.
- Complex data transformations.
- Business validation rules.
- Long `useEffect` blocks.
- Mutating API payloads directly.

---

### 2. ViewModel Standards

ViewModels are custom React hooks that act as the feature brain.

#### Required ViewModel Responsibilities

| Responsibility | Description |
|---|---|
| Load data | Fetch event, requirement, vendor, booking, contract, and notification data through services. |
| Track state | Maintain loading, error, selected item, form state, filter state, and modal state. |
| Validate | Run client validation before service calls. |
| Transform | Convert API responses into UI-friendly structures. |
| Derive | Compute progress, counts, grouped data, and status summaries. |
| Orchestrate | Coordinate multi-step actions such as create event → add requirement → search vendor → submit booking. |

#### ViewModel Output Shape

```ts
interface VendorProcurementViewModel {
  selectedEvent: LargeEvent | null
  requirements: EventRequirement[]
  filters: VendorFilterState
  filteredVendors: VendorSearchResult[]
  selectedVendor: VendorSearchResult | null
  selectedRequirement: EventRequirement | null
  loading: boolean
  submitting: boolean
  error: string | null
  progressSteps: ProcurementStep[]
  updateFilters: (nextFilters: Partial<VendorFilterState>) => void
  selectRequirement: (requirementId: string) => void
  selectVendor: (vendorId: string) => void
  submitBookingRequest: (payload: BookingFormInput) => Promise<void>
  resetError: () => void
}
```

---

### 3. Model Standards

Models are pure TypeScript definitions.

#### Example Model File

```ts
export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'changes_requested'
  | 'contract_sent'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export interface LargeEvent {
  id: string
  organizerId: string
  title: string
  eventDate: string
  venue: string
  budget: number
  expectedGuests: number
  status: 'draft' | 'planning' | 'booking' | 'confirmed' | 'completed' | 'cancelled'
}

export interface EventRequirement {
  id: string
  eventId: string
  category: string
  quantity: number
  minBudget?: number
  maxBudget?: number
  requirementStatus: 'open' | 'pending_booking' | 'fulfilled' | 'cancelled'
  notes?: string
}
```

Models must not export hooks, API functions, or JSX.

---

### 4. Service Standards

Services isolate API details from ViewModels.

#### Example Service Pattern

```ts
export async function createBookingRequest(input: CreateBookingRequestInput) {
  return apiClient.post<BookingRequest>('/procurement-requests', input)
}
```

#### Rules

- Services must return typed data.
- Services must normalize API errors.
- Services must not use React hooks.
- Services must not show toast messages.
- Services must not contain component logic.

---

## UI/UX Standards

### Visual Direction

| Area | Requirement |
|---|---|
| Brand style | Minimalist, professional, B2B procurement-focused. |
| Layout | Clean dashboards, clear cards, spacious content, strong hierarchy. |
| Text | Short labels, useful helper text, no clutter. |
| Status | Use consistent status chips for Pending, Accepted, Contract Sent, Confirmed, Completed, Cancelled. |
| Vendor B2B distinction | B2B requests must be visibly separated from personal customer bookings. |
| Responsiveness | Every main flow must work on mobile, tablet, laptop, and desktop. |

### Core Screens to Design

| Screen | Main UX Goal |
|---|---|
| Landing/Auth | Explain Eventify and move user into correct role. |
| Organizer Dashboard | Let Organizer choose or create a Large Event. |
| Event Setup | Collect event details with minimal friction. |
| Requirements Workspace | Add procurement needs by category. |
| Vendor Discovery | Search, filter, compare, and select Vendors. |
| Booking Request | Confirm event, requirement, Vendor, date, budget, and notes. |
| Event Portfolio | Track all Vendor statuses in one place. |
| Vendor B2B Dashboard | Review Organizer/Large Event requests separately from personal requests. |
| Contract Tracking | View contract status and next action. |
| Admin Dashboard | Review users, bookings, Vendors, and issues. |

---

## Component Quality Rules

| Rule | Requirement |
|---|---|
| Props | Components must receive typed props. |
| Reuse | Shared UI goes in `src/shared/components`. |
| Feature UI | Feature-specific components stay inside the feature folder. |
| Size | Split large components after they exceed one clear responsibility. |
| Accessibility | Interactive components require labels, focus styles, and keyboard support. |
| Loading states | Every API-backed region needs loading, empty, and error states. |
| No hidden fetching | Components must not fetch data internally unless they are explicitly service widgets approved by architecture. |

---

## State Management Rules

| State Type | Location |
|---|---|
| Page loading/error state | ViewModel |
| Form state | ViewModel or form hook called from ViewModel |
| Filter state | ViewModel |
| Modal open/close state | ViewModel when business-related; component local state when purely visual |
| Session state | Auth ViewModel or global auth provider |
| Cross-feature state | Minimal global store only when required |

---

## Testing Responsibilities

| Test Type | Scope |
|---|---|
| Unit tests | ViewModel transformations, validation functions, utility functions. |
| Component tests | Forms, cards, filters, status badges, dashboards. |
| Integration tests | Organizer create event → requirement → vendor search → booking request. |
| Accessibility tests | Keyboard navigation, labels, modal focus trap, color contrast. |
| Responsive checks | Mobile, tablet, desktop breakpoints. |

---

## Frontend Definition of Done

A frontend task is complete only when:

- The feature follows MVVM boundaries.
- The View contains no API calls.
- Types are explicit and reusable.
- Loading, empty, error, and success states exist.
- UI is responsive and accessible.
- All route guards work for expected roles.
- Feature is tested or has a documented test path.
- Build passes without TypeScript errors.
