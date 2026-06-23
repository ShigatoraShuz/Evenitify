# Frontend MVVM Rules

The frontend follows feature-scoped MVVM.

## Models

- Store domain types, constants, scoring weights, labels, and pure helpers.
- Do not import React.

## ViewModels

- Own state, service calls, derived data, and command handlers.
- Keep mock data access in services or service-level mock placeholders.
- Return typed props that Views can render directly.

## Views

- Render props and local UI-only state such as modal open/closed state.
- Do not fetch data directly.
- Do not define mock datasets.
- Keep navigation and route guards in wrappers or route modules.

## Shared

- Reusable components and hooks live under `frontend/src/shared`.
- Broadly reusable services live under `frontend/src/services`.
