# Frontend Reports And Export

Phase 6 adds role-specific report pages:

- `/organizer/reports`
- `/vendor/reports`
- `/admin/reports`

Reports are built from existing frontend services and render metric cards plus tabular data.

## Export

- CSV: generated client-side with `reportToCsv` and downloaded through the browser.
- Print: calls `window.print()`.
- PDF: intentionally remains a clear frontend placeholder pending backend document generation.
